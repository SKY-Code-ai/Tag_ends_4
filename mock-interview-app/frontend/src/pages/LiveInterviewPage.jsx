import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
  Video,
  VideoOff,
  AlertTriangle,
  Brain,
  MessageSquare,
  Eye,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Settings
} from 'lucide-react';

// Interview questions for live mode
const liveInterviewQuestions = [
  {
    id: 1,
    text: "Tell me about yourself and your background.",
    category: "Behavioral",
    tips: "Keep it professional, highlight relevant experience, and be concise (2-3 minutes)."
  },
  {
    id: 2,
    text: "What is your greatest strength?",
    category: "Behavioral",
    tips: "Choose a strength relevant to the role and provide a specific example."
  },
  {
    id: 3,
    text: "Describe a challenging project you worked on. How did you handle it?",
    category: "Behavioral",
    tips: "Use the STAR method: Situation, Task, Action, Result."
  },
  {
    id: 4,
    text: "Why do you want to work at this company?",
    category: "Behavioral",
    tips: "Research the company and align your goals with their mission."
  },
  {
    id: 5,
    text: "Where do you see yourself in 5 years?",
    category: "Behavioral",
    tips: "Show ambition while being realistic about career growth."
  }
];

const LiveInterviewPage = () => {
  // State
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [stream, setStream] = useState(null);
  const [focusScore, setFocusScore] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [showTips, setShowTips] = useState(true);

  // Refs
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const focusIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const navigate = useNavigate();
  const { user } = useAuth();

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: true
      });
      
      setStream(mediaStream);
      setCameraEnabled(true);
      setMicEnabled(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      alert('Could not access camera/microphone. Please allow permissions.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraEnabled(false);
      setMicEnabled(false);
    }
  }, [stream]);

  // Toggle camera
  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle mic
  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          setCurrentAnswer(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Focus detection
  useEffect(() => {
    if (isStarted && cameraEnabled) {
      const handleActivity = () => {
        lastActivityRef.current = Date.now();
      };

      document.addEventListener('mousemove', handleActivity);
      document.addEventListener('keydown', handleActivity);

      focusIntervalRef.current = setInterval(() => {
        const timeSinceActive = Date.now() - lastActivityRef.current;
        if (timeSinceActive > 30000) {
          setFocusScore(prev => Math.max(50, prev - 5));
        } else if (timeSinceActive < 5000) {
          setFocusScore(prev => Math.min(100, prev + 2));
        }
      }, 5000);

      return () => {
        document.removeEventListener('mousemove', handleActivity);
        document.removeEventListener('keydown', handleActivity);
        if (focusIntervalRef.current) {
          clearInterval(focusIntervalRef.current);
        }
      };
    }
  }, [isStarted, cameraEnabled]);

  // Attach stream to video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(err => console.log('Autoplay prevented:', err));
      };
    }
  }, [stream]);

  // Start recording
  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Speak question using TTS
  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      setAiSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => setAiSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  // Start interview
  const handleStart = async () => {
    await startCamera();
    setIsStarted(true);
    setTimeout(() => {
      speakQuestion(liveInterviewQuestions[0].text);
    }, 1000);
  };

  // Submit answer
  const handleSubmit = async () => {
    if (!currentAnswer.trim()) return;

    setIsSubmitting(true);
    stopRecording();

    // Simulate AI evaluation
    setTimeout(() => {
      const score = Math.floor(Math.random() * 4) + 6; // 6-9
      const evalResult = {
        score,
        feedback: score >= 8 
          ? "Excellent response! You were clear, confident, and provided relevant examples."
          : score >= 7
            ? "Good answer! Consider adding more specific examples to strengthen your response."
            : "Your answer covers the basics. Try to be more specific and structured.",
        strengths: ["Clear communication", "Good eye contact"],
        improvements: ["Add more examples", "Be more concise"]
      };

      setAnswers(prev => [...prev, {
        questionId: liveInterviewQuestions[currentQuestionIndex].id,
        question: liveInterviewQuestions[currentQuestionIndex].text,
        answer: currentAnswer,
        evaluation: evalResult
      }]);

      setEvaluation(evalResult);
      setIsSubmitting(false);
    }, 2000);
  };

  // Next question
  const handleNext = () => {
    if (currentQuestionIndex < liveInterviewQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
      setTranscript('');
      setEvaluation(null);
      setFocusScore(100);
      
      setTimeout(() => {
        speakQuestion(liveInterviewQuestions[currentQuestionIndex + 1].text);
      }, 500);
    } else {
      setIsComplete(true);
    }
  };

  // Finish interview
  const handleFinish = () => {
    stopCamera();
    navigate('/dashboard');
  };

  // Calculate overall score
  const calculateOverallScore = () => {
    if (answers.length === 0) return 0;
    const total = answers.reduce((sum, a) => sum + a.evaluation.score, 0);
    return Math.round((total / answers.length) * 10) / 10;
  };

  const currentQuestion = liveInterviewQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / liveInterviewQuestions.length) * 100;

  // Pre-start screen
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Video className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Live AI Interview</CardTitle>
            <CardDescription>
              Practice with a realistic video interview experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Camera className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Camera Required</p>
                  <p className="text-sm text-muted-foreground">Your video will be used for focus detection</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Mic className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Microphone Required</p>
                  <p className="text-sm text-muted-foreground">Speak your answers for automatic transcription</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Brain className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">AI Evaluation</p>
                  <p className="text-sm text-muted-foreground">Get instant feedback on your responses</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-4 text-center">
                {liveInterviewQuestions.length} questions • Approximately 10-15 minutes
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button className="flex-1" onClick={handleStart}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Interview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completed screen
  if (isComplete) {
    const overallScore = calculateOverallScore();
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Interview Complete!</CardTitle>
            <CardDescription>
              Great job! Here's your performance summary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="text-5xl font-bold text-primary mb-2">{overallScore}</div>
              <p className="text-muted-foreground">Overall Score (out of 10)</p>
            </div>

            {/* Question Breakdown */}
            <div className="space-y-3">
              <h3 className="font-semibold">Question Breakdown</h3>
              {answers.map((a, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm truncate flex-1 mr-4">Q{idx + 1}: {a.question.slice(0, 40)}...</span>
                  <Badge variant={a.evaluation.score >= 7 ? 'default' : 'warning'}>
                    {a.evaluation.score}/10
                  </Badge>
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={handleFinish}>
              Return to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main interview screen
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-1">
                <Video className="w-3 h-3" />
                Live Interview
              </Badge>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {liveInterviewQuestions.length}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Focus Score */}
              <Badge variant={focusScore >= 80 ? 'default' : focusScore >= 60 ? 'warning' : 'destructive'} className="gap-1">
                <Eye className="w-3 h-3" />
                Focus: {focusScore}%
              </Badge>
              
              <Button variant="destructive" size="sm" onClick={handleFinish}>
                End Interview
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-3 h-2" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6 h-full">
          {/* Video Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Your Camera
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleCamera}>
                      {cameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4 text-destructive" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMic}>
                      {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-destructive" />}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-black relative overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!cameraEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <CameraOff className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Recording indicator */}
                  {isRecording && (
                    <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 rounded bg-red-500 text-white text-xs">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Recording
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            {showTips && (
              <Card className="mt-4 border-yellow-500/20 bg-yellow-500/5">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-yellow-400">
                    <Lightbulb className="w-4 h-4" />
                    Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {currentQuestion.tips}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Question & Answer Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <Card className={aiSpeaking ? 'border-primary animate-pulse' : ''}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{currentQuestion.category}</Badge>
                  {aiSpeaking && (
                    <Badge variant="outline" className="gap-1">
                      <Volume2 className="w-3 h-3 animate-pulse" />
                      AI Speaking...
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl leading-relaxed flex items-start gap-3">
                  <Brain className="w-6 h-6 text-primary mt-1 shrink-0" />
                  {currentQuestion.text}
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Answer Section */}
            {!evaluation && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Your Response</span>
                    {isRecording ? (
                      <Badge variant="destructive" className="gap-1 animate-pulse">
                        <Mic className="w-3 h-3" />
                        Recording...
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm" onClick={startRecording} disabled={!micEnabled}>
                        <Mic className="w-4 h-4 mr-1" />
                        Start Speaking
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Your answer will appear here as you speak, or type directly..."
                    rows={6}
                    className="resize-none"
                  />
                  
                  <div className="flex gap-3 mt-4">
                    {isRecording && (
                      <Button variant="outline" onClick={stopRecording}>
                        <MicOff className="w-4 h-4 mr-2" />
                        Stop Recording
                      </Button>
                    )}
                    <Button 
                      className="ml-auto"
                      onClick={handleSubmit}
                      disabled={!currentAnswer.trim() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Submit Answer
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Evaluation Results */}
            {evaluation && (
              <div className="space-y-4">
                <Card className={`border-${evaluation.score >= 7 ? 'green' : 'yellow'}-500/20`}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      AI Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`text-4xl font-bold ${evaluation.score >= 7 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {evaluation.score}/10
                      </div>
                      <div className="flex-1">
                        <Progress value={evaluation.score * 10} className="h-2" />
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{evaluation.feedback}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-green-400 mb-2">✓ Strengths</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {evaluation.strengths.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-400 mb-2">→ Improve</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {evaluation.improvements.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full" onClick={handleNext}>
                  {currentQuestionIndex < liveInterviewQuestions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Finish Interview
                      <Trophy className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveInterviewPage;
