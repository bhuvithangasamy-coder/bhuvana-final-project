import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Home,
  FileText,
  Briefcase,
  MessageSquare,
  ClipboardCheck,
  Camera,
  Settings,
  LogOut,
  Bell,
  Search,
  CheckCircle,
  Clock,
  Award,
  ArrowRight,
  Play,
  Lock,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ApiService from "@/services/api";

interface Assessment {
  id: number;
  title: string;
  category: string;
  level: string;
  duration: number | string;
  description: string;
  questions_count: number;
  completed?: boolean;
  score?: number;
  icon?: string;
  questions?: any;
}

const Assessments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [takingAssessment, setTakingAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  const { user, logout, isAuthenticated } = useAuth();

  // Fetch assessments and history data
  useEffect(() => {
    const fetchAssessments = async () => {
      // Only fetch if user is authenticated
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch available assessments
        const assessmentsResponse = await ApiService.getAssessments();
        const availableAssessments = assessmentsResponse.assessments || [];

        // Fetch user's assessment history
        const historyResponse = await ApiService.getAssessmentHistory();
        const history = historyResponse.history || [];

        // Create a map of completed assessments with their scores
        const completedMap = new Map();
        history.forEach((record: any) => {
          completedMap.set(record.assessment_id, {
            completed: true,
            score: record.score,
          });
        });

        // Merge assessment data with completion status
        const assessmentsWithStatus = availableAssessments.map((assessment: any) => {
          const completionData = completedMap.get(assessment.id);
          return {
            ...assessment,
            completed: completionData?.completed || false,
            score: completionData?.score || null,
            icon: getAssessmentIcon(assessment.title, assessment.category),
            duration: `${assessment.duration} mins`,
            questions: assessment.questions_count,
          };
        });

        setAssessments(assessmentsWithStatus);
      } catch (err: any) {
        console.error('Error fetching assessments:', err);
        setError(err.message || 'Failed to load assessments');
        toast.error('Failed to load assessments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  // Helper function to generate icons based on assessment title/category
  const getAssessmentIcon = (title: string, category: string): string => {
    const titleLower = title.toLowerCase();
    const categoryLower = category.toLowerCase();

    if (titleLower.includes('python') || titleLower.includes('data science')) return 'PY';
    if (titleLower.includes('javascript') || titleLower.includes('js')) return 'JS';
    if (titleLower.includes('react')) return 'RC';
    if (titleLower.includes('css')) return 'CSS';
    if (titleLower.includes('database') || titleLower.includes('db')) return 'DB';
    if (titleLower.includes('system') || titleLower.includes('design')) return 'SD';
    if (categoryLower.includes('programming')) return 'CODE';
    if (categoryLower.includes('web') || categoryLower.includes('frontend')) return 'WEB';
    if (categoryLower.includes('backend')) return 'BE';
    return 'AS';
  };

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: false },
    { icon: FileText, label: "My Resume", href: "/dashboard/resume", active: false },
    { icon: Briefcase, label: "Job Matches", href: "/dashboard/jobs", active: false },
    { icon: MessageSquare, label: "AI Chatbot", href: "/dashboard/chatbot", active: false },
    { icon: ClipboardCheck, label: "Assessments", href: "/dashboard/assessments", active: true },
    { icon: Camera, label: "Photo Analyzer", href: "/dashboard/photo", active: false },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", active: false },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

    const handleStartAssessment = async (assessment: Assessment) => {
    try {
      setLoading(true);
      const data = await ApiService.getAssessment(assessment.id);
      setTakingAssessment(data as any);
      setCurrentQuestion(0);
      setAnswers({});
      setAssessmentResult(null);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to start assessment');
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitAssessment = async () => {
    if (!takingAssessment) return;
    try {
      setIsSubmitting(true);
      const data = await ApiService.submitAssessment(takingAssessment.id, answers);
      setAssessmentResult(data);
      toast.success('Assessment submitted successfully!');
      
      // Update local state to show it's completed
      setAssessments(prev => prev.map(a => 
        a.id === takingAssessment.id 
          ? { ...a, completed: true, score: data.score } 
          : a
      ));
    } catch (err) {
      toast.error('Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };


  const completedCount = assessments.filter((a) => a.completed).length;
  const avgScore = assessments
    .filter((a) => a.completed && a.score !== null)
    .reduce((sum, a) => sum + (a.score || 0), 0) / completedCount || 0;

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "completed" && assessment.completed) ||
      (selectedFilter === "pending" && !assessment.completed);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border hidden lg:flex flex-col">
        <Link to="/" className="flex items-center gap-2 p-6 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl">ResumeAI</span>
        </Link>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

                <div className="p-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 h-11 bg-background rounded-lg border border-input text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium leading-tight">{user?.username || "User"}</span>
                <span className="text-xs text-muted-foreground leading-tight">{user?.email}</span>
              </div>
              <button className="relative p-2 hover:bg-muted rounded-lg">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl font-bold mb-2">Skill Assessments</h1>
            <p className="text-muted-foreground">
              Test and validate your technical skills with our comprehensive assessments
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading assessments...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-16">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Content - only show when not loading and no error */}
          
          {!loading && !error && takingAssessment && !assessmentResult && (
            <div className="max-w-3xl mx-auto">
              <Button variant="ghost" className="mb-6" onClick={() => setTakingAssessment(null)}>
                ← Back to Assessments
              </Button>
              <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
                  <h2 className="text-2xl font-bold font-display">{takingAssessment.title}</h2>
                  <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
                    Question {currentQuestion + 1} of {(takingAssessment.questions as any[])?.length || 0}
                  </span>
                </div>
                
                {takingAssessment.questions && (takingAssessment.questions as any[])[currentQuestion] && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-medium mb-4">
                      {(takingAssessment.questions as any[])[currentQuestion].question}
                    </h3>
                    <div className="space-y-3">
                      {((takingAssessment.questions as any[])[currentQuestion].options as string[]).map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSelect((takingAssessment.questions as any[])[currentQuestion].id, idx)}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${answers[(takingAssessment.questions as any[])[currentQuestion].id] === idx ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border/50 hover:border-primary/50 hover:bg-muted'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8 pt-4 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  
                  {currentQuestion < ((takingAssessment.questions as any[])?.length || 0) - 1 ? (
                    <Button 
                      onClick={() => setCurrentQuestion(prev => prev + 1)}
                      variant="gradient"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmitAssessment}
                      variant="gradient"
                      disabled={isSubmitting || Object.keys(answers).length < ((takingAssessment.questions as any[])?.length || 0)}
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Submit Assessment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {!loading && !error && takingAssessment && assessmentResult && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-success" />
              </div>
              <h2 className="text-3xl font-bold font-display mb-4">Assessment Completed!</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                You scored <span className="text-foreground font-bold">{assessmentResult.score}%</span>
                {assessmentResult.total_questions && (
                  <span className="block mt-2 text-primary font-medium">
                    ({assessmentResult.correct_answers} out of {assessmentResult.total_questions} correct)
                  </span>
                )}
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => setTakingAssessment(null)}>
                  Back to Assessments
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && !takingAssessment && (

            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-success/10 to-accent/10 border border-success/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-sm text-muted-foreground">Completed</span>
                  </div>
                  <p className="text-3xl font-bold">{completedCount}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Average Score</span>
                  </div>
                  <p className="text-3xl font-bold">{avgScore.toFixed(0)}%</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-card border border-border/50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted-foreground">Remaining</span>
                  </div>
                  <p className="text-3xl font-bold">{assessments.length - completedCount}</p>
                </motion.div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-8">
                {["all", "completed", "pending"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedFilter === filter
                        ? "bg-primary text-white"
                        : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {/* Assessments Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssessments.map((assessment, index) => (
                  <motion.div
                    key={assessment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-card border border-border/50 card-hover flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-display font-bold text-primary">
                        {assessment.icon}
                      </div>
                      {assessment.completed && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Done
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-lg font-semibold mb-1">{assessment.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1 capitalize">{assessment.category}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Level</span>
                        <span className="font-medium capitalize">{assessment.level}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{assessment.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Questions</span>
                        <span className="font-medium">{assessment.questions}</span>
                      </div>
                    </div>

                    {assessment.completed && assessment.score !== null ? (
                      <div className="p-3 rounded-lg bg-success/10 mb-4 border border-success/20">
                        <p className="text-sm font-medium text-success">Score: {assessment.score.toFixed(0)}%</p>
                      </div>
                    ) : null}

                    <Button 
                      variant={assessment.completed ? "outline" : "gradient"} 
                      className="w-full"
                      onClick={() => handleStartAssessment(assessment)}
                    >
                      {assessment.completed ? (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          Retake
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Start Assessment
                        </>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>

              {filteredAssessments.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No assessments found</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Assessments;
