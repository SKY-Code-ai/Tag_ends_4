/**
 * AI Service - Modular AI Provider for Answer Evaluation
 * 
 * This service abstracts AI providers (Gemini, OpenAI, etc.) making it easy
 * to swap between different AI backends without changing the rest of the code.
 */

// AI Provider Configuration
const AI_PROVIDERS = {
  GEMINI: 'gemini',
  OPENAI: 'openai',
  MOCK: 'mock'  // For testing without API
};

// Current provider (can be changed via environment variable)
const currentProvider = process.env.AI_PROVIDER || AI_PROVIDERS.MOCK;

/**
 * Evaluate a user's answer using AI
 * @param {string} question - The interview question
 * @param {string} userAnswer - The user's answer
 * @param {string} domain - The domain/category of the question
 * @returns {Object} - { score, feedback, idealAnswer }
 */
export const evaluateAnswer = async (question, userAnswer, domain = 'General') => {
  switch (currentProvider) {
    case AI_PROVIDERS.GEMINI:
      return await evaluateWithGemini(question, userAnswer, domain);
    case AI_PROVIDERS.OPENAI:
      return await evaluateWithOpenAI(question, userAnswer, domain);
    case AI_PROVIDERS.MOCK:
    default:
      return mockEvaluation(question, userAnswer, domain);
  }
};

/**
 * Mock evaluation for testing without AI API
 */
const mockEvaluation = (question, userAnswer, domain) => {
  // Calculate a mock score based on answer length and content
  const wordCount = userAnswer.split(/\s+/).length;
  let score = Math.min(10, Math.floor(wordCount / 10) + 3);
  
  // Adjust score based on keywords
  const keywords = ['because', 'example', 'important', 'therefore', 'however'];
  keywords.forEach(keyword => {
    if (userAnswer.toLowerCase().includes(keyword)) {
      score = Math.min(10, score + 0.5);
    }
  });

  score = Math.round(score * 10) / 10;

  return {
    score,
    feedback: generateMockFeedback(score, wordCount),
    idealAnswer: `This is a sample ideal answer for: "${question}". A comprehensive answer would cover the key concepts, provide examples, and demonstrate deep understanding of ${domain}.`
  };
};

/**
 * Generate mock feedback based on score
 */
const generateMockFeedback = (score, wordCount) => {
  if (score >= 8) {
    return 'Excellent answer! You demonstrated strong understanding of the concept. Your explanation was clear and comprehensive.';
  } else if (score >= 6) {
    return 'Good answer! You covered the main points well. Consider adding more specific examples or going deeper into the technical details.';
  } else if (score >= 4) {
    return 'Decent attempt. Your answer shows basic understanding but could benefit from more detail and specific examples. Try to structure your response more clearly.';
  } else {
    return 'Your answer needs improvement. Try to provide more comprehensive coverage of the topic with specific examples and clearer explanations.';
  }
};

/**
 * Evaluate using Google Gemini API
 */
const evaluateWithGemini = async (question, userAnswer, domain) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ Gemini API key not configured. Using mock evaluation.');
    return mockEvaluation(question, userAnswer, domain);
  }

  try {
    const prompt = buildEvaluationPrompt(question, userAnswer, domain);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      return mockEvaluation(question, userAnswer, domain);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return parseAIResponse(text) || mockEvaluation(question, userAnswer, domain);
  } catch (error) {
    console.error('Gemini evaluation error:', error);
    return mockEvaluation(question, userAnswer, domain);
  }
};

/**
 * Evaluate using OpenAI API (placeholder)
 */
const evaluateWithOpenAI = async (question, userAnswer, domain) => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ OpenAI API key not configured. Using mock evaluation.');
    return mockEvaluation(question, userAnswer, domain);
  }

  // OpenAI implementation would go here
  // For now, fallback to mock
  return mockEvaluation(question, userAnswer, domain);
};

/**
 * Build the evaluation prompt for AI
 */
const buildEvaluationPrompt = (question, userAnswer, domain) => {
  return `You are an expert ${domain} interviewer. Evaluate the following interview answer.

Question: ${question}

Candidate's Answer: ${userAnswer}

Please evaluate this answer and provide your response in EXACTLY this JSON format (no markdown, just raw JSON):
{
  "score": <number from 1-10>,
  "feedback": "<detailed constructive feedback explaining strengths and areas for improvement>",
  "idealAnswer": "<a well-structured ideal answer to this question>"
}

Scoring Guide:
- 9-10: Exceptional answer demonstrating expert-level understanding
- 7-8: Strong answer with good coverage and examples
- 5-6: Adequate answer but missing important points
- 3-4: Basic answer with significant gaps
- 1-2: Poor answer showing limited understanding

Be constructive and specific in your feedback.`;
};

/**
 * Parse AI response to extract structured evaluation
 */
const parseAIResponse = (text) => {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(10, Math.max(1, Number(parsed.score) || 5)),
        feedback: parsed.feedback || 'No feedback provided.',
        idealAnswer: parsed.idealAnswer || parsed.ideal_answer || 'No ideal answer provided.'
      };
    }
  } catch (error) {
    console.error('Error parsing AI response:', error);
  }
  return null;
};

export default {
  evaluateAnswer,
  AI_PROVIDERS
};
