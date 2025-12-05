import json,pathlib 
import random
import json
import pathlib

def load_user_profile(user_id) -> str:
    DATA_PATH = pathlib.Path(__file__).resolve().parents[0] / "data.json"
    try:
        with open(DATA_PATH, "r") as file:
            meta_data = json.load(file)
        if len(meta_data) > 0:
            for user_info in meta_data:
                if user_info.get("user_id") == user_id:
                    username = user_info.get("user_id", "(unknown)")
                    name = user_info.get("username", "(unknown)")
                    location = user_info.get("location", "(unknown)")
                    email = user_info.get("email", "(unknown)")
                    gender = user_info.get("gender", "(unknown)")
                    schedule = user_info.get("schedule", [])

                    return (
                        f"username: {username}\n"
                        f"gender: {gender}\n"
                        f"name: {name}\n"
                        f"location: {location}\n"
                        f"email: {email}\n"
                        f"schedule: {schedule}"
                    )
            
            return "User not found" 
        else:
            return "No profile set."
    except FileNotFoundError:
        return "Data file not found"
    except json.JSONDecodeError:
        return "Error decoding JSON data" 
    except Exception as exc:
        return f"An unexpected error occurred: {exc}" 
    
def load_user_uploaded_doc(user_id, user_uploaded_file=None) -> str:
    DATA_PATH = pathlib.Path(__file__).resolve().parents[0] / "data.json"
    try:
        with open(DATA_PATH, "r") as file:
            meta_data = json.load(file)
    
        for user_info in meta_data:
            if user_info.get("user_id") == user_id: 
                file_path = pathlib.Path(__file__).resolve().parents[0] / "uploads"/ user_uploaded_file 
                
                return str(file_path)
            
    except FileNotFoundError:   
        return "Data file not found"
    except json.JSONDecodeError:
        return "Error decoding JSON data" 
    except Exception as exc:
        return f"An unexpected error occurred: {exc}"  
    