/**
 * AI Service - Modular AI Provider for Answer Evaluation
 * 
 * Supports: Ollama (local), Gemini, OpenAI
 */

// AI Provider Configuration
const AI_PROVIDERS = {
  OLLAMA: 'ollama',
  GEMINI: 'gemini',
  OPENAI: 'openai',
  MOCK: 'mock'
};

// Current provider - prioritize Ollama for local usage
const currentProvider = process.env.AI_PROVIDER || AI_PROVIDERS.OLLAMA;

// Ollama configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';

/**
 * Evaluate a user's answer using AI
 */
export const evaluateAnswer = async (question, userAnswer, domain = 'General') => {
  console.log(`🤖 Using AI Provider: ${currentProvider}`);
  
  try {
    switch (currentProvider) {
      case AI_PROVIDERS.OLLAMA:
        return await evaluateWithOllama(question, userAnswer, domain);
      case AI_PROVIDERS.GEMINI:
        return await evaluateWithGemini(question, userAnswer, domain);
      case AI_PROVIDERS.OPENAI:
        return await evaluateWithOpenAI(question, userAnswer, domain);
      case AI_PROVIDERS.MOCK:
      default:
        return smartEvaluation(question, userAnswer, domain);
    }
  } catch (error) {
    console.error('AI evaluation error, using smart fallback:', error.message);
    return smartEvaluation(question, userAnswer, domain);
  }
};

/**
 * Evaluate using Ollama (local LLM)
 */
const evaluateWithOllama = async (question, userAnswer, domain) => {
  try {
    const prompt = buildSimplePrompt(question, userAnswer, domain);
    
    console.log('📤 Sending to Ollama...');
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 1500
        }
      })
    });

    if (!response.ok) {
      console.error('Ollama API error:', response.status);
      return smartEvaluation(question, userAnswer, domain);
    }

    const data = await response.json();
    console.log('📥 Ollama response received');
    
    const result = parseAIResponse(data.response);
    
    if (result && result.feedback && result.feedback.length > 10) {
      console.log('✅ Successfully parsed AI response');
      return result;
    }
    
    console.log('⚠️ Could not parse AI response, using smart evaluation');
    return smartEvaluation(question, userAnswer, domain);
  } catch (error) {
    console.error('Ollama evaluation error:', error.message);
    return smartEvaluation(question, userAnswer, domain);
  }
};

/**
 * Build a simpler, more reliable prompt
 */
const buildSimplePrompt = (question, userAnswer, domain) => {
  return `You are an expert ${domain} interview evaluator. Evaluate this answer.

Question: ${question}

Answer: ${userAnswer}

Respond with ONLY a JSON object (no other text):
{"score":7,"feedback":"Your detailed feedback here","technicalScore":7,"communicationScore":7,"idealAnswer":"The ideal answer here","strengths":["strength1","strength2"],"areasToImprove":["area1","area2"],"mistakes":["mistake1"],"lineByLineCorrection":[{"original":"problem text","corrected":"fixed text","explanation":"why"}]}

Give score 1-10. Be helpful and specific.`;
};

/**
 * Parse AI response to extract structured evaluation
 */
const parseAIResponse = (text) => {
  if (!text) return null;
  
  try {
    // Clean the response
    let cleanText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^\s*[\r\n]/gm, '')
      .trim();
    
    // Try to find JSON object
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(10, Math.max(1, Number(parsed.score) || 5)),
        technicalScore: Math.min(10, Math.max(1, Number(parsed.technicalScore) || parsed.score || 5)),
        communicationScore: Math.min(10, Math.max(1, Number(parsed.communicationScore) || parsed.score || 5)),
        feedback: String(parsed.feedback || 'Good attempt. Keep practicing.'),
        mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
        lineByLineCorrection: Array.isArray(parsed.lineByLineCorrection) ? parsed.lineByLineCorrection : [],
        idealAnswer: String(parsed.idealAnswer || parsed.ideal_answer || 'No ideal answer provided.'),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        areasToImprove: Array.isArray(parsed.areasToImprove) ? parsed.areasToImprove : []
      };
    }
  } catch (error) {
    console.error('Error parsing AI response:', error.message);
  }
  return null;
};

/**
 * Smart evaluation with keyword-based analysis (fallback)
 */
