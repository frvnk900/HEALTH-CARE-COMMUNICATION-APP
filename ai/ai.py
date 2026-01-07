import pathlib
import sys
import ast
import asyncio

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))

from model.llm import llm
from router.model_router import CHAINS, ROUTING_TEMPLATE
from tools.create_report_doc_tool import create_report_tool, CreateReportToolShema
from tools.read_document_tool import read_document
from memory.conversation import load_conversation, write_conversations
from langchain.agents import initialize_agent, AgentType
from langchain_core.tools import StructuredTool
from templates.agent_prompt import agent_prompt
from database.database_manager import load_user_profile, load_user_uploaded_doc
from data.data_manager import load_reference_data
from tools.medical_image_generator import generate_image, IMAGEGENERATORSCHEMA


# -------------------------------
# TOOL DEFINITIONS
# -------------------------------

write_report_tool = StructuredTool(
    name="write_report",
    description="Generate a professional medical report PDF",
    coroutine=create_report_tool,
    args_schema=CreateReportToolShema,
    return_direct=True,
    handle_tool_error=True,
    handle_validation_error=True,
)

async def generate_image_async(image_prompt: str):
    return await asyncio.to_thread(generate_image, image_prompt)

generate_image_tool = StructuredTool(
    name="generate_medical_image",
    description="Generate a medical image using Freepik AI",
    coroutine=generate_image_async,
    args_schema=IMAGEGENERATORSCHEMA,
    return_direct=True,
    handle_tool_error=True,
    handle_validation_error=True,
)

TOOLS = [write_report_tool, generate_image_tool]


# -------------------------------
# HELPERS
# -------------------------------

def is_dict_string(s: str) -> bool:
    if not isinstance(s, str):
        return False
    try:
        return isinstance(ast.literal_eval(s), dict)
    except Exception:
        return False


# -------------------------------
# MAIN ENTRY POINT (ASYNC)
# -------------------------------

async def get_ai_response(
    user_id: str,
    user_input: str,
    user_uploaded_file: str | None = None
) -> tuple[bool, str]:

    try:
        # -------------------------------
        # AGENT INIT
        # -------------------------------
        Agent = initialize_agent(
            llm=llm(),
            tools=TOOLS,
            agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True,
            agent_kwargs={"prefix": agent_prompt},
        )

        # -------------------------------
        # ROUTING
        # -------------------------------
        route_response = await ROUTING_TEMPLATE.ainvoke({
            "user_input": user_input,
            "conversation_history": load_conversation(user_id),
            "reference_data": load_reference_data(),
        })

        route_key = getattr(route_response, "content", "").strip()
        route = CHAINS.get(route_key)

        if route is None:
            fallback = (
                "I couldn't determine the correct assistant module for your request. "
                "Please clarify what you want to do."
            )
            write_conversations(user_id, "user", user_input, uploaded_file=user_uploaded_file)
            write_conversations(user_id, "ai", fallback)
            return True, fallback

        # -------------------------------
        # ROUTE EXECUTION
        # -------------------------------
        router_output = await route.ainvoke({
            "user_input": user_input,
            "conversation_history": load_conversation(user_id),
            "user_profile": load_user_profile(user_id),
            "reference_data": load_reference_data(),
            "user_uploaded_files_or_text": read_document(
                filepath=load_user_uploaded_doc(
                    user_id=user_id,
                    user_uploaded_file=user_uploaded_file,
                )
            ),
        })

        output_text = getattr(router_output, "content", str(router_output))

        # -------------------------------
        # TOOL DECISION
        # -------------------------------
        has_report_keys = all(k in output_text for k in ("title", "filename"))
        has_image_key = "image_prompt" in output_text

        if has_report_keys or has_image_key:
            agent_response = await Agent.ainvoke({"input": output_text})

            final_output = (
                agent_response.get("output")
                if isinstance(agent_response, dict)
                else str(agent_response)
            )

            write_conversations(user_id, "user", user_input, uploaded_file=user_uploaded_file)
            write_conversations(user_id, "ai", final_output)
            return True, final_output

        # -------------------------------
        # NO TOOL NEEDED
        # -------------------------------
        write_conversations(user_id, "user", user_input, uploaded_file=user_uploaded_file)
        write_conversations(user_id, "ai", output_text)
        return True, output_text

    except ConnectionError:
        return False, "Internet connection error"

    except Exception as e:
        return False, f"Internal server error: {e}"
