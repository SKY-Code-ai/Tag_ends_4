import express from 'express';
import { Reports, Interviews, Responses } from '../services/localStorageService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/report/generate/:interviewId - Generate interview report
router.get('/generate/:interviewId', protect, async (req, res) => {
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
        message: 'Not authorized to view this report'
      });
    }

    // Check if report already exists
    let report = await Reports.findOne({ interviewId });

    if (report) {
      return res.json({
        success: true,
        message: 'Report retrieved from cache',
        data: report
      });
    }

    // Get all responses for this interview
    const responses = await Responses.find({ interviewId });

    if (responses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No answers submitted yet. Complete the interview first.'
      });
    }

    // Calculate statistics
    const scores = responses.map(r => r.score || 0);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Analyze performance to generate insights
    const { strengths, gaps, recommendations } = analyzePerformance(responses, interview.domain);

    // Generate overall feedback
    const overallFeedback = generateOverallFeedback(averageScore, responses.length, interview.domain);

    // Create report
    report = await Reports.create({
      interviewId,
      userId: req.user._id,
      domain: interview.domain,
      totalQuestions: interview.questions.length,
      averageScore: Math.round(averageScore * 10) / 10,
      strengths,
      gaps,
      recommendations,
      overallFeedback
    });

    // Mark interview as completed
    await Interviews.updateById(interviewId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      totalScore: averageScore
    });

    res.json({
      success: true,
      message: 'Report generated successfully',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
});

// GET /api/report/:reportId - Get a specific report
router.get('/:reportId', protect, async (req, res) => {
  try {
    const report = await Reports.findById(req.params.reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.userId !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
});

// GET /api/report/user/all - Get all reports for user
router.get('/user/all', protect, async (req, res) => {
  try {
    const reports = await Reports.find({ userId: req.user._id });

    res.json({
      success: true,
      totalReports: reports.length,
      data: reports.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
});

/**
 * Analyze performance and generate insights
 */
function analyzePerformance(responses, domain) {
  const strengths = [];
  const gaps = [];
  const recommendations = [];

  // Categorize responses by score
  const highScores = responses.filter(r => r.score >= 7);
  const mediumScores = responses.filter(r => r.score >= 4 && r.score < 7);
  const lowScores = responses.filter(r => r.score < 4);

  // Identify strengths (high scoring areas)
  if (highScores.length > 0) {
    strengths.push(`Strong performance in ${highScores.length} out of ${responses.length} questions`);
    if (highScores.length >= responses.length * 0.6) {
      strengths.push(`Excellent grasp of ${domain} fundamentals`);
    }
    if (highScores.some(r => r.questionText?.toLowerCase().includes('explain'))) {
      strengths.push('Good ability to explain complex concepts');
    }
  }

  // Identify gaps (low scoring areas)
  if (lowScores.length > 0) {
    gaps.push(`Needs improvement in ${lowScores.length} areas`);
    lowScores.forEach(r => {
      if (r.questionText) {
        gaps.push(`Review: ${r.questionText.substring(0, 50)}...`);
      }
    });
  }

  if (mediumScores.length > responses.length * 0.5) {
    gaps.push('Many answers lack depth - consider adding more examples');
  }

  // Generate recommendations
  if (lowScores.length > 0) {
    recommendations.push(`Focus on fundamentals of ${domain}`);
    recommendations.push('Practice explaining concepts with real-world examples');
  }

  if (mediumScores.length > 0) {
    recommendations.push('Work on providing more detailed and structured answers');
  }

  recommendations.push(`Take more practice interviews in ${domain}`);
  recommendations.push('Review the ideal answers provided for each question');

  // Ensure we have at least some content
  if (strengths.length === 0) strengths.push('Keep practicing to develop your strengths');
  if (gaps.length === 0) gaps.push('No major gaps identified - continue improving');

  return { strengths, gaps, recommendations };
}

/**
 * Generate overall feedback message
 */
function generateOverallFeedback(averageScore, totalAnswered, domain) {
  if (averageScore >= 8) {
    return `Outstanding performance! You demonstrated expert-level knowledge in ${domain}. Your answers were comprehensive and well-structured. You're well-prepared for technical interviews in this domain.`;
  } else if (averageScore >= 6) {
    return `Good performance! You have a solid understanding of ${domain} concepts. To improve further, focus on providing more detailed examples and diving deeper into the technical aspects of your answers.`;
  } else if (averageScore >= 4) {
    return `Decent effort. Your ${domain} knowledge covers the basics but needs more depth. Spend time reviewing core concepts and practice explaining them clearly with concrete examples.`;
  } else {
    return `You need significant improvement in ${domain}. We recommend revisiting the fundamentals and practicing regularly. Review the ideal answers provided and try to understand the key concepts better.`;
  }
}

export default router;
