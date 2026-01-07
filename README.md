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
  
