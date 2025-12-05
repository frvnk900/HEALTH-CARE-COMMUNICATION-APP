from datetime import datetime
import pathlib,sys,os ,json
from typing import Optional







def get_user_schedule(user_id: str) -> list:
    try:
        FILE_DIR  = pathlib.Path(__file__).resolve().parents[1] / "database" / "data.json"
        with open(FILE_DIR, "r") as f:
            users = json.load(f)
 
        for user in users:
            if user.get("user_id") == user_id:
                return user.get("schedule")

        return []

    except FileNotFoundError:
        print("Error: JSON file not found.")
        return [] 
    


def normalize_time(timestr):
    if not timestr:
        return None
    timestr = timestr.replace(" ", "").lower()
    return datetime.strptime(timestr, "%I:%M%p").time()


def check_user_reminders(user_id: str):
 
    try:
        FILE_DIR = pathlib.Path(__file__).resolve().parents[1] / "database" / "data.json"
        with open(FILE_DIR, "r") as f:
            users = json.load(f)
    except FileNotFoundError:
        print("Error: JSON file not found.")
        return False, None

    user = next((u for u in users if u.get("user_id") == user_id), None)
    if not user:
        return False, None

    schedules = user.get("schedule", [])
    if not schedules:
        return False, None

    now = datetime.now()
    current_day = now.strftime("%A").lower()
    current_time_obj = normalize_time(now.strftime("%I:%M%p"))

    for sched in schedules:
        if not sched.get("active", False):
            continue

        ends_on_str = sched.get("ends_on")
        if ends_on_str:
            try:
                ends_on_date = datetime.strptime(ends_on_str, "%a/%d/%Y").date()
                if now.date() > ends_on_date:
                    continue
            except ValueError:
                pass

        for item in sched.get("calender_data", []):
            if not item.get("remind_me"):
                continue

            sched_day = item.get("day", "").lower()
            sched_time_obj = normalize_time(item.get("time"))

            if sched_day == current_day and sched_time_obj == current_time_obj:
               
                return True, sched.get("shedule_title", "Reminder!")

    return False, None


 


def update_user_schedule(user_id: str, new_end_on: Optional[str] = None, new_active: Optional[bool] = None) -> bool:
 
    try:
        FILE_DIR = pathlib.Path(__file__).resolve().parents[1] / "database" / "data.json"
        with open(FILE_DIR, "r") as f:
            users = json.load(f)
    except FileNotFoundError:
        print("JSON file not found.")
        return False
    
    user_found = False
    for user in users:
        if user.get("user_id") == user_id:
            user_found = True
            for sched in user.get("schedule", []):
                if new_end_on is not None:
                    sched["ends_on"] = new_end_on
                if new_active is not None:
                    sched["active"] = new_active
            break
    
    if not user_found:
        return False
   
    with open(FILE_DIR, "w") as f:
        json.dump(users, f, indent=4)
    
    return True

 

def add_user_schedule(user_id: str, new_schedule: dict) -> bool:
  
    try:
        FILE_DIR = pathlib.Path(__file__).resolve().parents[1] / "database" / "data.json"
        with open(FILE_DIR, "r") as f:
            users = json.load(f)
    except FileNotFoundError:
        print("JSON file not found.")
        return False

    user_found = False
    for user in users:
        if user.get("user_id") == user_id:
            user_found = True
            if "schedule" not in user or not isinstance(user["schedule"], list):
                user["schedule"] = []
            user["schedule"].append(new_schedule)
            
            break

    if not user_found:
        return False


    with open(FILE_DIR, "w") as f:
        json.dump(users, f, indent=4)

    return True

    
v = {
    "shedule_id":0,
    "shedule_title":"",
    "description":"",
    "_id":","
,    "active": True,
    "ends_on":"mon/11/2025",
    "calender_data":[
        {
            "time":None,"day":"monday" ,"remind_me":False
        },
        {
            "time":None,"day":"tuesday" ,"remind_me":False
        },
        {
            "time":"12:00pm","day":"wednesday" ,"remind_me":True
        },
        {
            "time":None,"day":"thursday" ,"remind_me":False
        },
        {
            "time":None,"day":"friday" ,"remind_me":False
        },
        {
            "time":None,"day":"saturday" ,"remind_me":False
        },
        {
            "time":None,"day":"sunday" ,"remind_me":False
        }

    ]
}
