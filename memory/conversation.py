import json, pathlib, os
from datetime import datetime


def load_conversation(user_id) -> str:
    FILE_PATH = pathlib.Path(__file__).resolve().parents[1] / "database" / "conversations" / f"{user_id}.json"
    
    CONVERSATION = """no conversation started yet."""
    if os.path.exists(FILE_PATH):
        with open(FILE_PATH, 'r') as f:
            data = json.load(f) 
        if isinstance(data, list):
            if len(data) < 1:
               return CONVERSATION
            else:
                for item in data:
                    CONVERSATION += f"\n---------\n role:{item['role']}\n content:{item['content']}\n time:{item['time']}"
                return CONVERSATION 
    else:
        with open(FILE_PATH, 'w') as f:
            json.dump([], f) 
        return CONVERSATION 
    
def write_conversations(user_id, role, content, created_report: str = None , uploaded_file=None) -> str:
    FILE_PATH = pathlib.Path(__file__).resolve().parents[1] / "database" / "conversations" / f"{user_id}.json"
    CONVERSATION = {"role": role, "content": content, "time": datetime.now().isoformat(), "created_report": created_report, "uploaded_file": uploaded_file} 
    if not os.path.exists(FILE_PATH):
        with open(FILE_PATH, 'w') as f:
            json.dump([], f)

    with open(FILE_PATH, 'r') as f: 
        json_data = json.load(f) 
        json_data.append(CONVERSATION)
        
        with open(FILE_PATH, 'w') as f:
            json.dump(json_data, f ,indent=4)