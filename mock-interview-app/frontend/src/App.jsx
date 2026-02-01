import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { InterviewProvider } from '@/context/InterviewContext';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import DomainPage from '@/pages/DomainPage';
import InterviewPage from '@/pages/InterviewPage';
import ResultsPage from '@/pages/ResultsPage';
import ResumeToolsPage from '@/pages/ResumeToolsPage';
import LearningResourcesPage from '@/pages/LearningResourcesPage';
import DSAPracticePage from '@/pages/DSAPracticePage';
import LiveInterviewPage from '@/pages/LiveInterviewPage';
import './index.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// App Routes
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/domains"
        element={
          <ProtectedRoute>
            <DomainPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <InterviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results"
        element={
          <ProtectedRoute>
            <ResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume"
        element={
          <ProtectedRoute>
            <ResumeToolsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <LearningResourcesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dsa"
        element={
          <ProtectedRoute>
            <DSAPracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/live-interview"
        element={
          <ProtectedRoute>
            <LiveInterviewPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <InterviewProvider>
          <AppRoutes />
        </InterviewProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
