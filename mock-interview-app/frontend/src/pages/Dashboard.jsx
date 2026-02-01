import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Code, 
  Brain, 
  Mic, 
  FileText, 
  BookOpen, 
  Trophy,
  ArrowRight,
  BarChart3,
  Clock,
  Target,
  LogOut,
  Video
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const quickActions = [
    { 
      icon: Video, 
      title: 'Live Interview', 
      description: 'Video interview with AI',
      href: '/live-interview',
      color: 'from-red-500 to-pink-600'
    },
    { 
      icon: Brain, 
      title: 'Practice Interview', 
      description: 'Domain-specific questions',
      href: '/domains',
      color: 'from-blue-500 to-purple-600'
    },
    { 
      icon: Code, 
      title: 'DSA Practice', 
      description: 'Company-specific coding',
      href: '/dsa',
      color: 'from-green-500 to-teal-600'
    },
    { 
      icon: FileText, 
      title: 'Resume Tools', 
      description: 'Upload, rate & build resumes',
      href: '/resume',
      color: 'from-orange-500 to-red-600'
    },
    { 
      icon: BookOpen, 
      title: 'Learning Hub', 
      description: 'Study materials & resources',
      href: '/resources',
      color: 'from-pink-500 to-purple-600'
    },
  ];

  const stats = [
    { icon: Target, label: 'Interviews', value: '0', change: '+0 this week' },
    { icon: Trophy, label: 'Avg Score', value: '0/10', change: 'No data yet' },
    { icon: Clock, label: 'Time Spent', value: '0h', change: 'Start practicing!' },
    { icon: BarChart3, label: 'Domains', value: '10', change: 'Available' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">MockMaster AI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/domains" className="text-muted-foreground hover:text-foreground transition-colors">
              Interviews
            </Link>
            <Link to="/dsa" className="text-muted-foreground hover:text-foreground transition-colors">
              DSA
            </Link>
            <Link to="/resume" className="text-muted-foreground hover:text-foreground transition-colors">
              Resume
            </Link>
            <Link to="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
              Resources
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, {user?.name || 'User'}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to ace your next interview? Choose how you'd like to practice today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              onClick={() => navigate(action.href)}
            >
              <CardContent className="p-6 relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  {action.title}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-5 h-5 text-blue-400" />
                <Badge variant="secondary">New</Badge>
              </div>
              <CardTitle className="text-lg">Voice Interview Mode</CardTitle>
              <CardDescription>
                Practice with speech-to-text. Get pronunciation feedback and communication analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" onClick={() => navigate('/domains')}>
                Try Voice Mode
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-400" />
                <Badge variant="success">AI Powered</Badge>
              </div>
              <CardTitle className="text-lg">Camera Focus Detection</CardTitle>
              <CardDescription>
                Get real-time feedback on eye contact, focus level, and body language.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" onClick={() => navigate('/domains')}>
                Enable Camera
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
