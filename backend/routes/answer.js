import express from 'express';
import { Responses, Interviews } from '../services/localStorageService.js';
import { protect } from '../middleware/auth.js';
import { evaluateAnswer } from '../services/aiService.js';

const router = express.Router();

// POST /api/answer/submit - Submit an answer for evaluation
router.post('/submit', protect, async (req, res) => {
  try {
    const { interviewId, questionId, questionText, userAnswer } = req.body;

    // Validation
    if (!interviewId || !questionId || !questionText || !userAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Please provide interviewId, questionId, questionText, and userAnswer'
      });
    }

    // Verify interview exists and belongs to user
    const interview = await Interviews.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.userId !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit answers for this interview'
      });
    }

    // Evaluate the answer using AI
    const evaluation = await evaluateAnswer(questionText, userAnswer, interview.domain);

    // Check if answer already exists for this question
    let response = await Responses.findOne({
      interviewId,
      questionId
    });

    if (response) {
      // Update existing answer with new evaluation
      response = await Responses.updateById(response._id, {
        userAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        idealAnswer: evaluation.idealAnswer,
        evaluatedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      });
    } else {
      // Create new response with evaluation
      response = await Responses.create({
        interviewId,
        userId: req.user._id,
        questionId,
        questionText,
        userAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        idealAnswer: evaluation.idealAnswer,
        evaluatedAt: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Answer submitted and evaluated successfully',
      data: {
        responseId: response._id,
        questionId: response.questionId,
        userAnswer: response.userAnswer,
        score: response.score,
        feedback: response.feedback,
        idealAnswer: response.idealAnswer,
        submittedAt: response.submittedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting answer',
      error: error.message
    });
  }
});

// GET /api/answer/:interviewId - Get all answers for an interview
router.get('/:interviewId', protect, async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Verify interview exists and belongs to user
    const interview = await Interviews.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.userId !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view answers for this interview'
      });
    }

    const responses = await Responses.find({ interviewId });

    res.json({
      success: true,
      interviewId,
      totalAnswers: responses.length,
      answers: responses.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching answers',
      error: error.message
    });
  }
});

export default router;
