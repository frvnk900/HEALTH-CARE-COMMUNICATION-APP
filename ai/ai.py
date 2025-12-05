import pathlib,sys 
sys.path.append(str(pathlib.Path(__file__).resolve().parents[1])) 
 
from model.llm import llm
from router.model_router import CHAINS,ROUTING_TEMPLATE 
import ast
from tools.create_report_doc_tool import create_report_tool , CreateReportToolShema 
 
from tools.read_document_tool import read_document 
from memory.conversation import load_conversation, write_conversations 
from langchain.agents import initialize_agent, AgentType 
from langchain_core.tools import StructuredTool 
from templates.agent_prompt import agent_prompt
from database.database_manager import load_user_profile , load_user_uploaded_doc
from data.data_manager import load_reference_data


 
write_report_tool = StructuredTool(
    name = "write report",
    func=create_report_tool,
    handle_tool_error=True,
    verbose=True,
    return_direct=True,
    handle_validation_error=True,
    args_schema=CreateReportToolShema
   ) 



 
def is_dict_string(s: str) -> bool:
 
    if not isinstance(s, str):
        return False
    try:
        result = ast.literal_eval(s)
        return isinstance(result, dict)
    except (ValueError, SyntaxError):
        return False

def get_ai_response(user_id: str, user_input: str, user_uploaded_file: str = None) -> tuple[bool, str]:
    try:
 
        try:
            Agent = initialize_agent(
                llm=llm(),
                tools=[write_report_tool],
                agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
                verbose=True,
                agent_kwargs={"prefix": agent_prompt}
            )
        except Exception as e:
            print("AGENT INIT ERROR:", e)
            return False, f"Failed to initialize AI agent: {e}"
 
        try:
            get_route_response = ROUTING_TEMPLATE.invoke({
                "user_input": user_input,
                "conversation_history": load_conversation(user_id),
                "reference_data": load_reference_data(),
            })
            route_key = getattr(get_route_response, "content", "").strip()
        except Exception as e:
            print("ROUTING ERROR:", e)
            return False, f"Routing failed: {e}"

        print("choosing router")
        print(route_key)

        route = CHAINS.get(route_key)

     
        if route is None:
            print("NO ROUTER FOUND → Returning fallback response")

            fallback = (
                "I couldn't determine the correct assistant module for your request, "
                "but I'm still here to help. Could you clarify what you're trying to do?"
            )

            write_conversations(user_id, "user", user_input, uploaded_file=user_uploaded_file)
            write_conversations(user_id, "ai", fallback)

            return True, fallback
 
        try:
            router_output = route.invoke({
                "user_input": user_input,
                "conversation_history": load_conversation(user_id),
                "user_profile": load_user_profile(user_id),
                "reference_data": load_reference_data(),
                "user_uploaded_files_or_text": read_document(
                    filepath=load_user_uploaded_doc(
                        user_id=user_id,
                        user_uploaded_file=user_uploaded_file
                    )
                ),
            })
        except Exception as e:
            print("ROUTER EXECUTION ERROR:", e)
            return False, f"Router execution failed: {e}"

        
        output_text = getattr(router_output, "content", str(router_output))
        print("ROUTER OUTPUT:", output_text)

      
        requires_agent = all(key in output_text for key in ["title", "filename"])

        if requires_agent:
            print("Required keys found → invoking Agent")

            try:
                agent_response = Agent.invoke({"input": output_text})
            except Exception as e:
                print("AGENT INVOCATION ERROR:", e)
                return False, f"Agent failed to generate report: {e}"

         
            final_output = (
                agent_response.get("output")
                if isinstance(agent_response, dict)
                else str(agent_response)
            )

            write_conversations(user_id, "user", user_input, uploaded_file=user_uploaded_file)
            write_conversations(user_id, "ai", final_output)

            return True, final_output

    
        print("No agent call required → returning router output")

        write_conversations(user_id, "user", user_input, uploaded_file=user_uploaded_file)
        write_conversations(user_id, "ai", output_text)

        return True, output_text

 
    except ConnectionError as co_err:
        print("Connection error:", co_err)
        return False, "Failed to connect to the internet"

    except Exception as err:
        print("❌ INTERNAL ERROR:", err)
        return False, f"Internal server error: {err}"
