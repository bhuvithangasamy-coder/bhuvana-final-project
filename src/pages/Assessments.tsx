import { useState } from "react";
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
  User,
  CheckCircle,
  Clock,
  Award,
  ArrowRight,
  Play,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const assessments = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    category: "Programming",
    level: "Beginner",
    duration: "15 mins",
    questions: 10,
    completed: true,
    score: 95,
    icon: "JS",
  },
  {
    id: 2,
    title: "React Advanced Concepts",
    category: "Frontend",
    level: "Advanced",
    duration: "20 mins",
    questions: 12,
    completed: true,
    score: 85,
    icon: "RC",
  },
  {
    id: 3,
    title: "System Design",
    category: "Backend",
    level: "Senior",
    duration: "30 mins",
    questions: 15,
    completed: false,
    score: null,
    icon: "SD",
  },
  {
    id: 4,
    title: "Database Design",
    category: "Backend",
    level: "Intermediate",
    duration: "20 mins",
    questions: 12,
    completed: false,
    score: null,
    icon: "DB",
  },
  {
    id: 5,
    title: "CSS Mastery",
    category: "Frontend",
    level: "Intermediate",
    duration: "15 mins",
    questions: 10,
    completed: false,
    score: null,
    icon: "CSS",
  },
  {
    id: 6,
    title: "Python for Data Science",
    category: "Data Science",
    level: "Intermediate",
    duration: "25 mins",
    questions: 14,
    completed: false,
    score: null,
    icon: "PY",
  },
];

const Assessments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { user, logout } = useAuth();

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

  const completedCount = assessments.filter((a) => a.completed).length;
  const avgScore = assessments
    .filter((a) => a.completed && a.score)
    .reduce((sum, a) => sum + (a.score || 0), 0) / completedCount || 0;

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase());
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
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm capitalize">{user?.username || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
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
            <button className="relative p-2 hover:bg-muted rounded-lg">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
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
                <p className="text-sm text-muted-foreground mb-4 flex-1">{assessment.category}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-medium">{assessment.level}</span>
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

                {assessment.completed ? (
                  <div className="p-3 rounded-lg bg-success/10 mb-4 border border-success/20">
                    <p className="text-sm font-medium text-success">Score: {assessment.score}%</p>
                  </div>
                ) : null}

                <Button variant={assessment.completed ? "outline" : "gradient"} className="w-full">
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
        </div>
      </main>
    </div>
  );
};

export default Assessments;
