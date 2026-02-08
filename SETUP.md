# ResumeAI - Full Stack Application

A comprehensive AI-powered resume analysis and career guidance platform built with React + Flask.

## Quick Start

### Prerequisites
- **Node.js** 16+ (for frontend)
- **Python** 3.8+ (for backend)
- **npm** or **yarn** (for frontend package management)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

Backend will run at `http://localhost:5000`

### 2. Frontend Setup

```bash
# In the root directory
npm install

# Start development server
npm run dev
```

Frontend will run at `http://localhost:5173`

### 3. Access the Application

Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
bhuvana-final-project/
├── src/                          # React TypeScript frontend
│   ├── components/               # React components
│   │   ├── landing/             # Landing page components
│   │   ├── ui/                  # UI component library (shadcn/ui)
│   │   └── NavLink.tsx
│   ├── pages/                   # Page components
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Jobs.tsx
│   │   ├── NotFound.tsx
│   │   └── Index.tsx
│   ├── services/                # API client
│   │   └── api.ts              # Centralized API service
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities
│   ├── App.tsx
│   └── main.tsx
│
├── backend/                     # Flask Python backend
│   ├── app.py                  # Flask app factory
│   ├── config.py               # Configuration
│   ├── models.py               # Database models
│   ├── requirements.txt         # Python dependencies
│   ├── routes/                 # API endpoints
│   │   ├── auth.py            # Authentication
│   │   ├── resume.py          # Resume management
│   │   ├── jobs.py            # Job matching
│   │   ├── chatbot.py         # AI chatbot
│   │   ├── assessments.py     # Assessments
│   │   └── photo.py           # Photo analysis
│   ├── utils/                 # Utility functions
│   │   ├── jwt_utils.py       # JWT handling
│   │   ├── resume_parser.py   # PDF parsing
│   │   ├── job_matcher.py     # Job matching
│   │   ├── photo_analyzer.py  # CV photo analysis
│   │   └── chatbot_handler.py # Q&A system
│   ├── uploads/               # User uploads
│   │   ├── resumes/
│   │   └── photos/
│   └── resumeai.db           # SQLite database
│
├── public/                    # Static assets
├── package.json              # Frontend dependencies
├── vite.config.ts           # Vite config
└── README.md                # This file
```

## Features

### 1. **User Authentication**
- Register new account with email and password
- Login with JWT token-based authentication
- Token expires after 30 days
- Persistent sessions using localStorage

### 2. **Resume Upload & Analysis**
- Upload PDF resumes
- Automatic skill extraction using regex/keyword matching
- ATS (Applicant Tracking System) score calculation
- Extracts email and phone number
- View historical resume analyses

### 3. **Smart Job Matching**
- Matches resume skills with available job postings
- Calculates match percentage (0-100%)
- Displays 5 sample jobs ranked by relevance
- Shows required skills for each job
- Real-time job recommendations

### 4. **AI Career Chatbot**
- Answer career-related questions
- Topics: Interview prep, Resume tips, Skills, Job search, Career growth, Salary negotiation
- Keyword-based Q&A system
- Predefined suggestions for quick access
- No external API required

### 5. **Skill Assessments**
- Multiple-choice questions (MCQ) format
- Sample assessments: Python Fundamentals, React Concepts
- Automatic scoring with 60% pass threshold
- Assessment history tracking
- Detailed feedback on performance

### 6. **Professional Photo Analysis**
- Upload LinkedIn-style profile photos
- Computer vision analysis using OpenCV
- Scores 5 metrics:
  - **Professionalism**: Professional appearance
  - **Lighting**: Quality and consistency
  - **Background**: Appropriateness and clarity
  - **Composition**: Framing and centering
  - **Overall**: Average score
- AI feedback and improvement suggestions

### 7. **Account Settings**
- Update profile information
- Notification preferences
- Privacy settings
- Data preferences
- Account management options

## Technology Stack

### Frontend
- **React** 18 - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Lucide Icons** - Icons
- **Sonner** - Toast notifications
- **shadcn/ui** - Component library

### Backend
- **Flask** - Web framework
- **Flask-CORS** - CORS support
- **Flask-SQLAlchemy** - ORM
- **SQLite** - Database
- **PyJWT** - JSON Web Tokens
- **PyPDF2** - PDF parsing
- **OpenCV** - Image analysis
- **Python** - Programming language

## API Documentation

### BASE URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/register` - Create account
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (requires token)
- `GET /auth/verify-token` - Verify token validity

