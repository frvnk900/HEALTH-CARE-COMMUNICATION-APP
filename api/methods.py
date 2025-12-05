import os
import random
from datetime import datetime
import string,pathlib,json
from typing import Tuple



def generate_random_filename(extension: str) -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=12)) + extension

def save_user_uploaded_file(
    file,   
    storage_path: str,
    required_extensions: Tuple[str, ...]
) -> Tuple[bool, str]:
    try:
    
        filename = file.filename
        _, file_extension = os.path.splitext(filename)
        file_extension = file_extension.lower()

    
        if file_extension not in required_extensions:
            return False, f"File extension '{file_extension}' not allowed."

     
        os.makedirs(storage_path, exist_ok=True)

 
        new_filename = generate_random_filename(file_extension)
        new_file_path = os.path.join(storage_path, new_filename)
        file.save(new_file_path)   

        return True, new_filename

    except Exception as e:
        return False, f"An error occurred: {e}"


def read_data(email:str) -> bool:
    Data = pathlib.Path(__file__).resolve().parents[1] / "database" / "data.json"  

    with open(Data, mode='r') as f:
        data = json.load(f) 
    for i in data:
        if email == i.get("email"):
            return True
    return False 

def add_new_user(data:dict) -> bool: 
    FILE_PATH = pathlib.Path(__file__).resolve().parents[1] / "database" / "data.json"  
    try:
        if not os.path.exists(FILE_PATH):
            with open(FILE_PATH, 'w') as f:
                json.dump([], f)

        with open(FILE_PATH, 'r') as f: 
            json_data = json.load(f) 
            json_data.append(data)
            
            with open(FILE_PATH, 'w') as f:
                json.dump(json_data, f , indent=4) 
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False 
    
def get_login_details(email: str, password: str):
    Data = pathlib.Path(__file__).resolve().parents[1] / "database" / "data.json"

    with open(Data, "r") as f:
        data = json.load(f)

    
    for user in data:
        if user.get("email") == email and user.get("password") == password:
            return user 
    return None   


 
from typing import List

def load_conversation_to_validated_user(user_id: str) -> tuple[bool, List[dict]]:
    STORAGE_DIR = pathlib.Path(__file__).resolve().parents[1] / "database" / "conversations"
    FILE_PATH = STORAGE_DIR / f"{user_id}.json"

    try:
        os.makedirs(STORAGE_DIR, exist_ok=True)
    except OSError as e:
        print(f"Error creating directory {STORAGE_DIR}: {e}")
        return False, []

 
    if os.path.exists(FILE_PATH):
        try:
            with open(FILE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)

             
            if isinstance(data, list):
                return True, data

            
            print(f"Content of {FILE_PATH} is not a list — resetting file.")
            return False, []

        except json.JSONDecodeError:
            print(f"JSON decode error in {FILE_PATH}. Resetting conversation file.")
            return False, []

        except IOError as e:
            print(f"I/O error while reading {FILE_PATH}: {e}")
            return False, []

     
    try:
        with open(FILE_PATH, "w", encoding="utf-8") as f:
            json.dump([], f)
        return True, []

    except IOError as e:
        print(f"Could not create conversation file {FILE_PATH}: {e}")
        return False, []


def get_user_validated_profile(user_id) -> tuple[bool, dict]:
    FILE_PATH = pathlib.Path(__file__).resolve().parents[1]  / "database" / "data.json"
    

    if not os.path.exists(str(FILE_PATH)):
        return False, {"error": "Failed to Load data from server."}

    try:
         
        with open(FILE_PATH, "r") as f:
            users = json.load(f)

        if not isinstance(users, list):
            return False, {"error": "Corrupted database format (expected list)"}

      
        user = next((u for u in users if u.get("user_id") == user_id), None)

        if not user:
            return False, {"error": "User not found"}

         
        sanitized = {
            key: value 
            for key, value in user.items()
            if key not in ("password", "schedule")
        }

        return True, sanitized

    except Exception as e:
        print(e)
        return False, {"error": str(e)} 
 
def delete_user_conversation(user_id: str) -> tuple[bool, str]:
     try:
          FILE_PATH = pathlib.Path(__file__).resolve().parents[1] / "database" / "conversations" / f"{user_id}.json"
          if os.path.exists(FILE_PATH):
              os.remove(FILE_PATH)
              return True, "Conversation deleted successfully"
          else:
              return False, "Conversation file not found. Try refreshing the page."
     except Exception as e:
          return False, str(e) 

def edit_user_info(user_id: str, data_to_edit: dict) -> tuple[bool, str]:
    FILE_PATH =  str(pathlib.Path(__file__).resolve().parents[1] / "database"/ "data.json")

    if not os.path.exists(FILE_PATH):
        return False, "Database file not found"

    try:
        
        with open(FILE_PATH, "r") as f:
            users = json.load(f)

        if not isinstance(users, list):
            return False, "Corrupted database format (expected list)"

        
        user_index = next((i for i, u in enumerate(users) if u.get("user_id") == user_id), None)

        if user_index is None:
            return False, "User not found"

        user = users[user_index]

         
        forbidden_fields = {"password", "schedule", "user_id"}

         
        for key, value in data_to_edit.items():
            if key in forbidden_fields:
                continue   
            if key in user:
                user[key] = value

         
        with open(FILE_PATH, "w") as f:
            json.dump(users, f, indent=4)

        return True, "User information updated successfully"

    except Exception as e:
        return False, str(e) 
    

 

 
def load_dash_bord_info(user_id) -> dict:
    CONVE = pathlib.Path(__file__).resolve().parents[1] / "database" / "conversations" / f"{user_id}.json"
    DATA = pathlib.Path(__file__).resolve().parents[1] / "database" / "data.json" 
    TIP  = pathlib.Path(__file__).resolve().parents[1] / "database" / "tips.json"
    DASH_BOARD_DATA = {}
 
    try:
        with open(CONVE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        data = []

  
    try:
        with open(DATA, "r", encoding="utf-8") as f:
            user_data = json.load(f)
    except FileNotFoundError:
        user_data = []

 
    times = []
    for item in data:
        time_str = item.get("time")
        if time_str:
            try:
                times.append(datetime.fromisoformat(time_str))
            except ValueError:
                pass
    DASH_BOARD_DATA["latest_time"] = max(times).isoformat() if times else "N/A"

    
    DASH_BOARD_DATA["total_charts"] = len(data)

    
    DASH_BOARD_DATA["location"] = "Unknown"
    for user_location in user_data:
        if user_id == user_location.get("user_id"):
            DASH_BOARD_DATA["location"] = user_location.get("location", "Unknown")
            break

 
    try:
        with open(TIP, "r", encoding="utf-8") as f:
            tips_data = json.load(f)
        DASH_BOARD_DATA["health_tip_of_the_day"] = random.choice(tips_data)
    except (FileNotFoundError, IndexError):
        DASH_BOARD_DATA["health_tip_of_the_day"] = {}

     
    DASH_BOARD_DATA["number_of_schedules"] = 0
    for schedules in user_data:
        if user_id == schedules.get("user_id"):
            DASH_BOARD_DATA["number_of_schedules"] = len(schedules.get("schedule", []))
            break

    return DASH_BOARD_DATA

 


 
