import json
import pathlib

def load_reference_data() -> str:
    DATA_PATH = pathlib.Path(__file__).resolve().parents[0] / "documents" / "knowledge.json"

    with open(DATA_PATH, "r") as file:
        data = json.load(file)

    # Build a combined docstring for ALL objects in the JSON list
    all_docs = []

    for disease in data:
        disease_name = disease.get("disease", "Unknown Disease")
        signs = disease.get("signs", [])
        causes = disease.get("causes", [])
        prevention = disease.get("prevention", [])
        treatment = disease.get("treatment", [])
        advice = disease.get("advice", [])
        malawi_context = disease.get("malawi_context", [])

        
        block = f'''
------------------------
Disease: {disease_name}

SIGNS:
{_format_list(signs)}

CAUSES:
{_format_list(causes)}

PREVENTION:
{_format_list(prevention)}

TREATMENT:
{_format_list(treatment)}

ADVICE:
{_format_list(advice)}

MALAWI CONTEXT:
{_format_list(malawi_context)}
------------------------
'''.strip()

        all_docs.append(block)
       
    
    return "\n\n".join(all_docs)


def _format_list(items):
    """Helper: formats a list of strings into clean bullet points."""
    if not items:
        return "  - (Not provided)"
    return "\n".join(f"  - {item}" for item in items)

 
# print(load_disease_docstring())
