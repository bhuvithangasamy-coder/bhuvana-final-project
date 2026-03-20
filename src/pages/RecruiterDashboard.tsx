import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Users, 
  Calendar, 
  Clock, 
  PlusCircle, 
  Search, 
  ArrowUpRight,
  MessageSquare,
  LogOut,
  Sparkles,
  Building
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm card-hover"
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-3xl font-display font-bold">{value}</span>
      {trend && (
        <span className={`text-sm font-medium flex items-center ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trendUp ? '+' : '-'}{trend}% <ArrowUpRight className="w-3 h-3 ml-1" />
        </span>
      )}
    </div>
  </motion.div>
);

const RecruiterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    pendingInterviews: 0,
    newApplicationsToday: 0
  });

  const handleLogout = () => {
    logout();
    navigate('/recruiter/login');
  };

  useEffect(() => {
    setStats({
      totalJobs: 12,
      totalApplicants: 148,
      pendingInterviews: 8,
      newApplicationsToday: 24
    });
  }, []);

  const navItems = [
    { icon: Briefcase, label: "Dashboard", href: "/recruiter/dashboard", active: true },
    { icon: Users, label: "Candidates", href: "/recruiter/candidates" },
    { icon: Calendar, label: "Interviews", href: "/recruiter/interviews" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 hidden lg:flex flex-col">
        <Link to="/" className="flex items-center gap-2 p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl">RecruiterHub</span>
        </Link>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                item.active
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
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
      <main className="flex-1 lg:ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-zinc-900 dark:text-zinc-50">
                Welcome back, {user?.username}
              </h1>
              <p className="text-muted-foreground mt-1">Here is what is happening with your recruitment today.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 shrink-0">
                <Search className="w-4 h-4" />
                View Applicants
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shrink-0">
                <PlusCircle className="w-4 h-4" />
                Post a Job
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Jobs Posted" value={stats.totalJobs} icon={Briefcase} trend="12" trendUp={true} />
            <StatCard title="Total Applicants" value={stats.totalApplicants} icon={Users} trend="40" trendUp={true} />
            <StatCard title="Pending Interviews" value={stats.pendingInterviews} icon={Calendar} trend="2" trendUp={false} />
            <StatCard title="New Apps Today" value={stats.newApplicationsToday} icon={Clock} trend="8" trendUp={true} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold font-display">Recent Activity</h2>
                  <Link to="/recruiter/activity" className="text-sm text-indigo-600 hover:underline">View all</Link>
                </div>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Sarah Jenkins</span> applied for <span className="font-semibold text-zinc-900 dark:text-zinc-100">Senior Frontend Engineer</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Mike Ross</span> replied to your interview invitation
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <h2 className="text-lg font-bold font-display mb-4">Upcoming Interviews</h2>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium text-sm">No interviews scheduled today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
