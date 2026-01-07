from pydantic import BaseModel, Field

class MedicalImagePrompt(BaseModel):
    """
    Schema for AI-generated medical illustration prompts.

    This ensures:
    - The AI outputs only educational or UI-demo style medical illustrations.
    - No real medical scans, diagnoses, or clinical claims are included.
    - Output format is strictly {"image_prompt": "<text>"}.

    Fields:
    - image_prompt (str): A safe, descriptive prompt for a medical illustration generator.
    """
    image_prompt: str = Field(
        ...,
        description=(
            "A text prompt describing a medical illustration or educational diagram. "
            "Must avoid real scans, diagnoses, or clinical instructions. "
            "Example: 'Medical illustration of human lungs showing pneumonia, "
            "educational diagram, flat style, labeled anatomy, white background.'"
        )
    )
