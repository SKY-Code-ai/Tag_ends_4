import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import { reportAPI } from '../services/api';
import './ResultsPage.css';

const ResultsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, logout } = useAuth();
  const { currentInterview, resetInterview } = useInterview();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentInterview) {
      generateReport();
    } else {
      setLoading(false);
    }
  }, [currentInterview]);

  const generateReport = async () => {
    try {
      const response = await reportAPI.generate(currentInterview.interviewId);
      if (response.data.success) {
        setReport(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleNewInterview = () => {
    resetInterview();
    navigate('/domains');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getScoreColor = (score) => {
    if (score >= 7) return 'excellent';
    if (score >= 5) return 'good';
    if (score >= 3) return 'average';
    return 'needs-work';
  };

  if (loading) {
    return (
      <div className="results-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating your interview report...</p>
        </div>
      </div>
    );
  }

  if (!report && !currentInterview) {
    return (
      <div className="results-container">
        <div className="no-report">
          <h2>No Interview Data</h2>
          <p>Start a new interview to see your results here.</p>
          <button className="primary-btn" onClick={handleNewInterview}>
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <header className="results-header">
        <div className="logo">🎯 Mock Interview</div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={handleNewInterview}>
            New Interview
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="results-main">
        <div className="results-hero">
          <h1>🎉 Interview Complete!</h1>
          <p>Here's your performance report for <strong>{report?.domain}</strong></p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {report && (
          <>
            <div className="score-overview">
              <div className={`main-score ${getScoreColor(report.averageScore)}`}>
                <span className="score-num">{report.averageScore}</span>
                <span className="score-label">/ 10</span>
              </div>
              <div className="score-details">
                <div className="detail-item">
                  <span className="detail-label">Questions Answered</span>
                  <span className="detail-value">{report.totalQuestions}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Domain</span>
                  <span className="detail-value">{report.domain}</span>
                </div>
              </div>
            </div>

            <div className="report-grid">
              <div className="report-card strengths">
                <h3>💪 Strengths</h3>
                <ul>
                  {report.strengths?.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="report-card gaps">
                <h3>📈 Areas for Improvement</h3>
                <ul>
                  {report.gaps?.map((gap, idx) => (
                    <li key={idx}>{gap}</li>
                  ))}
                </ul>
              </div>

              <div className="report-card recommendations">
                <h3>🎯 Recommendations</h3>
                <ul>
                  {report.recommendations?.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="overall-feedback">
              <h3>📝 Overall Feedback</h3>
              <p>{report.overallFeedback}</p>
            </div>

            <div className="action-buttons">
              <button className="primary-btn" onClick={handleNewInterview}>
                Practice Another Domain
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ResultsPage;
