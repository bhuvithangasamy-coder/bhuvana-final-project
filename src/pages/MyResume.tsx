import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Upload,
  Bell,
  Search,
  TrendingUp,
  Target,
  Award,
  Download,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Building,
  MapPin,
  DollarSign,
  ExternalLink,
  Bookmark,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ApiService from "@/services/api";

// Mock job matches based on resume
const mockJobMatches = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "Remote",
    type: "Full-time",
    salary: "$120k - $150k",
    match: 95,
    matchReasons: ["Strong React skills", "TypeScript proficiency", "Leadership experience"],
    logo: "TC",
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    location: "New York, NY",
    type: "Full-time",
    salary: "$100k - $130k",
    match: 88,
    matchReasons: ["Backend experience", "API design", "Database knowledge"],
    logo: "SX",
  },
  {
    id: 3,
    title: "React Developer",
    company: "Digital Agency Co.",
    location: "San Francisco, CA",
    type: "Contract",
    salary: "$80 - $100/hr",
    match: 82,
    matchReasons: ["Modern UI skills", "Component design", "Performance optimization"],
    logo: "DA",
  },
  {
    id: 4,
    title: "Software Engineer",
    company: "Enterprise Solutions",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$110k - $140k",
    match: 78,
    matchReasons: ["System design", "Code quality focus", "Team collaboration"],
    logo: "ES",
  },
];

interface ResumeData {
  filename: string;
  uploaded_at: string;
  ats_score: number;
  skills: string[];
}

const MyResume = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, logout } = useAuth();

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: false },
    { icon: FileText, label: "My Resume", href: "/dashboard/resume", active: true },
    { icon: Briefcase, label: "Job Matches", href: "/dashboard/jobs", active: false },
    { icon: MessageSquare, label: "AI Chatbot", href: "/dashboard/chatbot", active: false },
    { icon: ClipboardCheck, label: "Assessments", href: "/dashboard/assessments", active: false },
    { icon: Camera, label: "Photo Analyzer", href: "/dashboard/photo", active: false },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", active: false },
  ];

  const resumeStats = [
    { icon: TrendingUp, label: "ATS Score", value: resumeData ? `${resumeData.ats_score}%` : "—", color: "text-success" },
    { icon: Target, label: "Job Matches", value: resumeData ? mockJobMatches.length : "0", color: "text-primary" },
    { icon: Award, label: "Skills Found", value: resumeData ? resumeData.skills.length : "0", color: "text-accent" },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileUpload(e.target.files[0]);
      // Reset the input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".pdf") && !file.type.includes("pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }

    if (!user) {
      toast.error("Please log in to upload a resume");
      return;
    }

    setIsUploading(true);
    try {
      const response = await ApiService.uploadResume(file);
      setResumeData(response.resume);
      toast.success("Resume uploaded successfully! Job matches updated.");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadResume = () => {
    if (resumeData) {
      toast.success("Downloading resume...");
    }
  };

  const deleteResume = () => {
    setResumeData(null);
    toast.success("Resume deleted successfully");
  };

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
                  placeholder="Search jobs, skills..."
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
            <h1 className="font-display text-3xl font-bold mb-2">My Resume</h1>
            <p className="text-muted-foreground">
              Upload your resume to get AI-powered analysis and job recommendations
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {resumeStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border/50 card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <p className="font-display text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resume Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="p-6 rounded-2xl bg-card border border-border/50 h-full">
                <h3 className="font-display text-lg font-semibold mb-6">Resume File</h3>

                {!resumeData ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                        <p className="font-medium mb-2">Uploading resume...</p>
                        <p className="text-sm text-muted-foreground">Please wait while we analyze your resume</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <p className="font-medium mb-2">Drop your resume here</p>
                        <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleFileInput}
                          className="hidden"
                          id="resume-input"
                          disabled={isUploading}
                        />
                        <label htmlFor="resume-input">
                          <div className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            Choose File
                          </div>
                        </label>
                        <p className="text-xs text-muted-foreground mt-4">PDF only, max 10MB</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-success" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{resumeData.filename}</p>
                          <p className="text-xs text-muted-foreground">Uploaded on {new Date(resumeData.uploaded_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button variant="outline" size="sm" className="w-full" onClick={downloadResume}>
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive hover:text-destructive"
                        onClick={deleteResume}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Resume
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Resume Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              {resumeData ? (
                <div className="space-y-6">
                  {/* ATS Score */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-success/10 to-accent/10 border border-success/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-lg font-semibold">ATS Score Analysis</h3>
                      <span className="text-3xl font-bold text-success">{resumeData.ats_score}%</span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Your resume is optimized for Applicant Tracking Systems. You're in the top 15% of resumes!
                    </p>
                    <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-success to-accent transition-all duration-500"
                        style={{ width: `${resumeData.ats_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Skills Extracted */}
                  <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <h3 className="font-display text-lg font-semibold mb-4">Skills Detected</h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      <FileText className="w-4 h-4" />
                      View Detailed Analysis
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-card border border-border/50 text-center border-dashed">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-muted-foreground">No resume uploaded yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload your resume to see ATS score and skill analysis
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Recommended Jobs */}
          {resumeData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 rounded-2xl bg-card border border-border/50"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Recommended Jobs for You
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on your resume skills and experience
                  </p>
                </div>
                <Link to="/dashboard/jobs" className="text-sm text-primary hover:underline">
                  View all jobs
                </Link>
              </div>

              <div className="space-y-4">
                {mockJobMatches.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-6 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-display font-bold text-primary flex-shrink-0">
                        {job.logo}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h4 className="font-semibold">{job.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building className="w-4 h-4" />
                              {job.company}
                            </div>
                          </div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium flex-shrink-0">
                            {job.match}% Match
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </span>
                        </div>

                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-2">Why this match:</p>
                          <div className="flex flex-wrap gap-2">
                            {job.matchReasons.map((reason) => (
                              <span key={reason} className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-border">
                          <Button variant="ghost" size="sm">
                            <Bookmark className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => navigate('/apply', { state: { job } })}
                          >
                            Apply Now
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyResume;
