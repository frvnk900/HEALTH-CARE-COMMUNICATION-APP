from xhtml2pdf import pisa
from pydantic.v1 import BaseModel, Field
import os, pathlib


class CreateReportToolShema(BaseModel):
    filename: str = Field(description="The name of the file to create")
    body: str = Field(description="The body content of the report")




def create_report_tool(filename: str,body: str) -> str:
    """
    Create a PDF file using HTML content.
    """
    try:
        UPLOADS_DIR = pathlib.Path(__file__).resolve().parents[1] / "database" / "uploads"
        filepath = os.path.join(UPLOADS_DIR, filename)

        # The body parameter already contains the full HTML content
        html_content = body

        # Write HTML to PDF using xhtml2pdf
        with open(filepath, "wb") as pdf_file:
            pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)

        # If error then show the HTML content instead of PDF
        if pisa_status.err:
            return f'Error generating PDF: {pisa_status.err}'

        return f"<a href='http://127.0.0.1:8001/files/download/{filename}' download>click here to download {filename}</a>"

    except Exception as err:
        return f'Internal server error: {err}'