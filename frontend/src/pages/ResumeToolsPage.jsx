import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Upload, 
  Star, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Download,
  Eye,
  Loader2,
  FileUp,
  Briefcase,
  GraduationCap,
  Code,
  Award
} from 'lucide-react';

const ResumeToolsPage = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploading, setUploading] = useState(false);
  const [resumeScore, setResumeScore] = useState(null);
  const [resumeText, setResumeText] = useState('');
  
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      // Simulate AI analysis
      setTimeout(() => {
        setResumeScore({
          overall: 72,
          sections: {
            formatting: 85,
            content: 70,
            keywords: 65,
            experience: 75
          },
          strengths: [
            'Clear contact information',
            'Good use of action verbs',
            'Relevant technical skills listed'
          ],
          improvements: [
            'Add more quantifiable achievements',
            'Include relevant keywords for ATS',
            'Strengthen summary section'
          ]
        });
        setUploading(false);
      }, 2000);
    }
  };

  const tabs = [
    { id: 'upload', label: 'Upload & Rate', icon: Upload },
    { id: 'builder', label: 'Resume Builder', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Resume Tools</h1>
            <p className="text-sm text-muted-foreground">Upload, analyze & build your resume</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Upload & Rate Tab */}
        {activeTab === 'upload' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Resume
                </CardTitle>
                <CardDescription>
                  Upload your resume (PDF/DOCX) for AI-powered analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    {uploading ? (
                      <>
                        <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                        <p className="text-muted-foreground">Analyzing your resume...</p>
                      </>
                    ) : (
                      <>
                        <FileUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="font-medium mb-1">Click to upload</p>
                        <p className="text-sm text-muted-foreground">PDF or DOCX (max 5MB)</p>
                      </>
                    )}
                  </label>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Or paste resume text:</p>
                  <Textarea
                    placeholder="Paste your resume content here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={6}
                  />
                  <Button className="mt-2 w-full" disabled={!resumeText.trim()}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Text
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className={resumeScore ? '' : 'opacity-50 pointer-events-none'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Resume Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resumeScore ? (
                  <>
                    {/* Overall Score */}
                    <div className="text-center mb-6 p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                      <div className="text-5xl font-bold text-primary mb-1">
                        {resumeScore.overall}
                      </div>
                      <div className="text-muted-foreground">out of 100</div>
                      <Badge className="mt-2" variant={resumeScore.overall >= 70 ? 'default' : 'warning'}>
                        {resumeScore.overall >= 80 ? 'Excellent' : resumeScore.overall >= 70 ? 'Good' : 'Needs Work'}
                      </Badge>
                    </div>

                    {/* Section Scores */}
                    <div className="space-y-4 mb-6">
                      {Object.entries(resumeScore.sections).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm capitalize">{key}</span>
                            <span className="text-sm font-medium">{value}%</span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      ))}
                    </div>

                    {/* Strengths */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {resumeScore.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div>
                      <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Suggestions
                      </h4>
                      <ul className="space-y-1">
                        {resumeScore.improvements.map((s, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Upload a resume to see analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Builder Tab */}
        {activeTab === 'builder' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Resume Builder
                </CardTitle>
                <CardDescription>
                  Create a professional resume with AI-powered suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Full Name</label>
                      <Input placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input type="email" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone</label>
                      <Input placeholder="+1 234 567 8900" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Professional Summary</label>
                      <Textarea placeholder="A brief summary of your experience..." rows={3} />
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="space-y-4">
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="w-4 h-4 text-primary" />
                          <span className="font-medium">Work Experience</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          + Add Experience
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <span className="font-medium">Education</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          + Add Education
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Code className="w-4 h-4 text-primary" />
                          <span className="font-medium">Skills</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          + Add Skills
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-primary" />
                          <span className="font-medium">Certifications</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          + Add Certification
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex gap-4 mt-6 pt-6 border-t border-border">
                  <Button className="flex-1">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate with AI
                  </Button>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResumeToolsPage;
