import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  ArrowLeft, 
  ExternalLink, 
  Play, 
  FileText,
  Code,
  Brain,
  Video,
  Search,
  Star,
  Clock
} from 'lucide-react';

const resources = {
  categories: [
    { id: 'all', label: 'All', icon: BookOpen },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'article', label: 'Articles', icon: FileText },
    { id: 'practice', label: 'Practice', icon: Code },
  ],
  items: [
    {
      id: 1,
      title: 'System Design Interview Crash Course',
      type: 'video',
      duration: '45 min',
      difficulty: 'Medium',
      rating: 4.8,
      source: 'YouTube',
      url: '#',
      tags: ['System Design', 'Architecture']
    },
    {
      id: 2,
      title: 'Top 50 Java Interview Questions',
      type: 'article',
      duration: '15 min read',
      difficulty: 'Easy',
      rating: 4.5,
      source: 'GeeksforGeeks',
      url: '#',
      tags: ['Java', 'Basics']
    },
    {
      id: 3,
      title: 'Data Structures & Algorithms',
      type: 'practice',
      duration: '100+ problems',
      difficulty: 'Hard',
      rating: 4.9,
      source: 'LeetCode',
      url: '#',
      tags: ['DSA', 'Coding']
    },
    {
      id: 4,
      title: 'Python for Data Science',
      type: 'video',
      duration: '2 hours',
      difficulty: 'Easy',
      rating: 4.7,
      source: 'Coursera',
      url: '#',
      tags: ['Python', 'Data Science']
    },
    {
      id: 5,
      title: 'AWS Cloud Practitioner Guide',
      type: 'article',
      duration: '30 min read',
      difficulty: 'Medium',
      rating: 4.6,
      source: 'AWS Docs',
      url: '#',
      tags: ['Cloud', 'AWS']
    },
    {
      id: 6,
      title: 'React Interview Questions',
      type: 'practice',
      duration: '50 questions',
      difficulty: 'Medium',
      rating: 4.4,
      source: 'Frontend Masters',
      url: '#',
      tags: ['React', 'Frontend']
    },
  ]
};

const LearningResourcesPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredResources = resources.items.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'practice': return Code;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Learning Resources</h1>
            <p className="text-sm text-muted-foreground">Curated materials to ace your interviews</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {resources.categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
              >
                <cat.icon className="w-4 h-4 mr-2" />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => {
            const TypeIcon = getTypeIcon(resource.type);
            return (
              <Card 
                key={resource.id} 
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg bg-primary/10`}>
                      <TypeIcon className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant={getDifficultyColor(resource.difficulty)}>
                      {resource.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {resource.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {resource.rating}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{resource.source}</span>
                    <Button size="sm" variant="ghost">
                      {resource.type === 'video' ? (
                        <Play className="w-4 h-4 mr-1" />
                      ) : (
                        <ExternalLink className="w-4 h-4 mr-1" />
                      )}
                      {resource.type === 'video' ? 'Watch' : 'Open'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No resources found</p>
          </div>
        )}

        {/* Quick Links */}
        <Card className="mt-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Popular Interview Prep Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {['LeetCode', 'HackerRank', 'Pramp', 'InterviewBit'].map((platform) => (
                <Button key={platform} variant="outline" className="justify-start">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {platform}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LearningResourcesPage;
