import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Code,
  Building2,
  Play,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Timer,
  ChevronRight,
  Eye,
  EyeOff,
  RotateCcw
} from 'lucide-react';

// DSA Problems by Company
const dsaProblems = {
  google: {
    name: 'Google',
    color: 'from-blue-500 to-green-500',
    problems: [
      {
        id: 1,
        title: 'Two Sum',
        difficulty: 'Easy',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        example: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9',
        hints: ['Try using a hash map', 'Store complement values', 'One-pass solution is possible'],
        solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`
      },
      {
        id: 2,
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        example: 'Input: s = "()[]{}"\nOutput: true\n\nInput: s = "([)]"\nOutput: false',
        hints: ['Use a stack', 'Push opening brackets', 'Pop and compare for closing'],
        solution: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  
  for (let char of s) {
    if (char in map) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`
      }
    ]
  },
  amazon: {
    name: 'Amazon',
    color: 'from-orange-500 to-yellow-500',
    problems: [
      {
        id: 3,
        title: 'Maximum Subarray',
        difficulty: 'Medium',
        description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
        example: 'Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: [4,-1,2,1] has the largest sum = 6.',
        hints: ['Kadanes Algorithm', 'Track current sum and max sum', 'Reset when current goes negative'],
        solution: `function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`
      },
      {
        id: 4,
        title: 'Merge Two Sorted Lists',
        difficulty: 'Easy',
        description: 'Merge two sorted linked lists and return it as a sorted list.',
        example: 'Input: list1 = [1,2,4], list2 = [1,3,4]\nOutput: [1,1,2,3,4,4]',
        hints: ['Use a dummy head', 'Compare values', 'Attach remaining nodes'],
        solution: `function mergeTwoLists(list1, list2) {
  const dummy = { val: 0, next: null };
  let current = dummy;
  
  while (list1 && list2) {
    if (list1.val < list2.val) {
      current.next = list1;
      list1 = list1.next;
    } else {
      current.next = list2;
      list2 = list2.next;
    }
    current = current.next;
  }
  current.next = list1 || list2;
  return dummy.next;
}`
      }
    ]
  },
  meta: {
    name: 'Meta',
    color: 'from-blue-600 to-purple-600',
    problems: [
      {
        id: 5,
        title: 'Reverse Linked List',
        difficulty: 'Easy',
        description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
        example: 'Input: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]',
        hints: ['Use three pointers', 'prev, current, next', 'Iterative or recursive'],
        solution: `function reverseList(head) {
  let prev = null;
  let current = head;
  
  while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  return prev;
}`
      }
    ]
  },
  microsoft: {
    name: 'Microsoft',
    color: 'from-cyan-500 to-blue-500',
    problems: [
      {
        id: 6,
        title: 'Binary Search',
        difficulty: 'Easy',
        description: 'Given a sorted array of distinct integers and a target value, return the index if found. If not, return -1.',
        example: 'Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4',
        hints: ['Use left and right pointers', 'Calculate mid', 'Narrow search space'],
        solution: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`
      }
    ]
  }
};

const DSAPracticePage = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();

  const companies = Object.keys(dsaProblems);

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      alert('Code execution simulated! In production, this would run against test cases.');
    }, 1500);
  };

  const resetProblem = () => {
    setUserCode('');
    setShowHints(false);
    setShowSolution(false);
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => {
              if (selectedProblem) setSelectedProblem(null);
              else if (selectedCompany) setSelectedCompany(null);
              else navigate('/dashboard');
            }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Code className="w-5 h-5" />
                DSA Practice
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedCompany ? dsaProblems[selectedCompany].name : 'Practice by Top Companies'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Company Selection */}
        {!selectedCompany && (
          <div className="grid md:grid-cols-2 gap-6">
            {companies.map((company) => (
              <Card 
                key={company}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                onClick={() => setSelectedCompany(company)}
              >
                <div className={`h-2 bg-gradient-to-r ${dsaProblems[company].color}`} />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {dsaProblems[company].name}
                  </CardTitle>
                  <CardDescription>
                    {dsaProblems[company].problems.length} coding problems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {dsaProblems[company].problems.slice(0, 3).map((p) => (
                      <Badge key={p.id} variant={getDifficultyColor(p.difficulty)}>
                        {p.difficulty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Problem List */}
        {selectedCompany && !selectedProblem && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">
              {dsaProblems[selectedCompany].name} Interview Problems
            </h2>
            {dsaProblems[selectedCompany].problems.map((problem) => (
              <Card 
                key={problem.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setSelectedProblem(problem)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant={getDifficultyColor(problem.difficulty)}>
                      {problem.difficulty}
                    </Badge>
                    <span className="font-medium">{problem.title}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Problem View */}
        {selectedProblem && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Problem Description */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant={getDifficultyColor(selectedProblem.difficulty)}>
                      {selectedProblem.difficulty}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={resetProblem}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                  <CardTitle className="text-xl">{selectedProblem.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{selectedProblem.description}</p>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Example:</h4>
                    <pre className="text-sm whitespace-pre-wrap">{selectedProblem.example}</pre>
                  </div>
                </CardContent>
              </Card>

              {/* Hints */}
              <Card>
                <CardHeader className="py-3">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between"
                    onClick={() => setShowHints(!showHints)}
                  >
                    <span className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      Hints ({selectedProblem.hints.length})
                    </span>
                    {showHints ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </CardHeader>
                {showHints && (
                  <CardContent className="pt-0">
                    <ol className="list-decimal list-inside space-y-2">
                      {selectedProblem.hints.map((hint, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">{hint}</li>
                      ))}
                    </ol>
                  </CardContent>
                )}
              </Card>

              {/* Solution */}
              <Card className="border-primary/20">
                <CardHeader className="py-3">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between"
                    onClick={() => setShowSolution(!showSolution)}
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      View Solution
                    </span>
                    {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </CardHeader>
                {showSolution && (
                  <CardContent className="pt-0">
                    <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{selectedProblem.solution}</code>
                    </pre>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Code Editor */}
            <div className="space-y-4">
              <Card className="h-full">
                <CardHeader className="py-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Your Solution</span>
                    <Badge variant="outline">JavaScript</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    placeholder={`function ${selectedProblem.title.toLowerCase().replace(/\s+/g, '')}(...) {\n  // Write your code here\n}`}
                    className="min-h-[400px] font-mono text-sm border-0 rounded-none resize-none focus:ring-0"
                  />
                </CardContent>
                <div className="p-4 border-t border-border flex gap-3">
                  <Button 
                    className="flex-1"
                    onClick={handleRunCode}
                    disabled={!userCode.trim() || isRunning}
                  >
                    {isRunning ? (
                      <>
                        <Timer className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Code
                      </>
                    )}
                  </Button>
                  <Button variant="outline">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DSAPracticePage;
