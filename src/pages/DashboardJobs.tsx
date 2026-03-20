import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Filter,
  Building,
  TrendingUp,
  Bookmark,
  ExternalLink,
  MapPin,
  DollarSign,
  Clock,
  } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ApiService from "@/services/api";

const mockJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "Remote",
    type: "Full-time",
    salary: "$120k - $150k",
    posted: "2 days ago",
    match: 95,
    skills: ["React", "TypeScript", "Tailwind CSS", "Node.js"],
    logo: "TC",
    applyUrl: "https://jobs.example.com/apply/1",
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    location: "New York, NY",
    type: "Full-time",
    salary: "$100k - $130k",
    posted: "1 week ago",
    match: 88,
    skills: ["React", "Python", "PostgreSQL", "AWS"],
    logo: "SX",
    applyUrl: "https://jobs.example.com/apply/2",
  },
  {
    id: 3,
    title: "React Developer",
    company: "Digital Agency Co.",
    location: "San Francisco, CA",
    type: "Contract",
    salary: "$80 - $100/hr",
    posted: "3 days ago",
    match: 82,
    skills: ["React", "JavaScript", "CSS", "REST APIs"],
    logo: "DA",
    applyUrl: "https://jobs.example.com/apply/3",
  },
  {
    id: 4,
    title: "Software Engineer",
    company: "Enterprise Solutions",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$110k - $140k",
    posted: "5 days ago",
    match: 78,
    skills: ["Java", "Spring Boot", "React", "Kubernetes"],
    logo: "ES",
    applyUrl: "https://jobs.example.com/apply/4",
  },
  {
    id: 5,
    title: "UI/UX Developer",
    company: "Creative Studio",
    location: "Remote",
    type: "Part-time",
    salary: "$60k - $80k",
    posted: "1 day ago",
    match: 75,
    skills: ["React", "Figma", "CSS", "User Research"],
    logo: "CS",
    applyUrl: "https://jobs.example.com/apply/5",
  },
];

const DashboardJobs = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const { user, logout } = useAuth();

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: false },
    { icon: FileText, label: "My Resume", href: "/dashboard/resume", active: false },
    { icon: Briefcase, label: "Job Matches", href: "/dashboard/jobs", active: true },
    { icon: MessageSquare, label: "AI Chatbot", href: "/dashboard/chatbot", active: false },
    { icon: ClipboardCheck, label: "Assessments", href: "/dashboard/assessments", active: false },
    { icon: Camera, label: "Photo Analyzer", href: "/dashboard/photo", active: false },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", active: false },
  ];

  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await ApiService.getAllJobs();
        setJobs(response.jobs || []);
        setFilteredJobs(response.jobs || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error("Failed to load jobs. Displaying samples.");
        setJobs(mockJobs);
        setFilteredJobs(mockJobs);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
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
                  placeholder="Search jobs..."
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
            <h1 className="font-display text-3xl font-bold mb-2">Job Matches</h1>
            <p className="text-muted-foreground">
              Discover job opportunities matched for you based on your resume
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-64 space-y-6"
            >
              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5" />
                  <h3 className="font-display font-semibold">Filters</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Type</label>
                    <div className="space-y-2">
                      {["Full-time", "Part-time", "Contract", "Remote"].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-input" />
                          <span className="text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Experience Level</label>
                    <div className="space-y-2">
                      {["Entry Level", "Mid Level", "Senior", "Lead"].map((level) => (
                        <label key={level} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-input" />
                          <span className="text-sm">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="City or remote"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Jobs Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filteredJobs.length}</span> jobs
                </p>
                <select className="px-4 py-2 rounded-lg border border-input bg-background text-sm">
                  <option>Most Relevant</option>
                  <option>Most Recent</option>
                  <option>Highest Salary</option>
                </select>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                {filteredJobs.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground text-lg">No jobs found.</p>
                    </div>
                ) : (
                  filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-card border border-border/50 card-hover"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-display font-bold text-primary flex-shrink-0">
                        {job.company?.substring(0, 2).toUpperCase() || 'CO'}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-display text-lg font-semibold mb-1">{job.title}</h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building className="w-4 h-4" />
                              <span>{job.company}</span>
                            </div>
                          </div>
                          {job.match && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium flex-shrink-0">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              {job.match}% Match
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {(job.skills || job.required_skills || []).map((skill: any, idx: number) => (
                            <span key={idx} className="px-3 py-1 rounded-full bg-muted text-sm font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{job.posted}</span>
                          <div className="flex items-center gap-2">
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
                    </div>
                  </motion.div>
                )))}
              </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardJobs;
