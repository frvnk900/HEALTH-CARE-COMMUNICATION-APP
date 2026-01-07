import os
import dotenv
import pathlib
import requests
import time,random
import base64
from pydantic.v1 import BaseModel, Field



class IMAGEGENERATORSCHEMA(BaseModel):
    image_prompt:str


dotenv.load_dotenv(dotenv_path=str(pathlib.Path(__file__).resolve().parents[1] / "utilities" / "secret" / ".env"))

API_KEY = os.getenv("FREEPIK_API_KEY")
BASE_URL = "https://api.freepik.com"
HEADERS = {
    "x-freepik-api-key": API_KEY,
    "Content-Type": "application/json"
}


def generate_image(image_prompt: str, max_attempts: int = 30, delay: int = 2):
    """
    Generate a medical-related image using Freepik AI, poll for completion, and save as JPG.

    Parameters:
    - image_prompt (str): The descriptive prompt for image generation.
    - max_attempts (int): Maximum number of polling attempts (default 30).
    - delay (int): Delay between polling attempts in seconds (default 2).

    Returns:
    - str: HTML img tag with the path to the saved image file, or an error message.
    """

    try:
        # Check if API key is available
        if not API_KEY:
            return "<p style='color: red;'>Error: API key not found. Please configure your FreePik API key in the .env file.</p>"

        # Generate the medical image
        url = f"{BASE_URL}/v1/ai/text-to-image"
        payload = {
            "prompt": image_prompt,
            "num_images": 1,
            "image": {"size": "square_1_1"}
        }
        response = requests.post(url, headers=HEADERS, json=payload)
        response.raise_for_status()
        result = response.json()

        # For Classic fast endpoint, image is returned directly as base64
        if "data" in result and isinstance(result["data"], list):
            # Image returned immediately, save it directly
            response_data = result
        else:
            # For async endpoints, poll for status
            task_id = result.get("data", {}).get("task_id")
            if not task_id:
                return f"<p style='color: red;'>Error: Failed to initiate image generation. Please try again later.</p>"

            for _ in range(max_attempts):
                # Poll for task status
                status_url = f"{BASE_URL}/v1/ai/text-to-image/hyperflux/{task_id}"
                status_response = requests.get(status_url, headers=HEADERS)
                status_response.raise_for_status()
                status = status_response.json()
                task_status = status.get("data", {}).get("status")

                if task_status == "COMPLETED":
                    response_data = status
                    break
                elif task_status in ["FAILED", "ERROR"]:
                    return f"<p style='color: red;'>Error: Image generation failed. Please try a different prompt.</p>"

                time.sleep(delay)
            else:
                return f"<p style='color: red;'>Error: Image generation timed out. Please try again later.</p>"

        # Extract the base64 string from the response
        base64_string = response_data.get('data', [{}])[0].get('base64', '')

        if not base64_string:
            return f"<p style='color: red;'>Error: No image data received from the server. Please try again.</p>"

        # Decode the base64 string
        image_data = base64.b64decode(base64_string)
        filename = f"HealthCareAI_Generated_image_{random.randint(100,600000)}.png"
        UPLOADS_DIR = pathlib.Path(__file__).resolve().parents[1] / "database" / "uploads"

        # Ensure the uploads directory exists
        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

        filepath = os.path.join(UPLOADS_DIR, filename)

        # Write the image data to a file
        with open(filepath, 'wb') as image_file:
            image_file.write(image_data)

        return f"<img src='http://127.0.0.1:8001/uploads/{filename}' alt='image/jpg' />"

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            return f"<p style='color: red;'>Error: Invalid API key. Please check your FreePik API key configuration.</p>"
        elif e.response.status_code == 403:
            return f"<p style='color: red;'>Error: Access forbidden. Please check your API key permissions.</p>"
        elif e.response.status_code == 429:
            return f"<p style='color: red;'>Error: Too many requests. Please try again later.</p>"
        else:
            return f"<p style='color: red;'>Error: Request failed with status code {e.response.status_code}. Please try again.</p>"

    except requests.exceptions.ConnectionError:
        return f"<p style='color: red;'>Error: Unable to connect to the image generation service. Please check your internet connection.</p>"

    except requests.exceptions.Timeout:
        return f"<p style='color: red;'>Error: Request timed out. Please try again later.</p>"

    except requests.exceptions.RequestException:
        return f"<p style='color: red;'>Error: Network error occurred while generating the image. Please try again.</p>"

    except ValueError as e:
        print(e)
        return f"<p style='color: red;'>Error: Invalid image data received.</p>"

    except Exception as e:
        return f"<p style='color: red;'>Error: An unexpected error occurred while generating the image. Please try again. Details: {str(e)}</p>"