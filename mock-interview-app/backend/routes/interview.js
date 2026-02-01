import express from 'express';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Interviews } from '../services/localStorageService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// GET /api/interview - Get questions for a domain
router.get('/', async (req, res) => {
  try {
    const { domain } = req.query;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a domain parameter'
      });
    }

    // Read questions from JSON file
    const questionsPath = join(__dirname, '../data/questions.json');
    const questionsData = JSON.parse(await readFile(questionsPath, 'utf-8'));

    const domainQuestions = questionsData.domains[domain];

    if (!domainQuestions) {
      return res.status(404).json({
        success: false,
        message: `No questions found for domain: ${domain}`,
        availableDomains: Object.keys(questionsData.domains)
      });
    }

    res.json({
      success: true,
      domain,
      totalQuestions: domainQuestions.length,
      questions: domainQuestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
});

// GET /api/interview/domains - Get available domains
router.get('/domains', async (req, res) => {
  try {
    const questionsPath = join(__dirname, '../data/questions.json');
    const questionsData = JSON.parse(await readFile(questionsPath, 'utf-8'));

    res.json({
      success: true,
      domains: Object.keys(questionsData.domains)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching domains',
      error: error.message
    });
  }
});

// POST /api/interview/start - Start a new interview (protected)
router.post('/start', protect, async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a domain'
      });
    }

    // Read questions from JSON file
    const questionsPath = join(__dirname, '../data/questions.json');
    const questionsData = JSON.parse(await readFile(questionsPath, 'utf-8'));

    const domainQuestions = questionsData.domains[domain];

    if (!domainQuestions) {
      return res.status(404).json({
        success: false,
        message: `No questions found for domain: ${domain}`
      });
    }

    // Create interview session
    const interview = await Interviews.create({
      userId: req.user._id,
      domain,
      status: 'in-progress',
      questions: domainQuestions.map(q => ({
        questionId: q.id,
        questionText: q.question,
        category: q.category,
        difficulty: q.difficulty
      }))
    });

    res.status(201).json({
      success: true,
      message: 'Interview started successfully',
      data: {
        interviewId: interview._id,
        domain: interview.domain,
        totalQuestions: interview.questions.length,
        questions: interview.questions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting interview',
      error: error.message
    });
  }
});

export default router;
