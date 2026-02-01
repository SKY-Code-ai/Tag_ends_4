import { createContext, useContext, useState } from 'react';

const InterviewContext = createContext(null);

export const InterviewProvider = ({ children }) => {
  const [currentInterview, setCurrentInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const startInterview = (interviewData) => {
    setCurrentInterview(interviewData);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const saveAnswer = (questionId, answer, evaluation) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { answer, evaluation }
    }));
  };

  const nextQuestion = () => {
    if (currentInterview && currentQuestion < currentInterview.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const resetInterview = () => {
    setCurrentInterview(null);
    setCurrentQuestion(0);
    setAnswers({});
  };

  return (
    <InterviewContext.Provider value={{
      currentInterview,
      currentQuestion,
      answers,
      startInterview,
      saveAnswer,
      nextQuestion,
      prevQuestion,
      resetInterview
    }}>
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};
