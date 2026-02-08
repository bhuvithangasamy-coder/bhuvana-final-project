import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import MyResume from "./pages/MyResume";
import DashboardJobs from "./pages/DashboardJobs";
import AIChatbot from "./pages/AIChatbot";
import Assessments from "./pages/Assessments";
import PhotoAnalyzer from "./pages/PhotoAnalyzer";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/dashboard/resume" element={<ProtectedRoute element={<MyResume />} />} />
            <Route path="/dashboard/jobs" element={<ProtectedRoute element={<DashboardJobs />} />} />
            <Route path="/dashboard/chatbot" element={<ProtectedRoute element={<AIChatbot />} />} />
            <Route path="/dashboard/assessments" element={<ProtectedRoute element={<Assessments />} />} />
            <Route path="/dashboard/photo" element={<ProtectedRoute element={<PhotoAnalyzer />} />} />
            <Route path="/dashboard/settings" element={<ProtectedRoute element={<Settings />} />} />
            <Route path="/jobs" element={<ProtectedRoute element={<Jobs />} />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
