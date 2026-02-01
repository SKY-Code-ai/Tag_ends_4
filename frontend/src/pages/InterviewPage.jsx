import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useInterview } from '@/context/InterviewContext';
import { answerAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Loader2,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Trophy,
  Clock,
  Mic,
  MicOff,
  Camera,
  CameraOff
} from 'lucide-react';

const InterviewPage = () => {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');
  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);

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
  const progress = ((currentQuestion + 1) / currentInterview.questions.length) * 100;

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

  const getScoreColor = (score) => {
    if (score >= 7) return 'text-green-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 7) return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
    if (score >= 4) return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
    return 'from-red-500/20 to-rose-500/20 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                {currentInterview.domain}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {currentInterview.questions.length}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMicEnabled(!micEnabled)}
                className={micEnabled ? 'text-green-400' : 'text-muted-foreground'}
              >
                {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={cameraEnabled ? 'text-green-400' : 'text-muted-foreground'}
              >
                {cameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleExit}>
                Exit
              </Button>
            </div>
          </div>
          
          <Progress value={progress} className="mt-3 h-2" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={
                question.difficulty === 'Easy' ? 'success' : 
                question.difficulty === 'Medium' ? 'warning' : 
                'destructive'
              }>
                {question.difficulty}
              </Badge>
              <Badge variant="outline">{question.category}</Badge>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {question.questionText}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Answer Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Your Answer</label>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here... Be detailed and provide examples where relevant."
            rows={8}
            disabled={!!evaluation}
            className="resize-none"
          />
          
          {error && (
            <p className="text-destructive text-sm mt-2 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          {!evaluation && (
            <Button 
              className="mt-4 w-full sm:w-auto"
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Evaluating with AI...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Answer
                </>
              )}
            </Button>
          )}
        </div>

        {/* Evaluation Results */}
        {evaluation && (
          <div className="space-y-4">
            {/* Score Display */}
            <Card className={`bg-gradient-to-br ${getScoreBg(evaluation.score)} border`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getScoreColor(evaluation.score)}`}>
                      {evaluation.score}
                    </div>
                    <div className="text-muted-foreground">out of 10</div>
                  </div>
                  <Trophy className={`w-12 h-12 ${getScoreColor(evaluation.score)}`} />
                </div>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  AI Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{evaluation.feedback}</p>
              </CardContent>
            </Card>

            {/* Ideal Answer */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Ideal Answer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{evaluation.idealAnswer}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      <footer className="border-t border-border bg-background/95 backdrop-blur sticky bottom-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {evaluation && !isLastQuestion && (
            <Button onClick={handleNext}>
              Next Question
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {evaluation && isLastQuestion && (
            <Button 
              onClick={handleFinish}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              View Results
              <Trophy className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default InterviewPage;
