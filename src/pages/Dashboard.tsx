import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ApiService from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  ChevronRight,
  User,
} from "lucide-react";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recruiterStats, setRecruiterStats] = useState<any | null>(null);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplicationDetail, setSelectedApplicationDetail] = useState<any | null>(null);
  const [appHistory, setAppHistory] = useState<any[] | null>(null);
  const [appNotes, setAppNotes] = useState<any[] | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [appsLoading, setAppsLoading] = useState(false);
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [postJobLoading, setPostJobLoading] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', location: '', salary: '', job_type: '', skills: '', description: '' });
  const [applicationsCounts, setApplicationsCounts] = useState({ total: 0, pending: 0, selected: 0, rejected: 0 });
  const [seekerJobs, setSeekerJobs] = useState<any[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect recruiters/admins to the admin page (restore previous behavior)
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'admin')) {
      navigate('/admin');
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (user && user.role === 'admin') {
          const stats = await ApiService.getRecruiterDashboard();
          setRecruiterStats(stats);

          const jobsResp = await ApiService.getMyJobs();
          setMyJobs(jobsResp.jobs || []);
        } else if (user && user.role === 'user') {
          const jobsResp = await ApiService.getAllJobs();
          setSeekerJobs((jobsResp.jobs || []).slice(0, 4));
        }
      } catch (err) {
        // ignore silently; keep defaults
        console.error('Failed to load dashboard data', err);
      }
    };

    loadDashboardData();
  }, [user]);

  // Aggregate application counts across all jobs
  useEffect(() => {
    const aggregate = async () => {
      if (!user || user.role !== 'admin' || !myJobs.length) return;
      let total = 0, pending = 0, selected = 0, rejected = 0;
      try {
        for (const job of myJobs) {
          try {
            const resp = await ApiService.getApplications(job.id);
            const apps = Array.isArray(resp) ? resp : resp.applications || resp;
            const list = apps || [];
            total += list.length;
            for (const a of list) {
              const s = (a.status || '').toLowerCase();
              if (s === 'pending') pending++;
              else if (s === 'selected') selected++;
              else if (s === 'rejected') rejected++;
            }
          } catch (e) {
            // continue
          }
        }
      } catch (e) {
        console.error('Aggregation error', e);
      }
      setApplicationsCounts({ total, pending, selected, rejected });
    };

    aggregate();
  }, [myJobs, user]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const openApplications = async (job: any) => {
    setSelectedJob(job);
    setIsAppsOpen(true);
    setAppsLoading(true);
    try {
      const resp = await ApiService.getApplications(job.id);
      // resp may be array or object depending on backend; normalize
      const apps = Array.isArray(resp) ? resp : resp.applications || resp;
      setApplications(apps || []);
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : "Failed to load applications");
      setApplications([]);
    } finally {
      setAppsLoading(false);
    }
  };

  const updateApplication = async (appId: number, status: string) => {
    try {
      const res = await ApiService.updateApplicationStatus(appId, status);
      toast.success(res.message || "Status updated");
      // update local state
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const downloadResume = async (appId: number) => {
    try {
      const { blob, filename } = await ApiService.downloadApplicationResume(appId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Failed to download resume');
    }
  };

  const previewResume = async (appId: number) => {
    try {
      const { blob, filename } = await ApiService.downloadApplicationResume(appId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // do not revoke immediately to allow preview; revoke after short timeout
      setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 30);
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Failed to preview resume');
    }
  };

  const openApplicationDetails = async (app: any) => {
    setSelectedApplicationDetail(app);
    setDetailLoading(true);
    try {
      const hist = await ApiService.getApplicationHistory(app.id);
      const notes = await ApiService.getApplicationNotes(app.id);
      setAppHistory(Array.isArray(hist) ? hist : hist.history || hist);
      setAppNotes(Array.isArray(notes) ? notes : notes.notes || notes);
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Failed to load details');
      setAppHistory([]);
      setAppNotes([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const submitNote = async () => {
    if (!selectedApplicationDetail) return;
    try {
      await ApiService.addApplicationNote(selectedApplicationDetail.id, noteContent);
      toast.success('Note added');
      setNoteContent('');
      const notes = await ApiService.getApplicationNotes(selectedApplicationDetail.id);
      setAppNotes(Array.isArray(notes) ? notes : notes.notes || notes);
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Failed to add note');
    }
  };

  const sendMessage = async () => {
    if (!selectedApplicationDetail) return;
    try {
      await ApiService.messageApplicant(selectedApplicationDetail.id, messageSubject, messageBody);
      toast.success('Message sent');
      setMessageSubject('');
      setMessageBody('');
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const openPostJob = () => setPostJobOpen(true);

  const submitPostJob = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setPostJobLoading(true);
    try {
      const payload = {
        title: newJob.title,
        location: newJob.location,
        salary: newJob.salary,
        job_type: newJob.job_type,
        skills: newJob.skills,
        description: newJob.description,
      };
      const res = await ApiService.postJob(payload);
      toast.success(res.message || 'Job posted');
      // refresh jobs and stats
      const jobsResp = await ApiService.getMyJobs();
      setMyJobs(jobsResp.jobs || []);
      const stats = await ApiService.getRecruiterDashboard();
      setRecruiterStats(stats);
      setNewJob({ title: '', location: '', salary: '', job_type: '', skills: '', description: '' });
      setPostJobOpen(false);
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Failed to post job');
    } finally {
      setPostJobLoading(false);
    }
  };

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
    { icon: FileText, label: "My Resume", href: "/dashboard/resume" },
    { icon: Briefcase, label: "Job Matches", href: "/dashboard/jobs" },
    { icon: MessageSquare, label: "AI Chatbot", href: "/dashboard/chatbot" },
    { icon: ClipboardCheck, label: "Assessments", href: "/dashboard/assessments" },
    { icon: Camera, label: "Photo Analyzer", href: "/dashboard/photo" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const stats = recruiterStats
    ? [
        { icon: TrendingUp, label: 'Total Jobs', value: String(recruiterStats.total_jobs || 0), change: '', color: 'text-primary' },
        { icon: Target, label: 'Active Jobs', value: String(recruiterStats.active_jobs || 0), change: '', color: 'text-accent' },
        { icon: Award, label: 'Expired Jobs', value: String(recruiterStats.expired_jobs || 0), change: '', color: 'text-warning' },
        { icon: FileText, label: 'Applications', value: String(recruiterStats.applications || 0), change: '', color: 'text-success' },
      ]
    : [
        { icon: TrendingUp, label: 'ATS Score', value: '85%', change: '+5%', color: 'text-success' },
        { icon: Target, label: 'Job Matches', value: '23', change: '+8', color: 'text-primary' },
        { icon: Award, label: 'Skills Verified', value: '12', change: '+2', color: 'text-accent' },
        { icon: FileText, label: 'Applications', value: '7', change: '+3', color: 'text-warning' },
      ];

  const recentJobs = [
    { title: "Senior Frontend Developer", company: "TechCorp Inc.", match: 95, location: "Remote" },
    { title: "Full Stack Engineer", company: "StartupXYZ", match: 88, location: "New York, NY" },
    { title: "React Developer", company: "Digital Agency", match: 82, location: "San Francisco, CA" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border hidden lg:flex flex-col">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 p-6 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          {/* Applications Overview (Recruiter) - full width aligned with stats */}
          {user && user.role === 'admin' && (
            <div className="mb-8 w-full">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-card border border-border/50 w-full"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="font-display text-lg font-semibold">Applications Overview</h3>
                    <p className="text-sm text-muted-foreground">At-a-glance counts for all your job postings.</p>
                  </div>

                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{applicationsCounts.total}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{applicationsCounts.pending}</div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{applicationsCounts.selected}</div>
                      <div className="text-sm text-muted-foreground">Selected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{applicationsCounts.rejected}</div>
                      <div className="text-sm text-muted-foreground">Rejected</div>
                    </div>
                  </div>

                  <div>
                    <Button variant="gradient" onClick={openPostJob}>Post Job</Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
          <span className="font-display font-bold text-xl">ResumeAI</span>
        </Link>

        {/* Navigation */}
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

        {/* User Profile */}
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
                <Input
                  placeholder="Search jobs, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-background"
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
              <div className="lg:hidden">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl font-bold mb-2">Welcome back, {user?.username || "User"}! 👋</h1>
            <p className="text-muted-foreground">
              Here's an overview of your career progress and opportunities.
            </p>
          </motion.div>
          {/* Applications Dialog */}
          <Dialog open={isAppsOpen} onOpenChange={setIsAppsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Applications for {selectedJob?.title}</DialogTitle>
                <DialogDescription>
                  Review candidate applications and update their status.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-3 max-h-64 overflow-auto">
                {appsLoading ? (
                  <div className="text-sm text-muted-foreground">Loading applications...</div>
                ) : applications.length ? (
                  applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50">
                      <div>
                        <div className="font-medium">{app.name || app.candidate_name || app.email}</div>
                        <div className="text-sm text-muted-foreground">{app.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm px-2 py-1 rounded-md bg-muted">{app.status}</span>
                        <Button size="sm" variant="ghost" onClick={() => previewResume(app.id)}>Preview</Button>
                        <Button size="sm" variant="ghost" onClick={() => downloadResume(app.id)}>Download</Button>
                        <Button size="sm" variant="ghost" onClick={() => updateApplication(app.id, 'Selected')}>Accept</Button>
                        <Button size="sm" variant="ghost" onClick={() => updateApplication(app.id, 'Rejected')}>Reject</Button>
                        <Button size="sm" onClick={() => openApplicationDetails(app)}>Details</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No applications yet.</div>
                )}
              </div>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {selectedApplicationDetail && (
            <div className="mt-4 p-4 rounded-lg bg-card border border-border/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-medium">{selectedApplicationDetail.name || selectedApplicationDetail.candidate_name || selectedApplicationDetail.email}</h4>
                  <div className="text-sm text-muted-foreground">{selectedApplicationDetail.email}</div>
                  <div className="mt-2 text-sm">Status: <span className="font-medium">{selectedApplicationDetail.status}</span></div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => previewResume(selectedApplicationDetail.id)}>Preview Resume</Button>
                  <Button size="sm" onClick={() => downloadResume(selectedApplicationDetail.id)}>Download</Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">History</h5>
                  {detailLoading ? (
                    <div className="text-sm text-muted-foreground">Loading history...</div>
                  ) : appHistory && appHistory.length ? (
                    <ul className="space-y-2 text-sm">
                      {appHistory.map((h: any) => (
                        <li key={h.id || h.changed_at} className="p-2 rounded-md bg-muted/30">
                          <div className="font-medium">{h.status}</div>
                          <div className="text-xs text-muted-foreground">{h.changed_by || 'system'} • {h.changed_at}</div>
                          {h.note && <div className="mt-1 text-sm">{h.note}</div>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-muted-foreground">No history available.</div>
                  )}
                </div>

                <div>
                  <h5 className="font-medium mb-2">Notes</h5>
                  {detailLoading ? (
                    <div className="text-sm text-muted-foreground">Loading notes...</div>
                  ) : appNotes && appNotes.length ? (
                    <ul className="space-y-2 text-sm">
                      {appNotes.map((n: any) => (
                        <li key={n.id || n.created_at} className="p-2 rounded-md bg-muted/30">
                          <div className="text-xs text-muted-foreground">{n.author_id || 'you'} • {n.created_at}</div>
                          <div className="mt-1">{n.content}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-muted-foreground">No notes yet.</div>
                  )}

                  <div className="mt-3">
                    <Textarea placeholder="Add an internal note" value={noteContent} onChange={(e: any) => setNoteContent(e.target.value)} rows={3} />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={submitNote} disabled={!noteContent}>Add Note</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setNoteContent(''); }}>Clear</Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium mb-2">Message Applicant</h5>
                    <Input placeholder="Subject" value={messageSubject} onChange={(e: any) => setMessageSubject(e.target.value)} />
                    <Textarea placeholder="Message body" value={messageBody} onChange={(e: any) => setMessageBody(e.target.value)} rows={4} />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={sendMessage} disabled={!messageSubject || !messageBody}>Send</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setMessageSubject(''); setMessageBody(''); }}>Cancel</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Post Job Dialog */}
          <Dialog open={postJobOpen} onOpenChange={setPostJobOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post a New Job</DialogTitle>
                <DialogDescription>Fill in the job details to publish a new opening.</DialogDescription>
              </DialogHeader>

              <form onSubmit={submitPostJob} className="mt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium">Job Title</label>
                  <Input value={newJob.title} onChange={(e: any) => setNewJob(prev => ({ ...prev, title: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input value={newJob.location} onChange={(e: any) => setNewJob(prev => ({ ...prev, location: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Salary</label>
                  <Input value={newJob.salary} onChange={(e: any) => setNewJob(prev => ({ ...prev, salary: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Job Type</label>
                  <Input value={newJob.job_type} onChange={(e: any) => setNewJob(prev => ({ ...prev, job_type: e.target.value }))} placeholder="Full-time, Part-time, Contract" />
                </div>
                <div>
                  <label className="text-sm font-medium">Skills (comma separated)</label>
                  <Input value={newJob.skills} onChange={(e: any) => setNewJob(prev => ({ ...prev, skills: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={newJob.description} onChange={(e: any) => setNewJob(prev => ({ ...prev, description: e.target.value }))} rows={5} />
                </div>

                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="ghost" onClick={() => setPostJobOpen(false)}>Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={postJobLoading}>{postJobLoading ? 'Posting...' : 'Post Job'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
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
                  <span className={`text-sm font-medium ${stat.color}`}>{stat.change}</span>
                </div>
                <p className="font-display text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Resume CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border border-primary/20"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold mb-2">
                    Upload Your Latest Resume
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Get instant AI analysis, ATS score, and personalized job recommendations.
                  </p>
                  <Link to="/dashboard/resume">
                    <Button variant="gradient">
                      <Upload className="w-4 h-4" />
                      Upload Resume
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-2xl bg-card border border-border/50"
            >
              <h3 className="font-display text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/dashboard/chatbot"
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="flex-1 font-medium text-sm">Ask AI Career Coach</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link
                  to="/dashboard/assessments"
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <ClipboardCheck className="w-5 h-5 text-accent" />
                  <span className="flex-1 font-medium text-sm">Take Skill Assessment</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link
                  to="/dashboard/photo"
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Camera className="w-5 h-5 text-warning" />
                  <span className="flex-1 font-medium text-sm">Analyze Profile Photo</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Recent Job Matches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-6 rounded-2xl bg-card border border-border/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold">Top Job Matches</h3>
              <Link to="/dashboard/jobs" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
              <div className="space-y-4">
                {user && user.role === 'admin' ? (
                  myJobs.length ? (
                    myJobs.map((job: any) => (
                      <div key={job.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.location} • {job.job_type || ''}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">{job.status}</span>
                          <Button size="sm" onClick={() => openApplications(job)}>View Applications</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No jobs posted yet.</div>
                  )
                ) : (
                  seekerJobs.map((job, index) => (
                    <div
                      key={job.id || index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate('/apply', { state: { job } })}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-display font-bold text-primary">
                        {job.company?.substring(0, 2).toUpperCase() || 'CO'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {job.company} • {job.location}
                        </p>
                      </div>
                      <div className="text-right">
                        {job.match && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
                          {job.match}% Match
                        </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground inline-block ml-2" />
                      </div>
                    </div>
                  ))
                )}
              </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
