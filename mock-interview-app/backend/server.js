import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import interviewRoutes from './routes/interview.js';
import answerRoutes from './routes/answer.js';
import reportRoutes from './routes/report.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/answer', answerRoutes);
app.use('/api/report', reportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Mock Interview API is running (Local Storage Mode)',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Mock Interview API',
    mode: 'Local Storage (No Database Required)',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      interview: {
        domains: 'GET /api/interview/domains',
        questions: 'GET /api/interview?domain=Java',
        start: 'POST /api/interview/start'
      },
      answer: {
        submit: 'POST /api/answer/submit',
        get: 'GET /api/answer/:interviewId'
      },
      report: {
        generate: 'GET /api/report/generate/:interviewId'
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`💾 Using local file storage (no database required)`);
});
