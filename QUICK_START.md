# ⚡ Quick Start Guide - ResumeAI

## Start the System (2 Steps)

### Terminal 1: Backend
```bash
cd backend
python -m flask --app app run --debug
```
Wait for: `Running on http://127.0.0.1:5000` ✅

### Terminal 2: Frontend  
```bash
npm run dev
```
Wait for: `Local: http://localhost:5173` ✅

### Open Browser
```
http://localhost:5173
```

---

## Quick Test: Create Account

1. **Go to Register** → http://localhost:5173/register
2. **Fill in form:**
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
3. **Click Register**
4. **Expected:** Redirects to Dashboard ✅

---

## Quick Test: API Call (curl)

```bash
# Test registration API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "curluser",
    "email": "curl@test.com",
    "password": "password123"
  }'

# Expected response:
# {"message": "User registered successfully", "token": "eyJ...", "user": {...}}
```

---

## Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| Port 5000 in use | `netstat -ano \| findstr :5000` then kill it |
| Port 5173 in use | Kill other Vite process |
| `npm ERR!` | Run `npm install` first |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| Database error | Delete `backend/resumeai.db` and restart |
| CORS error | Ensure backend is running |

---

## File Locations

| What | Where |
|------|-------|
| Backend code | `backend/` |
| Frontend code | `src/` |
| API endpoints | `backend/routes/` |
| Database | `backend/resumeai.db` |
| Environment config | `backend/.env` |
| Frontend API client | `src/services/api.ts` |
| Authentication context | `src/contexts/AuthContext.tsx` |

---

## API Endpoints Cheat Sheet

### Auth (No token needed)
```
POST /api/auth/register
POST /api/auth/login
```

### Auth (Token needed)
```
GET /api/auth/profile
GET /api/auth/verify-token
```

### Resume (Token needed)
```
POST /api/resume/upload (file upload)
GET /api/resume/get
DELETE /api/resume/delete
```

### Jobs (Token needed)
```
GET /api/jobs/matches
GET /api/jobs/all
GET /api/jobs/{id}
```

### Chatbot (Token needed)
```
POST /api/chatbot/ask
GET /api/chatbot/suggestions
```

### Assessments (Token needed)
```
GET /api/assessments/list
GET /api/assessments/{id}
POST /api/assessments/submit
GET /api/assessments/history
```

### Photo (Token needed)
```
POST /api/photo/upload (file upload)
GET /api/photo/get
DELETE /api/photo/delete
GET /api/photo/sample-analysis
```

---

## Test Data Available

**Sample Jobs (5):**
1. Senior Frontend Developer - TechCorp (React, TypeScript)
2. Full Stack Engineer - StartupXYZ (React, Node, PostgreSQL)
3. React Developer - Digital Agency (React, JavaScript)
4. Software Engineer - BigCorp (Java, Spring, Kubernetes)
5. Python Developer - DataCorp (Python, Django, PostgreSQL)

**Sample Assessments (2):**
1. Python Fundamentals (beginner, 3 questions)
2. React Concepts (intermediate, 3 questions)

**Sample Chatbot Categories:**
- Interview preparation
- Resume & portfolio tips
- Skill development
- Job search strategies
- Career progression
- Salary negotiation

---

## Key Fixes Applied

✅ Config attribute names corrected
✅ Import paths fixed in route files
✅ AuthContext uses real API calls
✅ NumPy/OpenCV compatibility solved
✅ All packages installed & verified
✅ Package initialization files added
✅ Database models all working

---

## Documentation Files

- `ROOT_CAUSE_ANALYSIS.md` - Detailed breakdown of all issues & fixes
- `VERIFICATION_REPORT.md` - Complete system verification
- `backend/README.md` - Backend API documentation
- `README.md` - Main project README

---

## Need Help?

1. **Backend issues?** Check `backend/` terminal output
2. **Frontend issues?** Check browser console (F12)
3. **API issues?** Use `curl` to test directly
4. **Database issues?** Delete `backend/resumeai.db` and restart

---

**Status: ✅ Ready to use**  
**Last Updated: Feb 8, 2026**
