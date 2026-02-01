import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useInterview } from '@/context/InterviewContext';
import { interviewAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Brain, 
  Database, 
  Cloud, 
  TestTube, 
  Users, 
  Zap,
  Box,
  Layers,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const domainConfig = {
  'Java': { icon: Code, color: 'from-orange-500 to-red-600', questions: 5 },
  'Python': { icon: Code, color: 'from-blue-500 to-teal-600', questions: 5 },
  'Data Science': { icon: Database, color: 'from-purple-500 to-pink-600', questions: 5 },
  'Cloud': { icon: Cloud, color: 'from-sky-500 to-blue-600', questions: 5 },
  'QA': { icon: TestTube, color: 'from-green-500 to-emerald-600', questions: 5 },
  'HR': { icon: Users, color: 'from-pink-500 to-rose-600', questions: 5 },
  'Electrical': { icon: Zap, color: 'from-yellow-500 to-orange-600', questions: 5 },
  'JavaScript': { icon: Box, color: 'from-yellow-400 to-yellow-600', questions: 5 },
  'React': { icon: Layers, color: 'from-cyan-400 to-blue-500', questions: 5 },
  'System Design': { icon: Brain, color: 'from-violet-500 to-purple-600', questions: 5 },
};

const DomainPage = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [error, setError] = useState('');

  const { user } = useAuth();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading domains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Select Interview Domain</h1>
              <p className="text-sm text-muted-foreground">Choose your area of expertise</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        {/* Domain Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {domains.map((domain) => {
            const config = domainConfig[domain] || { 
              icon: Brain, 
              color: 'from-gray-500 to-gray-600',
              questions: 5 
            };
            const Icon = config.icon;
            const isSelected = selectedDomain === domain;

            return (
              <Card 
                key={domain}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  isSelected 
                    ? 'ring-2 ring-primary shadow-lg shadow-primary/20' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedDomain(domain)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{domain}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {config.questions} interview questions
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Mixed Difficulty</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Start Button */}
        {selectedDomain && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border">
            <div className="container mx-auto flex items-center justify-between">
              <div>
                <p className="font-medium">Ready to practice <span className="text-primary">{selectedDomain}</span>?</p>
                <p className="text-sm text-muted-foreground">
                  {domainConfig[selectedDomain]?.questions || 5} questions • AI-powered feedback
                </p>
              </div>
              <Button 
                size="lg"
                onClick={handleStartInterview}
                disabled={starting}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {starting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Interview
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DomainPage;
