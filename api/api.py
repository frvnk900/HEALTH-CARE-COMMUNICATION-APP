from datetime import timedelta
import string,random
from flask import Flask , request , jsonify , send_from_directory , abort
from flask_socketio import SocketIO, emit, join_room
from werkzeug.utils import secure_filename
from flask_cors import CORS
import jwt
from threading import Lock
import threading
import time
import pathlib,sys 
sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))
from methods import *
from configuration.config import Config
from notifications.notification_manager import check_user_reminders,update_user_schedule,add_user_schedule,get_user_schedule
from ai.ai import get_ai_response



app = Flask(__name__)
app.config.from_object(Config)
CORS(app=app)
socketio = SocketIO(app, cors_allowed_origins="*")
 

@app.route("/auth/v1/register-user", methods=["POST"])
def register_newuser():
     items = request.form.to_dict() 
     required_fields = [
          "username",
          "gender",
          "email",
          "password",
          "phone",
          "age",
          "location"
     ]
     profile_image = request.files.get("profile_image")

     for field in required_fields:
        if field not in items:
            return jsonify({"error": f"Missing field: {field}"}), 400 
        
     existing_email = read_data(email=items["email"])
     if existing_email:
         return jsonify({"error": "Email already registered"}), 409 
     else: 
         success, message = save_user_uploaded_file(
             file=profile_image,
             storage_path=app.config["UPLOAD_FOLDER"],
             required_extensions=app.config["ALLOWED_IMAGE_FILES"]
         )
         if not success:
             return jsonify({"error": message}), 400 
         
         user_data = {
             "username": items["username"],
             "user_id": "".join(random.choices(string.ascii_letters + string.digits, k=12)),
             "gender": items["gender"],
             "email": items["email"],
             "password": items["password"],
             "phone": items["phone"],
             "age": items["age"],
             "location": items["location"],
             "schedule":[],
             "profile_image": message  
         }

         if add_new_user(user_data):
             return jsonify({"message": "User registered successfully"}), 201
         else:
             return jsonify({"error": "Failed to register user"}), 500 
         

 

@app.route("/auth/v1/login", methods=["POST"])
def login_user():
    items = request.get_json()
    email = items.get("email")
    password = items.get("password")
    
    user = get_login_details(email=email, password=password)
    if not user:
        return jsonify({"error": "Invalid email or password"}), 403
    
    payload = {
        "email":email,
        "user_id": user.get("user_id"),
        "exp": datetime.utcnow() + timedelta(days=7)
    }

    token = jwt.encode(payload, app.config["SECRET_KEY_TOKEN"], algorithm="HS256")
    return jsonify({
        "message": "Login successful",
        "token": token
    }), 200

 
@app.route("/chat/v1/messages", methods=["POST"])
def chat_messages():
    user_id = request.form.get("user_id")
    user_input = request.form.get("user_input")
    user_uploaded_doc = request.files.get("user_uploaded_file")

    saved_file_path = None
    if user_uploaded_doc:
        filename = secure_filename(user_uploaded_doc.filename)
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
        saved_file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        user_uploaded_doc.save(saved_file_path)

    
    socketio.emit("stream_start", {"message": "Processing your request..."}, room=user_id)

    status, response = get_ai_response(
        user_id=user_id,
        user_input=user_input,
        user_uploaded_file=saved_file_path
    )

    if status:
        print("AI response generated successfully")
        
      
        socketio.emit("ai_response", {
            "response": str(response),
            "user_id": user_id
        }, room=user_id)
        
      
        return jsonify({"response": str(response)}), 200
    else:
        print("Failed to generate AI response")
         
        socketio.emit("error", {
            "error": str(response),
            "user_id": user_id
        }, room=user_id)
        return jsonify({"error": str(response)}), 500


 
       

@socketio.on("/chat/v1/ai/stream-chat") 
def stream_chat(data):
    user_id = data.get("user_id")
    if not user_id:
        emit("error", {"error": "user_id is required"})
        return

    join_room(user_id)
    emit("connected", {"message": "Chat stream connected"})

    
    status, conversation = load_conversation_to_validated_user(user_id)
    if status:
        # for msg in conversation:
            emit("new_message", conversation)
    else:
        emit("error", {"error": "Could not load history"})





