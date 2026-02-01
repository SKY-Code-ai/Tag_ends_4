import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useInterview } from '@/context/InterviewContext';
import { reportAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  Download,
  Share2,
  Loader2,
  Brain,
  BarChart3,
  MessageSquare
} from 'lucide-react';

const ResultsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
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

  const handleDashboard = () => {
    resetInterview();
    navigate('/dashboard');
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-blue-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score) => {
    if (score >= 8) return { text: 'Excellent', variant: 'success' };
    if (score >= 6) return { text: 'Good', variant: 'default' };
    if (score >= 4) return { text: 'Average', variant: 'warning' };
    return { text: 'Needs Work', variant: 'destructive' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Generating Your Report</h2>
          <p className="text-muted-foreground">Analyzing your interview performance...</p>
        </div>
      </div>
    );
  }

  if (!report && !currentInterview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>No Interview Data</CardTitle>
            <CardDescription>Start a new interview to see your results here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleNewInterview}>
              Start New Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scoreBadge = getScoreBadge(report?.averageScore || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-xl font-bold">Interview Complete!</h1>
              <p className="text-sm text-muted-foreground">{report?.domain} Interview</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        {report && (
          <>
            {/* Score Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Main Score */}
              <Card className="md:col-span-1 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-8 text-center">
                  <div className={`text-7xl font-bold mb-2 ${getScoreColor(report.averageScore)}`}>
                    {report.averageScore}
                  </div>
                  <div className="text-xl text-muted-foreground mb-4">out of 10</div>
                  <Badge variant={scoreBadge.variant} className="text-sm px-4 py-1">
                    {scoreBadge.text}
                  </Badge>
                </CardContent>
              </Card>

              {/* Score Breakdown */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <Brain className="w-4 h-4 text-blue-400" />
                        Technical Knowledge
                      </span>
                      <span className="text-sm font-medium">{report.averageScore}/10</span>
                    </div>
                    <Progress value={report.averageScore * 10} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-green-400" />
                        Communication
                      </span>
                      <span className="text-sm font-medium">N/A</span>
                    </div>
                    <Progress value={0} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Enable mic for analysis</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        Focus Score
                      </span>
                      <span className="text-sm font-medium">N/A</span>
                    </div>
                    <Progress value={0} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Enable camera for tracking</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Strengths */}
              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.strengths?.map((strength, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-green-400">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Gaps */}
              <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-yellow-400">
                    <AlertCircle className="w-5 h-5" />
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.gaps?.map((gap, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-yellow-400">•</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="border-blue-500/20 bg-blue-500/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-400">
                    <Lightbulb className="w-5 h-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.recommendations?.map((rec, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-blue-400">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Overall Feedback */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Overall Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {report.overallFeedback}
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleNewInterview}>
                Practice Another Domain
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={handleDashboard}>
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ResultsPage;
