import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useInterview } from '@/context/InterviewContext';
import { answerAPI } from '@/services/api';
import { useSpeechToText, useCamera, useFocusDetection } from '@/hooks/useMediaCapture';
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
  Mic,
  MicOff,
  Camera,
  CameraOff,
  AlertTriangle,
  Brain,
  MessageSquare,
  Eye,
  Target,
  Sparkles
} from 'lucide-react';

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

  // Media hooks
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported: speechSupported,
    error: speechError 
  } = useSpeechToText();

  const { 
    videoRef, 
    isEnabled: cameraEnabled, 
    startCamera, 
    stopCamera,
    error: cameraError 
  } = useCamera();

  const { focusScore, resetFocus } = useFocusDetection(videoRef, cameraEnabled);

  // Sync transcript with answer
  useEffect(() => {
    if (transcript) {
      setAnswer(prev => prev + ' ' + transcript);
    }
  }, [transcript]);

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

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const toggleCamera = () => {
    if (cameraEnabled) {
      stopCamera();
    } else {
      startCamera();
      resetFocus();
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError('Please provide an answer');
      return;
    }

    setSubmitting(true);
    setError('');

    // Stop listening if active
    if (isListening) {
      stopListening();
    }

    try {
      const response = await answerAPI.submit({
        interviewId: currentInterview.interviewId,
        questionId: question.questionId,
        questionText: question.questionText,
        userAnswer: answer,
        focusScore: cameraEnabled ? focusScore : null
      });

      if (response.data.success) {
        const evalData = response.data.data;
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
    stopCamera();
    navigate('/results');
  };

  const handleNext = () => {
    nextQuestion();
    setEvaluation(null);
    resetTranscript();
    resetFocus();
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
      stopCamera();
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
              {/* Mic Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMic}
                className={isListening ? 'text-red-400 animate-pulse' : 'text-muted-foreground'}
                title={speechSupported ? 'Toggle microphone' : 'Speech not supported'}
                disabled={!speechSupported}
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              
              {/* Camera Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCamera}
                className={cameraEnabled ? 'text-green-400' : 'text-muted-foreground'}
                title="Toggle camera for focus detection"
              >
                {cameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </Button>

              {/* Focus Score */}
              {cameraEnabled && (
                <Badge variant={focusScore >= 80 ? 'default' : 'warning'} className="gap-1">
                  <Eye className="w-3 h-3" />
                  {focusScore}%
                </Badge>
              )}
              
              <Button variant="destructive" size="sm" onClick={handleExit}>
                Exit
              </Button>
            </div>
          </div>
          
          <Progress value={progress} className="mt-3 h-2" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <Card>
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Your Answer</label>
                {isListening && (
                  <span className="text-xs text-red-400 flex items-center gap-1 animate-pulse">
                    <Mic className="w-3 h-3" /> Recording...
                  </span>
                )}
              </div>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={isListening ? "Speaking... (voice will be transcribed here)" : "Type your answer or use the microphone button..."}
                rows={8}
                disabled={!!evaluation}
                className="resize-none"
              />
              
              {(speechError || cameraError) && (
                <p className="text-yellow-500 text-xs mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {speechError || cameraError}
                </p>
              )}
              
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
                      AI is evaluating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Submit for AI Evaluation
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Evaluation Results */}
            {evaluation && (
              <div className="space-y-4">
                {/* Score Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className={`bg-gradient-to-br ${getScoreBg(evaluation.score)} border`}>
                    <CardContent className="p-4 text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(evaluation.score)}`}>
                        {evaluation.score}
                      </div>
                      <div className="text-xs text-muted-foreground">Overall</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50">
                    <CardContent className="p-4 text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(evaluation.technicalScore || evaluation.score)}`}>
                        {evaluation.technicalScore || evaluation.score}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Brain className="w-3 h-3" /> Technical
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50">
                    <CardContent className="p-4 text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(evaluation.communicationScore || evaluation.score)}`}>
                        {evaluation.communicationScore || evaluation.score}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Communication
                      </div>
                    </CardContent>
                  </Card>
                </div>

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

                {/* Line-by-Line Corrections */}
                {evaluation.lineByLineCorrection && evaluation.lineByLineCorrection.length > 0 && (
                  <Card className="border-yellow-500/20 bg-yellow-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-yellow-400">
                        <AlertTriangle className="w-5 h-5" />
                        Line-by-Line Corrections
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {evaluation.lineByLineCorrection.map((correction, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-background/50 space-y-2">
                          <div className="text-sm">
                            <span className="text-red-400 line-through">{correction.original}</span>
                          </div>
                          <div className="text-sm text-green-400">
                            ✓ {correction.corrected}
                          </div>
                          <div className="text-xs text-muted-foreground italic">
                            {correction.explanation}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Ideal Answer */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      Ideal Answer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {evaluation.idealAnswer}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Side Column - Camera */}
          <div className="lg:col-span-1">
            {cameraEnabled && (
              <Card className="sticky top-24">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Focus Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Focus Score</span>
                      <span className={getScoreColor(focusScore / 10)}>{focusScore}%</span>
                    </div>
                    <Progress value={focusScore} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {focusScore >= 80 
                        ? 'Great focus! Keep it up.' 
                        : focusScore >= 60 
                          ? 'Try to stay focused on the screen.'
                          : 'Distraction detected. Look at the camera.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
