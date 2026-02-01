import express from 'express';
import { Responses, Interviews } from '../services/localStorageService.js';
import { protect } from '../middleware/auth.js';
import { evaluateAnswer, analyzeCommuncation } from '../services/aiService.js';

const router = express.Router();

// POST /api/answer/submit - Submit an answer for evaluation
router.post('/submit', protect, async (req, res) => {
  try {
    const { interviewId, questionId, questionText, userAnswer, focusScore } = req.body;

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

    console.log(`📝 Evaluating answer for question: ${questionId}`);

    // Evaluate the answer using AI
    const evaluation = await evaluateAnswer(questionText, userAnswer, interview.domain);

    // Analyze communication if provided
    const communicationAnalysis = analyzeCommuncation(userAnswer);

    // Merge evaluation with communication analysis
    const fullEvaluation = {
      ...evaluation,
      communicationScore: evaluation.communicationScore || communicationAnalysis.communicationScore,
      fillerAnalysis: communicationAnalysis
    };

    // Check if answer already exists for this question
    let response = await Responses.findOne({
      interviewId,
      questionId
    });

    const responseData = {
      userAnswer,
      score: fullEvaluation.score,
      technicalScore: fullEvaluation.technicalScore || fullEvaluation.score,
      communicationScore: fullEvaluation.communicationScore || fullEvaluation.score,
      focusScore: focusScore || null,
      feedback: fullEvaluation.feedback,
      mistakes: fullEvaluation.mistakes || [],
      lineByLineCorrection: fullEvaluation.lineByLineCorrection || [],
      idealAnswer: fullEvaluation.idealAnswer,
      strengths: fullEvaluation.strengths || [],
      areasToImprove: fullEvaluation.areasToImprove || [],
      fillerAnalysis: fullEvaluation.fillerAnalysis,
      evaluatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString()
    };

    if (response) {
      // Update existing answer with new evaluation
      response = await Responses.updateById(response._id, responseData);
    } else {
      // Create new response with evaluation
      response = await Responses.create({
        interviewId,
        userId: req.user._id,
        questionId,
        questionText,
        ...responseData
      });
    }

    console.log(`✅ Answer evaluated. Score: ${fullEvaluation.score}/10`);

    res.status(201).json({
      success: true,
      message: 'Answer submitted and evaluated successfully',
      data: {
        responseId: response._id,
        questionId: response.questionId,
        userAnswer: response.userAnswer,
        score: response.score,
        technicalScore: responseData.technicalScore,
        communicationScore: responseData.communicationScore,
        focusScore: responseData.focusScore,
        feedback: response.feedback,
        mistakes: responseData.mistakes,
        lineByLineCorrection: responseData.lineByLineCorrection,
        idealAnswer: response.idealAnswer,
        strengths: responseData.strengths,
        areasToImprove: responseData.areasToImprove,
        fillerAnalysis: responseData.fillerAnalysis,
        submittedAt: response.submittedAt
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
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