### Resume Endpoints
- `POST /resume/upload` - Upload and analyze resume
- `GET /resume/get` - Get resume analysis
- `DELETE /resume/delete` - Delete resume

### Job Endpoints
- `GET /jobs/matches` - Get matched jobs
- `GET /jobs/all` - Get all jobs
- `GET /jobs/<id>` - Get job details

### Chatbot Endpoints
- `POST /chatbot/ask` - Ask a question
- `GET /chatbot/suggestions` - Get suggestions

### Assessment Endpoints
- `GET /assessments/list` - List assessments
- `GET /assessments/<id>` - Get assessment
- `POST /assessments/submit` - Submit answers
- `GET /assessments/history` - Get history

### Photo Endpoints
- `POST /photo/upload` - Upload photo
- `GET /photo/get` - Get analysis
- `DELETE /photo/delete` - Delete photo
- `GET /photo/sample-analysis` - Get sample

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

## File Uploads

- **Resumes**: PDF format, max 16 MB
- **Photos**: PNG, JPG, JPEG, GIF, WebP, max 16 MB
- Files saved in `backend/uploads/` directory

## Database

- **Type**: SQLite
- **Location**: `backend/resumeai.db`
- **Auto-created** on first backend run

### Tables
- **Users** - User accounts and credentials
- **Resumes** - Uploaded resumes and analysis results
- **Jobs** - Job postings
- **Assessments** - Assessment templates
- **AssessmentQuestions** - MCQ questions
- **UserAssessments** - User's assessment results
- **PhotoAnalysis** - Photo analysis results

## Development

### Frontend Development
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview build
npm run lint       # Run ESLint
```

### Backend Development
```bash
python app.py              # Start server
python -m flask --app app run --debug  # Debug mode
```

## Environment Variables

### Backend (.env in /backend)
```env
FLASK_ENV=development
JWT_SECRET_KEY=your-secret-key
MAX_CONTENT_LENGTH=16777216
```

### Frontend
Frontend connects to backend at `http://localhost:5000/api`

## Common Issues

### 1. Port Already in Use
- Backend (5000): Kill process or change port in app.py
- Frontend (5173): Kill process or use different port

### 2. CORS Errors
- Ensure backend is running
- Frontend must connect to `http://localhost:5000`
- Backend has CORS enabled for all origins in development

### 3. Database Errors
- Delete `backend/resumeai.db` to reset
- Ensure `backend/uploads/` directory exists

### 4. Photo Analysis Errors
- Ensure OpenCV is installed: `pip install opencv-python`
- Image file format should be: PNG, JPG, JPEG, GIF, WebP

### 5. Resume Parser Errors
- Resume must be in PDF format
- PDF file should contain extractable text (not scanned image)
- File size must be under 16 MB

## Testing

### Test User Credentials
After running the app, you can create a test account:
- Email: `test@example.com`
- Password: `password123`

### API Testing
Use Postman or curl to test endpoints:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
```

## Deployment

Both frontend and backend are ready for deployment:
- **Frontend**: Deploy to Vercel, Netlify, or GitHub Pages
- **Backend**: Deploy to Heroku, AWS, DigitalOcean, or similar

See individual README files in `src/` and `backend/` for deployment instructions.

## Performance Optimizations

- Lazy loading of components
- Image optimization
- Code splitting with Vite
- Database query optimization
- JWT token caching on frontend

## Security Features

- Password hashing with werkzeug
- JWT token-based authentication
- CORS protection
- File upload validation
- SQL injection prevention with SQLAlchemy ORM
- File type validation
- Request size limits

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the [Backend README](./backend/README.md)
2. Visit the documentation
3. Create an issue on GitHub

## Future Enhancements

- [ ] Real LLM integration for chatbot
- [ ] Machine learning for job matching
- [ ] LinkedIn profile import
- [ ] Email notifications
- [ ] Advanced resume templates
- [ ] Video interview prep
- [ ] Salary comparison tool
- [ ] Networking suggestions

---

**Happy Job Hunting! 🚀**
