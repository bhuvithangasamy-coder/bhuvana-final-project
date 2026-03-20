import { useState } from "react";
import { Link } from "react-router-dom";
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
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Moon,
  Sun,
  Volume2,
  Trash2,
  Download,
  ChevronRight,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ApiService from "@/services/api";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    emailDigest: true,
    assessmentReminders: true,
    newsAndUpdates: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: "private",
    showEmail: false,
    allowMessages: true,
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: false },
    { icon: FileText, label: "My Resume", href: "/dashboard/resume", active: false },
    { icon: Briefcase, label: "Job Matches", href: "/dashboard/jobs", active: false },
    { icon: MessageSquare, label: "AI Chatbot", href: "/dashboard/chatbot", active: false },
    { icon: ClipboardCheck, label: "Assessments", href: "/dashboard/assessments", active: false },
    { icon: Camera, label: "Photo Analyzer", href: "/dashboard/photo", active: false },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", active: true },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const handleSavePreferences = () => {
    // Here you would typically save to backend
    toast.success("Preferences saved successfully!");
  };

  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const handleVerifyEmail = async () => {
    setIsVerifyingEmail(true);
    try {
      const response = await ApiService.verifyEmail();
      toast.success(response.message || "Verification email sent successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send verification email");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      await ApiService.changePassword(oldPassword, newPassword);
      toast.success("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabsConfig = [
    { id: "account", label: "Account Settings", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "data", label: "Data & Privacy", icon: Download },
  ];

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
            <h2 className="font-display text-xl font-semibold">Settings</h2>
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
            <h1 className="font-display text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tabs Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="p-4 rounded-2xl bg-card border border-border/50 space-y-2">
                {tabsConfig.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Content Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              {/* Account Settings */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <h3 className="font-display text-lg font-semibold mb-6">Account Information</h3>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="text-sm font-medium block mb-2">Full Name</label>
                        <Input
                          value={user?.username || ""}
                          className="h-11"
                          readOnly
                        />
                        <p className="text-xs text-muted-foreground mt-1">Username cannot be changed</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">Email Address</label>
                        <div className="flex gap-2">
                          <Input
                            value={user?.email || ""}
                            className="h-11 flex-1"
                            readOnly
                          />
                          <Button 
                            variant="outline" 
                            className="h-11"
                            onClick={handleVerifyEmail}
                            disabled={isVerifyingEmail}
                          >
                            {isVerifyingEmail ? "Verifying..." : "Verify"}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Your primary email address</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">Member Since</label>
                        <Input
                          value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}
                          className="h-11"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Change Password */}
                  <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <h3 className="font-display text-lg font-semibold mb-6">Change Password</h3>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">Current Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type={showOldPassword ? "text" : "password"}
                            placeholder="Enter current password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="pl-10 pr-10 h-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-10 pr-10 h-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 pr-10 h-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <Button type="submit" variant="gradient" disabled={isChangingPassword}>
                        {isChangingPassword ? "Changing..." : "Change Password"}
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === "notifications" && (
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                  <h3 className="font-display text-lg font-semibold mb-6">Notification Preferences</h3>

                  <div className="space-y-4">
                    {[
                      { key: "jobAlerts", label: "Job Match Alerts", desc: "Get notified about new job matches" },
                      { key: "emailDigest", label: "Weekly Email Digest", desc: "Receive a summary of your activity" },
                      { key: "assessmentReminders", label: "Assessment Reminders", desc: "Reminders to complete pending assessments" },
                      { key: "newsAndUpdates", label: "News & Updates", desc: "Latest features and product news" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="rounded w-5 h-5 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>

                  <Button variant="gradient" className="mt-6" onClick={handleSavePreferences}>
                    Save Preferences
                  </Button>
                </div>
              )}

              {/* Privacy & Security */}
              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <h3 className="font-display text-lg font-semibold mb-6">Privacy Settings</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-3">Profile Visibility</label>
                        <div className="space-y-2">
                          {["private", "friends", "public"].map((option) => (
                            <label key={option} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="radio"
                                name="visibility"
                                value={option}
                                checked={privacy.profileVisibility === option}
                                onChange={(e) =>
                                  setPrivacy({
                                    ...privacy,
                                    profileVisibility: e.target.value,
                                  })
                                }
                                className="w-4 h-4"
                              />
                              <span className="text-sm capitalize font-medium">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                          <div>
                            <p className="font-medium text-sm">Show Email Address</p>
                            <p className="text-xs text-muted-foreground">Allow others to see your email</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={privacy.showEmail}
                            onChange={(e) =>
                              setPrivacy({
                                ...privacy,
                                showEmail: e.target.checked,
                              })
                            }
                            className="rounded w-5 h-5 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                          <div>
                            <p className="font-medium text-sm">Allow Messages</p>
                            <p className="text-xs text-muted-foreground">Let others send you messages</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={privacy.allowMessages}
                            onChange={(e) =>
                              setPrivacy({
                                ...privacy,
                                allowMessages: e.target.checked,
                              })
                            }
                            className="rounded w-5 h-5 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    <Button variant="gradient" className="mt-6">
                      Save Privacy Settings
                    </Button>
                  </div>
                </div>
              )}

              {/* Preferences */}
              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <h3 className="font-display text-lg font-semibold mb-6">Display & Sound</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          {isDarkMode ? <Moon className="w-5 h-5 text-accent" /> : <Sun className="w-5 h-5 text-warning" />}
                          <div>
                            <p className="font-medium text-sm">Dark Mode</p>
                            <p className="text-xs text-muted-foreground">Toggle dark/light theme</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isDarkMode}
                          onChange={(e) => setIsDarkMode(e.target.checked)}
                          className="rounded w-5 h-5 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">Sound Notifications</p>
                            <p className="text-xs text-muted-foreground">Enable notification sounds</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded w-5 h-5 cursor-pointer"
                        />
                      </div>
                    </div>

                    <Button variant="gradient" className="mt-6" onClick={handleSavePreferences}>
                      Save Preferences
                    </Button>
                  </div>
                </div>
              )}

              {/* Data & Privacy */}
              {activeTab === "data" && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <h3 className="font-display text-lg font-semibold mb-6">Data Management</h3>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-sm text-foreground mb-3">Download your personal data in a structured format.</p>
                        <Button variant="outline" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download My Data
                        </Button>
                      </div>

                      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-foreground mb-3">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <h3 className="font-display text-lg font-semibold mb-4">Security Log</h3>
                    <div className="space-y-3">
                      {[
                        { action: "Login", device: "Chrome on Windows", time: "Today at 10:30 AM" },
                        { action: "Password Changed", device: "Chrome on Windows", time: "1 week ago" },
                        { action: "Login", device: "Safari on iPhone", time: "2 weeks ago" },
                      ].map((log, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                          <div>
                            <p className="font-medium text-sm">{log.action}</p>
                            <p className="text-xs text-muted-foreground">{log.device}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
