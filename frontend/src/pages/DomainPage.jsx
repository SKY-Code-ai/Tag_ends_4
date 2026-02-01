import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import { interviewAPI } from '../services/api';
import './DomainPage.css';

const domainIcons = {
  'Java': '☕',
  'Python': '🐍',
  'Data Science': '📊',
  'Cloud': '☁️',
  'QA': '🧪',
  'HR': '👔',
  'Electrical': '⚡',
  'JavaScript': '🟨',
  'React': '⚛️',
  'System Design': '🏗️',
  'Node.js': '🟢'
};

const DomainPage = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [error, setError] = useState('');

  const { user, logout } = useAuth();
  const { startInterview } = useInterview();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await interviewAPI.getDomains();
      if (response.data.success) {
        setDomains(response.data.domains);
      }
    } catch (err) {
      setError('Failed to load domains');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!selectedDomain) return;
    
    setStarting(true);
    setError('');

    try {
      const response = await interviewAPI.startInterview(selectedDomain);
      if (response.data.success) {
        startInterview(response.data.data);
        navigate('/interview');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview');
    } finally {
      setStarting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="domain-container">
        <div className="loading-spinner">Loading domains...</div>
      </div>
    );
  }

  return (
    <div className="domain-container">
      <header className="domain-header">
        <div className="logo">🎯 Mock Interview</div>
        <div className="user-info">
          <span>Welcome, {user?.name || 'User'}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="domain-main">
        <div className="domain-intro">
          <h1>Choose Your Domain</h1>
          <p>Select an interview category to practice your skills</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="domains-grid">
          {domains.map((domain) => (
            <div
              key={domain}
              className={`domain-card ${selectedDomain === domain ? 'selected' : ''}`}
              onClick={() => setSelectedDomain(domain)}
            >
              <span className="domain-icon">{domainIcons[domain] || '📚'}</span>
              <span className="domain-name">{domain}</span>
            </div>
          ))}
        </div>

        {selectedDomain && (
          <div className="start-section">
            <p>Ready to practice <strong>{selectedDomain}</strong> interview questions?</p>
            <button 
              className="start-btn"
              onClick={handleStartInterview}
              disabled={starting}
            >
              {starting ? 'Starting...' : 'Start Interview'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DomainPage;
