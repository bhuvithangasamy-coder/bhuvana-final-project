# ResumeAI Backend

This is the Flask backend API for the ResumeAI application. It provides endpoints for resume analysis, job matching, AI chatbot, assessments, and photo analysis.

## Setup Instructions

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create a virtual environment (recommended):**
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Run the Flask app:**
```bash
# Development mode with auto-reload
python -m flask --app app run --debug

# Or using
python app.py
```

The API will start at `http://localhost:5000`

## Environment Variables (Optional)

Create a `.env` file in the backend directory:
```env
FLASK_ENV=development
JWT_SECRET_KEY=your-secret-key
MAX_CONTENT_LENGTH=16777216
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Login and get JWT token
- `GET /auth/profile` - Get logged-in user profile (requires token)
- `GET /auth/verify-token` - Verify if token is valid

### Resume (`/api/resume`)
- `POST /resume/upload` - Upload PDF resume and analyze it
- `GET /resume/get` - Get user's resume analysis results
- `DELETE /resume/delete` - Delete user's resume

### Jobs (`/api/jobs`)
- `GET /jobs/matches` - Get jobs matched to user's resume skills
- `GET /jobs/all` - Get all available jobs
- `GET /jobs/<job_id>` - Get specific job details

### Chatbot (`/api/chatbot`)
- `POST /chatbot/ask` - Ask a career question and get AI response
- `GET /chatbot/suggestions` - Get suggested questions for the chatbot

### Assessments (`/api/assessments`)
- `GET /assessments/list` - Get all available assessments
- `GET /assessments/<id>` - Get specific assessment with questions
- `POST /assessments/submit` - Submit assessment answers and get score
- `GET /assessments/history` - Get user's assessment history

### Photo Analysis (`/api/photo`)
- `POST /photo/upload` - Upload photo and get professionalism analysis
- `GET /photo/get` - Get user's photo analysis
- `DELETE /photo/delete` - Delete user's photo and analysis
- `GET /photo/sample-analysis` - Get sample analysis for demo

## Database

- **Type:** SQLite
- **Location:** `resumeai.db` (created automatically on first run)
- **Tables:** User, Resume, Job, Assessment, AssessmentQuestion, UserAssessment, PhotoAnalysis

## Features

### 1. Resume Analysis
- Extracts text from PDF resumes using PyPDF2
- Identifies skills using keyword matching
- Calculates ATS (Applicant Tracking System) score
- Extracts contact information (email, phone)

### 2. Job Matching
- Compares extracted resume skills with job requirements
- Calculates match percentage (0-100%)
- Ranks jobs by match percentage
- Includes 5 sample jobs for demonstration

### 3. AI Chatbot
- Provides career advice on multiple topics:
  - Interview preparation
  - Resume and portfolio tips
  - Skill development
  - Job search strategies
  - Career progression
  - Salary negotiation
- Keyword-based Q&A system (no LLM required)

### 4. Photo Analysis
- Analyzes professional photo using OpenCV (computer vision)
- Scores 5 metrics:
  - **Professionalism**: Overall professional appearance
  - **Lighting**: Quality and consistency of lighting
  - **Background**: Neutral, appropriate background
  - **Composition**: Framing and centering of face
  - **Overall**: Average of all metrics
- Provides feedback and improvement suggestions

### 5. Assessments
- Multiple-choice question (MCQ) format
- Sample assessments:
  - Python Fundamentals
  - React Concepts
- Automatic scoring
- Assessment history tracking

## Architecture

```
backend/
├── app.py                 # Flask app factory
├── config.py              # Configuration settings
├── models.py              # SQLAlchemy database models
├── requirements.txt       # Python dependencies
├── routes/
│   ├── auth.py           # Authentication endpoints
│   ├── resume.py         # Resume management endpoints
│   ├── jobs.py           # Job matching endpoints
│   ├── chatbot.py        # Chatbot endpoints
│   ├── assessments.py    # Assessment endpoints
│   └── photo.py          # Photo analysis endpoints
├── utils/
│   ├── jwt_utils.py      # JWT token handling
│   ├── resume_parser.py  # PDF parsing and skill extraction
│   ├── job_matcher.py    # Job matching algorithm
│   ├── photo_analyzer.py # Photo analysis using OpenCV
│   └── chatbot_handler.py # Career Q&A database
└── uploads/
    ├── resumes/          # Uploaded resume PDFs
    └── photos/           # Uploaded profile photos
```

## Authentication

All endpoints except register and login require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Token expires after 30 days.

## File Upload Limits

- Maximum file size: 16 MB
- Allowed resume formats: PDF only
- Allowed photo formats: PNG, JPG, JPEG, GIF, WebP

## Error Handling

All endpoints return JSON responses with appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (missing/invalid data)
- `401` - Unauthorized (token missing/invalid)
- `404` - Not found (resource doesn't exist)
- `500` - Server error

## Testing

To test the API, you can use:
- **Postman** - API testing tool
- **curl** - Command line
- **Frontend integration** - Using the provided ApiService class

Example curl request:
```bash
curl -X GET http://localhost:5000/api/chatbot/suggestions \
  -H "Authorization: Bearer <your_token>"
```

## Notes for College Project

This implementation is designed to be:
1. **Explainable** - Uses simple algorithms (no black-box ML models)
2. **Educational** - Shows practical use of APIs, databases, and AI concepts
3. **Functional** - All features work without external APIs
4. **Scalable** - Easy to add more assessments or job matches

## Troubleshooting

### Port 5000 already in use
```bash
# On Windows
netstat -ano | findstr :5000
Kill the process: taskkill /PID <PID> /F

# On macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Database issues
Delete `resumeai.db` and restart the app to reset the database.

### CORS errors
Ensure Flask-CORS is installed and the app is running with `CORS(app)` enabled (already done in app.py).

### Python/NumPy/OpenCV Compatibility
- Ensure `numpy<2` is installed (use `pip install 'numpy<2'`)
- OpenCV may require recompilation with compatible NumPy version
- If OpenCV issues persist, a mock photo analyzer is included as fallback

### Backend Not Starting
1. Ensure all packages are installed: `pip install -r requirements.txt`
2. Verify Python version: `python --version` (should be 3.8+)
3. Check imports: `python -c "from app import create_app"`
4. Look for syntax errors: `python -m py_compile app.py`

## Current Status (February 2026)

**✅ Working:**
- Flask backend with all core APIs
- Authentication (register, login, profile)
- Resume upload and parsing
- Job matching algorithm
- Chatbot with Q&A database
- Assessments with MCQ engine
- Photo analyzer (mock version)
- Database models and relationships
- JWT token security
- CORS support

**⚠️ Known Issues:**
- OpenCV/NumPy compatibility: Using mock photo analyzer instead
- Photo analysis currently returns simulated scores

**📋 Next Steps:**
1. Test API endpoints with Postman or curl
2. Test frontend integration by running `npm run dev`
3. Implement real OpenCV photo analysis when environment is stable
4. Add more test jobs and assessment questions
5. Deploy to production with proper WSGI server

## Next Steps

1. Install dependencies: `pip install -r requirements.txt`
2. Run the backend: `python app.py`
3. Frontend will call APIs at `http://localhost:5000/api`
4. Check [Frontend README](../README.md) for frontend setup
