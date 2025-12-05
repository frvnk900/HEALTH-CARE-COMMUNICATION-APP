from langchain_openai import ChatOpenAI 
import os , pathlib , sys 
import dotenv
dotenv.load_dotenv(dotenv_path=str(pathlib.Path(__file__).resolve().parents[1] / "utilities" / "secret" / '.env'))

def llm() -> ChatOpenAI: 
    return ChatOpenAI(
          api_key=str(os.getenv("OPENAI_API_KEY")).strip(),
          base_url=str(os.getenv("OPENAI_BASE_URL")).strip(),
          model=str(os.getenv("OPENAI_MODEL")).strip(),
          verbose=True,
          max_retries=5,   
          
    ) 

 