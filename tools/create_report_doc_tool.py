from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from pydantic import BaseModel
import os, pathlib, re


class CreateReportToolShema(BaseModel):
    filename: str
    title: str
    body: str


def parse_markdown(md: str):
    """
    Convert Markdown input into ReportLab Flowables:
    - Headings (# ...)
    - Bold (**text**)
    - Bullet lists (- item)
    - Paragraphs
    """

    styles = getSampleStyleSheet()
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=11, leading=14)
    heading_style = ParagraphStyle("Heading", parent=styles["Heading1"], fontSize=14, leading=16, spaceAfter=12)

    lines = md.split("\n")
    flowables = []
    bullet_buffer = []  

    def flush_bullets():
        """Convert buffered bullets into a ListFlowable"""
        nonlocal bullet_buffer
        if bullet_buffer:
            list_items = [ListItem(Paragraph(item, body_style)) for item in bullet_buffer]
            flowables.append(ListFlowable(list_items, bulletType="bullet", leftIndent=20))
            bullet_buffer = []

    for line in lines:
        line = line.strip()

         
        if line.startswith("# "):
            flush_bullets()
            text = line[2:].strip()
            flowables.append(Paragraph(f"<b>{text}</b>", heading_style))
            continue

        
        if line.startswith("- "):
            bullet_buffer.append(line[2:].strip())
            continue

    
        line = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", line)

        
        if line:
            flush_bullets()
            flowables.append(Paragraph(line, body_style))

         
        else:
            flush_bullets()
            flowables.append(Spacer(1, 0.1 * inch))

    flush_bullets()
    return flowables


def create_report_tool(filename: str, title: str, body: str) -> str:
    """
    Create a PDF file using Markdown-compatible content.
    """
    try:
        UPLOADS_DIR = pathlib.Path(__file__).resolve().parents[1] / "database" / "uploads"
        filepath = os.path.join(UPLOADS_DIR, filename)

        doc = SimpleDocTemplate(filepath, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Title style
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Title'],
            alignment=1,
            fontSize=20,
            spaceAfter=20
        )

        # Add title
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 0.25 * inch))

        # Convert markdown → structured flowables
        flowables = parse_markdown(body)
        story.extend(flowables)

        doc.build(story)

        return f"<a href='http://127.0.0.1:8001/files/download/{filename}' download>click here to download {filename}</a>"

    except Exception as err:
        return f'Internal server error: {err}' 
body = """
<b><font size="14">PATIENT INFORMATION</font></b><br/>
• <b>Name:</b> John Wimana<br/>
• <b>Gender:</b> Male<br/>
• <b>Location:</b> Dowa<br/>
• <b>Email:</b> Yfrvnk@yahoo.com<br/><br/>

<b><font size="14">DATE OF REPORT</font></b><br/>
November 27, 2025<br/><br/>

<b><font size="14">HISTORY OF PRESENT ILLNESS</font></b><br/>
(Not provided)<br/><br/>

<b><font size="14">PAST MEDICAL HISTORY</font></b><br/>
(Not provided)<br/><br/>

<b><font size="14">CURRENT SYMPTOMS</font></b><br/>
• Dizziness (reported as occurring "nowadays")<br/><br/>

<b><font size="14">OBSERVATIONS / USER NOTES</font></b><br/>
• Patient has scheduled appointments for medication and hospital visits<br/>
• Multiple appointments scheduled for Thursday<br/><br/>
"""


# print(create_report_tool(filename="me.pdf",title="Patient Report",body=body))