const smartEvaluation = (question, userAnswer, domain) => {
  const answer = userAnswer.toLowerCase();
  const words = userAnswer.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Base score from length
  let score = 3;
  if (wordCount >= 50) score = 6;
  if (wordCount >= 100) score = 7;
  if (wordCount >= 150) score = 8;
  
  // Technical keywords boost
  const techKeywords = [
    'function', 'variable', 'class', 'object', 'array', 'loop', 'algorithm',
    'database', 'api', 'server', 'client', 'framework', 'library',
    'component', 'state', 'props', 'hook', 'async', 'promise',
    'performance', 'optimization', 'security', 'scalability'
  ];
  
  let keywordCount = 0;
  techKeywords.forEach(keyword => {
    if (answer.includes(keyword)) keywordCount++;
  });
  
  if (keywordCount >= 5) score = Math.min(10, score + 1);
  if (keywordCount >= 10) score = Math.min(10, score + 1);
  
  // Structure keywords
  const structureWords = ['first', 'second', 'third', 'finally', 'because', 'therefore', 'however', 'for example', 'specifically'];
  let structureCount = 0;
  structureWords.forEach(word => {
    if (answer.includes(word)) structureCount++;
  });
  if (structureCount >= 2) score = Math.min(10, score + 0.5);
  
  score = Math.round(score * 10) / 10;
  
  // Generate contextual feedback
  const strengths = [];
  const areasToImprove = [];
  
  if (wordCount >= 100) strengths.push('Comprehensive answer with good detail');
  else areasToImprove.push('Add more detail and examples');
  
  if (keywordCount >= 3) strengths.push('Good use of technical terminology');
  else areasToImprove.push('Include more technical terms relevant to ' + domain);
  
  if (structureCount >= 2) strengths.push('Well-structured response');
  else areasToImprove.push('Structure your answer with clear points (First, Second, etc.)');

  // Generate line-by-line correction
  const sentences = userAnswer.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const lineByLineCorrection = [];
  
  if (sentences.length > 0 && wordCount < 100) {
    lineByLineCorrection.push({
      original: sentences[0].trim(),
      corrected: `${sentences[0].trim()}. Consider expanding with specific examples and technical details.`,
      explanation: 'Adding more depth will strengthen your answer.'
    });
  }

  const feedback = generateFeedback(score, wordCount, keywordCount, domain);

  return {
    score,
    technicalScore: Math.min(10, score + (keywordCount > 5 ? 0.5 : -0.5)),
    communicationScore: Math.min(10, score + (structureCount > 2 ? 0.5 : 0)),
    feedback,
    mistakes: wordCount < 50 ? ['Answer is too brief - aim for at least 50 words', 'Missing specific examples'] : [],
    lineByLineCorrection,
    idealAnswer: generateIdealAnswer(question, domain),
    strengths: strengths.length > 0 ? strengths : ['Made an attempt to answer'],
    areasToImprove: areasToImprove.length > 0 ? areasToImprove : ['Continue practicing']
  };
};

/**
 * Generate contextual feedback
 */
const generateFeedback = (score, wordCount, keywordCount, domain) => {
  if (score >= 8) {
    return `Excellent answer! You demonstrated strong understanding of ${domain} concepts. Your explanation was comprehensive with good technical depth. Keep up the great work!`;
  } else if (score >= 6) {
    return `Good answer! You covered the main points well. To improve, consider adding more specific examples from your experience and diving deeper into the technical implementation details.`;
  } else if (score >= 4) {
    return `Decent attempt. Your answer shows basic understanding but could benefit from more depth. Focus on providing concrete examples, explaining the "why" behind concepts, and structuring your response more clearly.`;
  } else {
    return `Your answer needs improvement. Try to: 1) Provide a more complete explanation, 2) Include specific examples, 3) Use relevant technical terminology, 4) Structure your answer with clear points.`;
  }
};

/**
 * Generate ideal answer template
 */
const generateIdealAnswer = (question, domain) => {
  return `A strong answer to "${question}" would include:

1. **Clear Definition/Overview**: Start by directly addressing what is being asked with a concise definition or explanation.

2. **Technical Details**: Explain the core concepts, technologies, or methodologies involved in ${domain}.

3. **Real Examples**: Share specific examples from your experience or well-known use cases.

4. **Best Practices**: Mention industry best practices and common patterns.

5. **Trade-offs**: Discuss any trade-offs, limitations, or considerations.

6. **Summary**: Conclude with key takeaways that demonstrate mastery of the topic.`;
};

/**
 * Analyze speech/communication quality
 */
export const analyzeCommuncation = (transcript) => {
  const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'so', 'well'];
  const words = transcript.toLowerCase().split(/\s+/);
  
  let fillerCount = 0;
  const foundFillers = [];
  
  fillerWords.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = transcript.match(regex);
    if (matches) {
      fillerCount += matches.length;
      foundFillers.push({ word: filler, count: matches.length });
    }
  });

  const totalWords = words.length;
  const fillerPercentage = totalWords > 0 ? (fillerCount / totalWords) * 100 : 0;
  
  let communicationScore = 10;
  if (fillerPercentage > 10) communicationScore -= 3;
  else if (fillerPercentage > 5) communicationScore -= 2;
  else if (fillerPercentage > 2) communicationScore -= 1;

  return {
    totalWords,
    fillerCount,
    fillerPercentage: Math.round(fillerPercentage * 10) / 10,
    foundFillers,
    communicationScore: Math.max(1, communicationScore),
    feedback: fillerCount > 5 
      ? `You used ${fillerCount} filler words. Try to reduce usage of: ${foundFillers.map(f => f.word).join(', ')}`
      : 'Good communication clarity with minimal filler words!'
  };
};

/**
 * Evaluate using Google Gemini API
 */
const evaluateWithGemini = async (question, userAnswer, domain) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ Gemini API key not configured.');
    return smartEvaluation(question, userAnswer, domain);
  }

  try {
    const prompt = buildSimplePrompt(question, userAnswer, domain);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      return smartEvaluation(question, userAnswer, domain);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return parseAIResponse(text) || smartEvaluation(question, userAnswer, domain);
  } catch (error) {
    console.error('Gemini evaluation error:', error);
    return smartEvaluation(question, userAnswer, domain);
  }
};

/**
 * Evaluate using OpenAI API
 */
const evaluateWithOpenAI = async (question, userAnswer, domain) => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ OpenAI API key not configured.');
    return smartEvaluation(question, userAnswer, domain);
  }

  try {
    const prompt = buildSimplePrompt(question, userAnswer, domain);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert interview coach. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return smartEvaluation(question, userAnswer, domain);
    }

    const text = data.choices?.[0]?.message?.content;
    return parseAIResponse(text) || smartEvaluation(question, userAnswer, domain);
  } catch (error) {
    console.error('OpenAI evaluation error:', error);
    return smartEvaluation(question, userAnswer, domain);
  }
};

export default {
  evaluateAnswer,
  analyzeCommuncation,
  AI_PROVIDERS
};
