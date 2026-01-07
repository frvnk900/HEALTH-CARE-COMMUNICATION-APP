from langchain_google_genai import ChatGoogleGenerativeAI
import os
import dotenv
import pathlib 


def llm() -> ChatGoogleGenerativeAI:
 
    dotenv.load_dotenv(dotenv_path=str(pathlib.Path(__file__).resolve().parents[1] / "utilities" / "secret" / ".env"))
    
    
    return ChatGoogleGenerativeAI(
        api_key=str(os.getenv("GEMINI_API_KEY")).strip(),
        model=str(os.getenv("GEMINI_MODEL", "gemini-2.5-flash")).strip(),
        verbose=True, 
    )