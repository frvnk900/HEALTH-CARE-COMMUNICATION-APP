import pathlib 
import random, string


 
class Config:
    UPLOAD_FOLDER = pathlib.Path(__file__).resolve().parents[2] / "database" / "uploads" 
    ALLOWED_IMAGE_FILES = (".png"  ,".jpeg", ".jpg")
    ALLOWED_DOC_FILES = (".pdf" , ".txt" )

    SECRET_KEY_TOKEN = "".join(random.choices(string.ascii_letters + string.digits, k=30))



 