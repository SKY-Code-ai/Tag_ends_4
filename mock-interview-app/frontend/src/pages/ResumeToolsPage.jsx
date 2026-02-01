import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Award,
  Plus,
  X,
  Trash2
} from 'lucide-react';

const ResumeToolsPage = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [resumeScore, setResumeScore] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    summary: '',
    experiences: [],
    education: [],
    skills: [],
    certifications: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');
  
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
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

  const handleAnalyzeText = () => {
    if (!resumeText.trim()) return;
    setUploading(true);
    setTimeout(() => {
      setResumeScore({
        overall: 68,
        sections: {
          formatting: 75,
          content: 65,
          keywords: 60,
          experience: 72
        },
        strengths: [
          'Contains relevant experience',
          'Skills section present'
        ],
        improvements: [
          'Structure could be improved',
          'Add more specific achievements',
          'Include relevant keywords'
        ]
      });
      setUploading(false);
    }, 1500);
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { company: '', role: '', duration: '', description: '' }]
    }));
  };

  const removeExperience = (idx) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== idx)
    }));
  };

  const updateExperience = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) => i === idx ? { ...exp, [field]: value } : exp)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { school: '', degree: '', year: '' }]
    }));
  };

  const removeEducation = (idx) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx)
    }));
  };

  const updateEducation = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => i === idx ? { ...edu, [field]: value } : edu)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (idx) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }));
  };

  const addCertification = () => {
    if (newCert.trim()) {
      setFormData(prev => ({ ...prev, certifications: [...prev.certifications, newCert.trim()] }));
      setNewCert('');
    }
  };

  const removeCertification = (idx) => {
    setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== idx) }));
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setShowPreview(true);
    }, 2000);
  };

  const handleExportPDF = () => {
    alert('PDF export would be implemented here. In production, this would generate a downloadable PDF.');
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
              onClick={() => { setActiveTab(tab.id); setShowPreview(false); }}
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
                    accept=".pdf,.docx,.doc,.txt"
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
                        <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT (max 5MB)</p>
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
                  <Button 
                    className="mt-2 w-full" 
                    disabled={!resumeText.trim() || uploading}
                    onClick={handleAnalyzeText}
                  >
                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Analyze Text
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className={resumeScore ? '' : 'opacity-50'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Resume Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resumeScore ? (
                  <>
                    <div className="text-center mb-6 p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                      <div className="text-5xl font-bold text-primary mb-1">
                        {resumeScore.overall}
                      </div>
                      <div className="text-muted-foreground">out of 100</div>
                      <Badge className="mt-2" variant={resumeScore.overall >= 70 ? 'default' : 'warning'}>
                        {resumeScore.overall >= 80 ? 'Excellent' : resumeScore.overall >= 70 ? 'Good' : 'Needs Work'}
                      </Badge>
                    </div>

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
        {activeTab === 'builder' && !showPreview && (
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
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Full Name</label>
                      <Input 
                        placeholder="John Doe" 
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input 
                        type="email" 
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone</label>
                      <Input 
                        placeholder="+1 234 567 8900"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Professional Summary</label>
                      <Textarea 
                        placeholder="A brief summary of your experience..."
                        rows={3}
                        value={formData.summary}
                        onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="space-y-4">
                    {/* Work Experience */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span className="font-medium">Work Experience</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={addExperience}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        {formData.experiences.length === 0 ? (
                          <Button variant="outline" size="sm" className="w-full" onClick={addExperience}>
                            + Add Experience
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            {formData.experiences.map((exp, idx) => (
                              <div key={idx} className="p-3 bg-background rounded-lg space-y-2">
                                <div className="flex justify-between">
                                  <Input 
                                    placeholder="Company" 
                                    value={exp.company}
                                    onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                                    className="flex-1 mr-2"
                                  />
                                  <Button variant="ghost" size="icon" onClick={() => removeExperience(idx)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                                <Input 
                                  placeholder="Role" 
                                  value={exp.role}
                                  onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                                />
                                <Input 
                                  placeholder="Duration (e.g., 2020-2023)" 
                                  value={exp.duration}
                                  onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Education */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-primary" />
                            <span className="font-medium">Education</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={addEducation}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        {formData.education.length === 0 ? (
                          <Button variant="outline" size="sm" className="w-full" onClick={addEducation}>
                            + Add Education
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            {formData.education.map((edu, idx) => (
                              <div key={idx} className="p-3 bg-background rounded-lg space-y-2">
                                <div className="flex justify-between">
                                  <Input 
                                    placeholder="School/University" 
                                    value={edu.school}
                                    onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                                    className="flex-1 mr-2"
                                  />
                                  <Button variant="ghost" size="icon" onClick={() => removeEducation(idx)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                                <Input 
                                  placeholder="Degree" 
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                />
                                <Input 
                                  placeholder="Year" 
                                  value={edu.year}
                                  onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Code className="w-4 h-4 text-primary" />
                          <span className="font-medium">Skills</span>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <Input 
                            placeholder="Add a skill" 
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                          />
                          <Button variant="outline" size="icon" onClick={addSkill}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="gap-1">
                              {skill}
                              <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(idx)} />
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Certifications */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-4 h-4 text-primary" />
                          <span className="font-medium">Certifications</span>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <Input 
                            placeholder="Add a certification" 
                            value={newCert}
                            onChange={(e) => setNewCert(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                          />
                          <Button variant="outline" size="icon" onClick={addCertification}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.certifications.map((cert, idx) => (
                            <Badge key={idx} variant="secondary" className="gap-1">
                              {cert}
                              <X className="w-3 h-3 cursor-pointer" onClick={() => removeCertification(idx)} />
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex gap-4 mt-6 pt-6 border-t border-border">
                  <Button className="flex-1" onClick={handleGenerate} disabled={generating || !formData.fullName}>
                    {generating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    {generating ? 'Generating...' : 'Generate with AI'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowPreview(true)} disabled={!formData.fullName}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" onClick={handleExportPDF} disabled={!formData.fullName}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resume Preview */}
        {activeTab === 'builder' && showPreview && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Resume Preview</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Back to Edit
                </Button>
                <Button onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
            
            <Card className="max-w-2xl mx-auto p-8 bg-white text-black">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">{formData.fullName || 'Your Name'}</h1>
                <p className="text-gray-600">
                  {formData.email && formData.phone 
                    ? `${formData.email} | ${formData.phone}` 
                    : 'email@example.com | +1 234 567 8900'}
                </p>
              </div>

              {formData.summary && (
                <div className="mb-4">
                  <h2 className="text-lg font-semibold border-b border-gray-300 mb-2">Summary</h2>
                  <p className="text-sm text-gray-700">{formData.summary}</p>
                </div>
              )}

              {formData.experiences.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-lg font-semibold border-b border-gray-300 mb-2">Experience</h2>
                  {formData.experiences.map((exp, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between">
                        <strong>{exp.role}</strong>
                        <span className="text-gray-600">{exp.duration}</span>
                      </div>
                      <p className="text-gray-600">{exp.company}</p>
                    </div>
                  ))}
                </div>
              )}

              {formData.education.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-lg font-semibold border-b border-gray-300 mb-2">Education</h2>
                  {formData.education.map((edu, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between">
                        <strong>{edu.degree}</strong>
                        <span className="text-gray-600">{edu.year}</span>
                      </div>
                      <p className="text-gray-600">{edu.school}</p>
                    </div>
                  ))}
                </div>
              )}

              {formData.skills.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-lg font-semibold border-b border-gray-300 mb-2">Skills</h2>
                  <p className="text-sm text-gray-700">{formData.skills.join(', ')}</p>
                </div>
              )}

              {formData.certifications.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold border-b border-gray-300 mb-2">Certifications</h2>
                  <ul className="text-sm text-gray-700">
                    {formData.certifications.map((cert, idx) => (
                      <li key={idx}>• {cert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResumeToolsPage;