@app.route("/schedule/v1/update", methods=["POST"])
def update_schedule_route():
 
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Missing JSON payload"}), 400

    user_id = data.get("user_id")
    new_end_on = data.get("new_end_on")  
    new_active = data.get("new_active")  

    if not user_id:
        return jsonify({"success": False, "message": "Missing user_id"}), 400

    success = update_user_schedule(user_id, new_end_on, new_active)

    if success:
        return jsonify({"success": True, "message": "Schedules updated successfully"})
    else:
        return jsonify({"success": False, "message": "Failed to update schedules (user may not exist)"})


 
@app.route("/schedule/v1/schedules", methods=["GET"])
def get_all_user_schedules():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"success": False, "message": "Missing user_id"}), 400
    schedules = get_user_schedule(user_id)

    if schedules is None or schedules == []:
        return jsonify({"success": False, "message": "No schedules found for this user"}), 404

    return jsonify({"success": True, "schedules": schedules}),200

 
@app.route("/schedule/v1/new", methods=["POST"])
def create_user_schedule():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"success": False, "message": "Missing user_id parameter"}), 400

    new_schedule = request.get_json()
    new_schedule["_id"] = random.randint(20000,90000)
    if not new_schedule:
        return jsonify({"success": False, "message": "Missing schedule data in request body"}), 400

    status = add_user_schedule(user_id, new_schedule)
    if status:
        return jsonify({"success": True, "message": "Schedule added successfully"}), 200
    else:
        return jsonify({"success": False, "message": "User not found or error occurred"}), 404


 
user_sockets = {} 

 
def monitor_reminders():
    """Continuous loop checking reminders for all connected users"""
    while True:
    
        for user_id, socket_id in list(user_sockets.items()):
            reminder_due, reminder_title = check_user_reminders(user_id)
            
            if reminder_due:
                socketio.emit(
                    "schedule_alert",
                    {
                        "success": True,
                        "reminder_title": reminder_title,
                        "user_id": user_id
                    },
                    room=socket_id 
                )
                print(f"Reminder sent to user {user_id}: {reminder_title}")
        
        time.sleep(1)  

 

@socketio.on('register')
def handle_register(data):
    user_id = data.get('user_id')
    if user_id:
        user_sockets[user_id] = request.sid
        join_room(request.sid)  
        emit('registered', {'user_id': user_id, 'status': 'monitoring_started'})

@socketio.on('disconnect_notification_user')
def handle_disconnect():
 
    for user_id, socket_id in list(user_sockets.items()):
        if socket_id == request.sid:
            del user_sockets[user_id]
            break


 

@socketio.on("connect")
def handle_connect():
        pass

@socketio.on("disconnect")
def handle_disconnect():
    pass

@app.route("/user/v1/dashboard/<string:user_id>", methods=["GET"])
def get_dashboard(user_id):
    try:
        dashboard_info = load_dash_bord_info(user_id)
        
        
        status, user_profile = get_user_validated_profile(user_id)
        if status:
            dashboard_info["username"] = user_profile.get("username", "User")
        
        return jsonify({
            "status": "success",
            "user_id": user_id,
            "dashboard": dashboard_info
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

 
 
@app.route("/user/v1/profile/", methods=["GET"])
def get_user_profile():
     
    user_id = request.args.get("user_id")
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
        
    status, data = get_user_validated_profile(user_id)
    if status:
        return jsonify({"user_profile": data}), 200
    else:
        print(data)
        return jsonify({"error": data.get("error", "Failed to fetch profile")}), 404
 
 
@app.route("/uploads/<filename>")
def serve_uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


 
@app.route("/user/v1/profile/", methods=["PUT"])
def update_user_profile():
    try:
        data_to_edit = request.get_json()
        if not data_to_edit:
            return jsonify({"error": "No data provided to update"}), 400

        user_id = data_to_edit.get("user_id")
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        status, message = edit_user_info(user_id, data_to_edit)
        if status:
            return jsonify({"message": message}), 200
        else:
            return jsonify({"error": message}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/user/delete/conversation", methods=["DELETE"])
def delete_chat_conversation():
    user_id = request.args.get("user_id") 
    
    try:
        status, message = delete_user_conversation(user_id)
        if status:
            return jsonify({"message": message}), 200
        else:
            return jsonify({"error": message}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/files/download/<filename>')
def download_file(filename):
    full_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    if not os.path.isfile(full_path):
        return abort(404)
    return send_from_directory(
        directory=app.config["UPLOAD_FOLDER"],
        path=filename,
        as_attachment=True
    )



if __name__ == "__main__":
    monitor_thread = threading.Thread(target=monitor_reminders, daemon=True)
    monitor_thread.start()
    socketio.run(app, debug=False,port=8001)