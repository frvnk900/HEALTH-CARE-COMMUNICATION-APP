 
from langchain_core.prompts import PromptTemplate 
import pathlib,sys 
from langchain_core.output_parsers import PydanticOutputParser

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))
from model.llm import llm 
 
from templates.general_health_template import COMPREHENSIVE_HEALTHCARE_AI_SYSTEM_PROMPT 
from templates.system_template import SYSTEM_TEMPLATE 
from templates.report_writing_template import REPORT_WRITING_SYSTEM_PROMPT 
sys.path.append(str(pathlib.Path(__file__).resolve().parents[0]))
from report_schema import MedicalReportOutput


GENERAL_TEMPLATE = PromptTemplate.from_template(template=COMPREHENSIVE_HEALTHCARE_AI_SYSTEM_PROMPT) 
PARSER =  PydanticOutputParser(pydantic_object=MedicalReportOutput)
format_instructions = PARSER.get_format_instructions()

REPORT_WRITING_TEMPLATE = PromptTemplate.from_template(template=REPORT_WRITING_SYSTEM_PROMPT).partial(format_instructions=format_instructions)

ROUTING_TEMPLATE = PromptTemplate(
    input_variables=['conversation_history', 'reference_data', 'user_input'],
    template=SYSTEM_TEMPLATE 
) | llm()


CHAINS = {
   
    "GeneralHealth": GENERAL_TEMPLATE | llm(),
    "WriteDocument": REPORT_WRITING_TEMPLATE | llm() | PARSER
}



