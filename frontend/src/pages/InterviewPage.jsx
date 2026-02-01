import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import { answerAPI } from '../services/api';
import './InterviewPage.css';

const InterviewPage = () => {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { 
    currentInterview, 
    currentQuestion, 
    answers,
    saveAnswer, 
    nextQuestion, 
    prevQuestion,
    resetInterview 
  } = useInterview();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentInterview) {
      navigate('/domains');
    }
  }, [currentInterview, navigate]);

  useEffect(() => {
    // Load saved answer for current question
    if (currentInterview) {
      const question = currentInterview.questions[currentQuestion];
      const savedAnswer = answers[question.questionId];
      if (savedAnswer) {
        setAnswer(savedAnswer.answer);
        setEvaluation(savedAnswer.evaluation);
      } else {
        setAnswer('');
        setEvaluation(null);
      }
    }
  }, [currentQuestion, currentInterview, answers]);

  if (!currentInterview) {
    return null;
  }

  const question = currentInterview.questions[currentQuestion];
  const isLastQuestion = currentQuestion === currentInterview.questions.length - 1;
  const totalAnswered = Object.keys(answers).length;

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError('Please provide an answer');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await answerAPI.submit({
        interviewId: currentInterview.interviewId,
        questionId: question.questionId,
        questionText: question.questionText,
        userAnswer: answer
      });

      if (response.data.success) {
        const evalData = {
          score: response.data.data.score,
          feedback: response.data.data.feedback,
          idealAnswer: response.data.data.idealAnswer
        };
        setEvaluation(evalData);
        saveAnswer(question.questionId, answer, evalData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    navigate('/results');
  };

  const handleNext = () => {
    nextQuestion();
    setEvaluation(null);
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
      navigate('/results');
    }
  };

  return (
    <div className="interview-container">
      <header className="interview-header">
        <div className="interview-info">
          <span className="domain-badge">{currentInterview.domain}</span>
          <span className="progress">
            Question {currentQuestion + 1} of {currentInterview.questions.length}
          </span>
        </div>
        <button className="exit-btn" onClick={handleExit}>Exit Interview</button>
      </header>

      <main className="interview-main">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / currentInterview.questions.length) * 100}%` }}
          />
        </div>

        <div className="question-section">
          <div className="question-meta">
            <span className={`difficulty ${question.difficulty?.toLowerCase()}`}>
              {question.difficulty}
            </span>
            <span className="category">{question.category}</span>
          </div>
          <h2 className="question-text">{question.questionText}</h2>
        </div>

        <div className="answer-section">
          <label htmlFor="answer">Your Answer</label>
          <textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here... Be detailed and provide examples where relevant."
            rows={8}
            disabled={!!evaluation}
          />
          
          {error && <div className="error-msg">{error}</div>}

          {!evaluation && (
            <button 
              className="submit-answer-btn"
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
            >
              {submitting ? 'Evaluating...' : 'Submit Answer'}
            </button>
          )}
        </div>

        {evaluation && (
          <div className="evaluation-section">
            <div className="score-display">
              <div className={`score-circle ${evaluation.score >= 7 ? 'high' : evaluation.score >= 4 ? 'medium' : 'low'}`}>
                <span className="score-value">{evaluation.score}</span>
                <span className="score-max">/10</span>
              </div>
            </div>

            <div className="feedback-card">
              <h3>💬 Feedback</h3>
              <p>{evaluation.feedback}</p>
            </div>

            <div className="ideal-answer-card">
              <h3>✨ Ideal Answer</h3>
              <p>{evaluation.idealAnswer}</p>
            </div>
          </div>
        )}

        <div className="navigation-buttons">
          <button 
            className="nav-btn prev"
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          {evaluation && !isLastQuestion && (
            <button 
              className="nav-btn next"
              onClick={handleNext}
            >
              Next Question →
            </button>
          )}

          {evaluation && isLastQuestion && (
            <button 
              className="nav-btn finish"
              onClick={handleFinish}
            >
              View Results 🎉
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterviewPage;
