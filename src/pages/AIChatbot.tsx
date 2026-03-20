import { useState } from "react";
import ReactMarkdown from "react-markdown";
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
  Send,
  Lightbulb,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AIChatbot = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hi! I'm your AI Career Coach. How can I help you today? I can assist with resume tips, job search strategies, interview preparation, and career advice." },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: false },
    { icon: FileText, label: "My Resume", href: "/dashboard/resume", active: false },
    { icon: Briefcase, label: "Job Matches", href: "/dashboard/jobs", active: false },
    { icon: MessageSquare, label: "AI Chatbot", href: "/dashboard/chatbot", active: true },
    { icon: ClipboardCheck, label: "Assessments", href: "/dashboard/assessments", active: false },
    { icon: Camera, label: "Photo Analyzer", href: "/dashboard/photo", active: false },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", active: false },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: "user", content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    
    const question = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/chatbot/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      toast.error("Failed to get response from AI Coach.");
      // Optional: remove the user message or show an error message in chat
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
            <h2 className="font-display text-xl font-semibold">AI Career Coach</h2>
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

        {/* Chat Container */}
        <div className="p-6 h-[calc(100vh-120px)] flex flex-col">
          {/* Messages */}
          <motion.div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-prose px-4 py-3 rounded-2xl text-sm ${
                    message.role === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-card border border-border/50 rounded-bl-none prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-muted"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Suggestion Cards */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
            >
              {[
                { icon: Zap, title: "Resume Tips", desc: "Get advice on improving your resume" },
                { icon: Lightbulb, title: "Interview Prep", desc: "Practice common interview questions" },
              ].map((suggestion) => (
                <button
                  key={suggestion.title}
                  onClick={() => {
                    setInputValue(suggestion.title);
                  }}
                  className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <suggestion.icon className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-sm">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {/* Input Area */}
          <div className="flex gap-3">
            <Input
              placeholder="Ask me anything about your career..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button variant="gradient" size="lg" onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading}>
              <Send className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`} />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIChatbot;
