# Mock Interview Practice Application

An AI-powered mock interview practice application where users can practice interview questions across multiple domains and receive instant AI-powered feedback.

## Features

- 🎯 **10 Interview Domains**: Java, Python, Data Science, Cloud, QA, HR, Electrical, JavaScript, React, System Design
- 🤖 **AI-Powered Evaluation**: Get instant feedback and scores on your answers
- 📊 **Detailed Reports**: Receive comprehensive reports with strengths, gaps, and recommendations
- 💾 **No Database Required**: Uses local file storage for easy setup
- 🔐 **User Authentication**: JWT-based authentication system

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Storage**: Local JSON files
- **AI**: Modular AI service (supports Gemini, OpenAI, or mock evaluation)

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/mock-interview-app.git
cd mock-interview-app
```

### 2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Start the servers
```bash
# Terminal 1 - Backend (port 5001)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

### 4. Open the app
Navigate to http://localhost:5173

## Optional: Enable AI Evaluation

Add your API key to `backend/.env`:
```env
AI_API_KEY=your-gemini-api-key
AI_PROVIDER=gemini
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/interview/domains` | Get available domains |
| GET | `/api/interview?domain=Java` | Get questions for domain |
| POST | `/api/interview/start` | Start interview session |
| POST | `/api/answer/submit` | Submit answer for evaluation |
| GET | `/api/report/generate/:id` | Generate interview report |

## Project Structure

```
mock-interview-app/
├── backend/
│   ├── routes/          # API routes
│   ├── services/        # AI & storage services
│   ├── middleware/      # Auth middleware
│   ├── data/            # Sample questions
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── context/     # State management
│   │   └── services/    # API client
│   └── index.html
└── README.md
```

## License

MIT
