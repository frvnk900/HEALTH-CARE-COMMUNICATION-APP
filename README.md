# HealthCareAI - Medical Assistant Platform 
  
HealthCareAI is an AI-powered medical assistant platform that helps users manage their health information, generate medical reports, and receive personalized healthcare recommendations. The platform combines advanced AI models with medical image generation capabilities to provide comprehensive healthcare support. 
  
## Features  
  
- **User Authentication**: Secure registration and login system with JWT tokens  
- **AI-Powered Medical Assistance**: Gemini AI integration for medical queries and advice  
- **Medical Report Generation**: Create professional medical reports in PDF format  
- **Medical Image Generation**: Generate medical-related images using AI  
- **Health Scheduling**: Appointment and reminder management system  
- **Document Upload**: Support for PDF and text document uploads  
- **Real-time Communication**: WebSocket-based chat functionality  
- **User Profile Management**: Complete user profile management system 
  
## Tech Stack  
  
- **Backend**: Python Flask with Flask-SocketIO  
- **AI/ML**: Google Gemini API, LangChain, LangGraph  
- **PDF Generation**: xhtml2pdf  
- **Image Generation**: FreePik API  
- **Database**: File-based storage (database directory)  
- **Frontend Communication**: RESTful API with WebSocket support  
- **Authentication**: JWT-based authentication 
  
## Installation  
  
1. **Clone the repository** (if available) or download the source code  
2. **Install Python dependencies**:  
   pip install -r requirements.txt  
  
3. **Set up environment variables**:  
   Create a .env file in the utilities/secret/ directory with the following:  
   GEMINI_API_KEY=your_gemini_api_key_here  
   GEMINI_MODEL=gemini-2.5-flash  
   FREEPIK_API_KEY=your_freepik_api_key_here  
  
4. **Directory Structure**:  
   Ensure the following directories exist:  
   - database/uploads/ - for storing user uploads and generated files  
   - utilities/secret/ - for storing the .env file 
  
## Environment Variables  
  
- GEMINI_API_KEY: Google Gemini API key for AI functionality  
- GEMINI_MODEL: Gemini model to use (default: gemini-2.5-flash)  
- FREEPIK_API_KEY: FreePik API key for medical image generation 
  
## API Endpoints  
  
### Authentication  
- POST /auth/v1/register-user - User registration  
- POST /auth/v1/login - User login  
  
  
## API Endpoints  
  
### Authentication  
- POST /auth/v1/register-user - User registration  
- POST /auth/v1/login - User login 
  
  
### Chat and AI  
- POST /chat/v1/messages - Send messages to AI assistant  
- WebSocket /chat/v1/ai/stream-chat - Real-time chat streaming 
  
  
### Scheduling  
- GET /schedule/v1/schedules - Get user schedules  
- POST /schedule/v1/new - Create new schedule  
- POST /schedule/v1/update - Update schedule 
  
  
### User Management  
  
  
### User Management  
- GET /user/v1/dashboard/user_id - Get user dashboard info  
- GET /user/v1/profile/ - Get user profile  
- PUT /user/v1/profile/ - Update user profile  
- DELETE /user/delete/conversation - Delete chat conversation 
  
  
### File Management  
- GET /uploads/filename - Serve uploaded files  
- GET /files/download/filename - Download generated files 
  
  
## Usage  
  
### User Registration  
Register a new user by sending a POST request to /auth/v1/register-user with form data including:  
- username  
- gender  
- email  
- password  
- phone  
- age  
- location  
- profile_image (file) 
  
  
### AI Chat  
Send messages to the AI assistant via WebSocket or REST API:  
1. Connect to WebSocket endpoint /chat/v1/ai/stream-chat with user_id  
2. Send messages to /chat/v1/messages with user_id and user_input  
  
### Report Generation  
The system automatically generates medical reports in PDF format when the AI receives structured data with:  
- title  
- filename  
- body (HTML content) 
  
  
### Image Generation  
Generate medical images by providing an image prompt in the format:  
{  
  "image_prompt": "description of the medical image needed"  
} 
  
  
## Project Structure  
  
HEALTH COM/  
��� ai/                    # AI logic and response handling  
��� api/                   # Flask API endpoints  
�   ��� configuration/     # Configuration files  
��� data/                  # Data management  
��� database/              # Database and file storage  
�   ��� uploads/           # User uploads and generated files  
��� memory/                # Conversation memory management  
��� model/                 # AI model configuration  
��� notifications/         # Notification and reminder system  
��� router/                # AI routing logic  
��� templates/             # Template files  
��� tools/                 # Utility tools (report generation, image generation)  
��� UI/                    # User interface (if any)  
��� utilities/             # Utility functions  
�   ��� secret/            # Secret files (.env)  
��� requirements.txt       # Python dependencies  
��� README.md             # This file 
  
  
## AI Capabilities  
  
The system uses Google's Gemini AI model to:  
- Answer medical questions  
- Generate medical reports  
- Analyze uploaded documents  
- Provide health recommendations  
- Generate medical images based on prompts 
  
  
## Security  
  
- JWT-based authentication for secure API access  
- File upload validation and sanitization  
- Secure password handling  
- Protected file download endpoints 
  
  
## Development  
  
To run the application locally:  
python api/api.py  
  
The server will start on http://127.0.0.1:8001 
  
  
## Contributing  
  
1. Fork the repository  
2. Create a feature branch  
3. Make your changes  
4. Add tests if applicable  
5. Submit a pull request 
  
  
## License  
  
This project is licensed under the MIT License - see the LICENSE file for details. 
  
  
## Support  
  
For support, please contact the development team or create an issue in the repository. 
  
  
## Disclaimer  
  
This application is for educational and informational purposes only. It is not intended to provide medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns. 
