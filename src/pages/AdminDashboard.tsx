import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  FileText,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Bell,
  Search,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

import ApiService from "@/services/api";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  
  if (!user || (user.role !== "admin" && user.role !== "job_poster")) {
    return <Navigate to="/" replace />;
  }

  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    expiredJobs: 0,
    totalApplications: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user.role === "job_poster" || user.role === "admin") {
          const response = await ApiService.getRecruiterDashboard();
          setStats({
            totalJobs: response.total_jobs || 0,
            activeJobs: response.active_jobs || 0,
            expiredJobs: response.expired_jobs || 0,
            totalApplications: response.applications || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchDashboardData();
  }, [user.role]);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border hidden lg:flex flex-col">
        <Link to="/" className="flex items-center gap-2 p-6 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg">
            {user?.role === "admin" ? "ResumeAI Admin" : "Job Poster Dashboard"}
          </span>
        </Link>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors bg-primary/10 text-primary"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin/users"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Manage Users</span>
            </Link>
          )}
          <Link
            to="/admin/jobs"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Briefcase className="w-5 h-5" />
            <span className="font-medium">Manage Jobs</span>
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin/assessments"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Manage Assessments</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">
              Logout {user?.role === "admin" ? "Admin" : "Poster"}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        <header className="sticky top-0 z-40 glass border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-xl relative hidden md:block">
               <h2 className="font-display text-xl font-semibold">
                 {user?.role === "admin" ? "Admin Panel" : "Job Poster Panel"}
               </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium leading-tight">{user?.username || "Admin"}</span>
                <span className="text-xs text-muted-foreground leading-tight">{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl font-bold mb-2">Welcome Back, {user?.username || "User"}</h1>
            <p className="text-muted-foreground">Here is the overview of the system.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-3xl bg-card border border-border/50 cursor-pointer"
              onClick={() => navigate('/admin/jobs?focus=list')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground font-medium mb-1">Total Jobs Posted</p>
              <h3 className="font-display text-3xl font-bold">{stats.totalJobs}</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-3xl bg-card border border-border/50 cursor-pointer"
              onClick={() => navigate('/admin/jobs?filter=active')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-success/10 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
              <p className="text-muted-foreground font-medium mb-1">Active Jobs</p>
              <h3 className="font-display text-3xl font-bold">{stats.activeJobs}</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-3xl bg-card border border-border/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-destructive/10 rounded-2xl">
                  <Clock className="w-6 h-6 text-destructive" />
                </div>
              </div>
              <p className="text-muted-foreground font-medium mb-1">Expired Jobs</p>
              <h3 className="font-display text-3xl font-bold">{stats.expiredJobs}</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-3xl bg-card border border-border/50 cursor-pointer"
              onClick={() => navigate('/admin/jobs?focus=applications')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-accent/10 rounded-2xl">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
              </div>
              <p className="text-muted-foreground font-medium mb-1">Total Applications</p>
              <h3 className="font-display text-3xl font-bold">{stats.totalApplications}</h3>
            </motion.div>
          </div>
          
          <div className="p-6 rounded-3xl bg-card border border-border/50">
            <h3 className="font-display text-xl font-bold mb-4">
              {user?.role === "admin" ? "Admin Quick Links" : "Quick Links"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {user?.role === "admin" ? "Manage users and jobs directly from the admin interface." : "Manage your job postings and applications."}
            </p>
            <div className="flex flex-wrap gap-4">
                {user?.role === "admin" && <Button variant="outline" onClick={() => navigate('/admin/users')}>Manage Users</Button>}
                <Button variant="outline" onClick={() => navigate('/admin/jobs')}>Manage Jobs</Button>
                {user?.role === "admin" && (
                  <Button variant="outline" onClick={() => navigate('/admin/assessments')}>Manage Assessments</Button>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
