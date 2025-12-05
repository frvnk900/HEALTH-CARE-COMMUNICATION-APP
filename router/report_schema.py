from pydantic import BaseModel, Field

class MedicalReportOutput(BaseModel):
    """Structured output schema for medical report generation."""

    title: str = Field(
        ...,
        description="A concise title for the report based on the patient's symptoms and provided information."
    )

    filename: str = Field(
        ...,
        description="A PDF-friendly file name for the report (e.g., 'malaria_symptoms_report.pdf')."
    )

    body: str = Field(
        ...,
        description=(
            "The full formatted medical report body. Must include all required sections:\n"
            "1. Patient Information\n"
            "2. Date of Report\n"
            "3. History of Present Illness\n"
            "4. Past Medical History\n"
            "5. Current Symptoms\n"
            "6. Observations / User Notes\n"
            "7. Medications Mentioned by User\n"
            "8. Timeline of Events\n"
            "9. Additional Notes\n"
            "10. Summary of Provided Information\n\n"
            "If a section has no information, write '(Not provided)'.\n"
            "The report body must be PDF-friendly and ready for export."
        )
    )
