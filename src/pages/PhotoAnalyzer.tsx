import { useState, useRef } from "react";
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
  Upload,
  CheckCircle,
  AlertCircle,
  Trash2,
  Download,
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PhotoAnalysis {
  uploadDate: string;
  fileName: string;
  analysis: {
    professionalism: number;
    lighting: number;
    background: number;
    composition: number;
    overall: number;
  };
  feedback: string[];
  suggestions: string[];
}

const PhotoAnalyzer = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [photoData, setPhotoData] = useState<PhotoAnalysis | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, logout } = useAuth();

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: false },
    { icon: FileText, label: "My Resume", href: "/dashboard/resume", active: false },
    { icon: Briefcase, label: "Job Matches", href: "/dashboard/jobs", active: false },
    { icon: MessageSquare, label: "AI Chatbot", href: "/dashboard/chatbot", active: false },
    { icon: ClipboardCheck, label: "Assessments", href: "/dashboard/assessments", active: false },
    { icon: Camera, label: "Photo Analyzer", href: "/dashboard/photo", active: true },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", active: false },
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
      // Reset the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);

      // Simulate photo analysis
      const analysis: PhotoAnalysis = {
        uploadDate: new Date().toLocaleDateString(),
        fileName: file.name,
        analysis: {
          professionalism: 88,
          lighting: 92,
          background: 85,
          composition: 90,
          overall: 89,
        },
        feedback: [
          "✓ Clear and well-lit professional photo",
          "✓ Neutral background is appropriate",
          "✓ Good composition with proper framing",
          "✓ Professional appearance maintained",
        ],
        suggestions: [
          "Consider smiling slightly for a more approachable look",
          "Ensure the photo is recent (within last 6 months)",
          "Use this photo for LinkedIn and professional profiles",
        ],
      };

      setPhotoData(analysis);
      toast.success("Photo analyzed successfully!");
    };

    reader.readAsDataURL(file);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success border-success/20 bg-success/10";
    if (score >= 80) return "text-accent border-accent/20 bg-accent/10";
    if (score >= 70) return "text-warning border-warning/20 bg-warning/10";
    return "text-destructive border-destructive/20 bg-destructive/10";
  };

  const deletePhoto = () => {
    setPhotoData(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success("Photo deleted successfully");
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
            <h2 className="font-display text-xl font-semibold">Profile Photo Analyzer</h2>
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
            <h1 className="font-display text-3xl font-bold mb-2">Profile Photo Analyzer</h1>
            <p className="text-muted-foreground">
              Upload your profile photo to get AI-powered analysis and professional recommendations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl bg-card border border-border/50"
            >
              <h3 className="font-display text-lg font-semibold mb-6">Upload Photo</h3>

              {!previewUrl ? (
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
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-medium mb-2">Drop your photo here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="photo-input"
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
                  >
                    Choose File
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">JPG, PNG, WebP - max 10MB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm font-medium mb-1">{photoData?.fileName}</p>
                    <p className="text-xs text-muted-foreground">Analyzed on {photoData?.uploadDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      Change Photo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={deletePhoto}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Analysis Results */}
            {photoData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                {/* Scores */}
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                  <h3 className="font-display text-lg font-semibold mb-4">Analysis Scores</h3>
                  <div className="space-y-4">
                    {Object.entries(photoData.analysis).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                          <span className={`text-lg font-bold ${getScoreColor(value)}`}>{value}%</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2">
                          <div
                            className="h-full bg-gradient-to-r from-success to-accent rounded-full transition-all duration-500"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-success/10 to-accent/10 border border-success/20">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h3 className="font-display font-semibold">Positive Feedback</h3>
                  </div>
                  <ul className="space-y-2">
                    {photoData.feedback.map((item, index) => (
                      <li key={index} className="text-sm text-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions */}
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-accent" />
                    <h3 className="font-display font-semibold">Suggestions</h3>
                  </div>
                  <ul className="space-y-2">
                    {photoData.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Download Report */}
                <Button variant="gradient" className="w-full">
                  <Download className="w-4 h-4" />
                  Download Analysis Report
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PhotoAnalyzer;
