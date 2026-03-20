import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import MyResume from "./pages/MyResume";
import DashboardJobs from "./pages/DashboardJobs";
import AIChatbot from "./pages/AIChatbot";
import Assessments from "./pages/Assessments";
import PhotoAnalyzer from "./pages/PhotoAnalyzer";
import Settings from "./pages/Settings";
import ApplicationForm from "./pages/ApplicationForm";
import AdminDashboard from "./pages/AdminDashboard";
import AdminJobs from "./pages/AdminJobs";
import NotFound from "./pages/NotFound";

import RecruiterLogin from "./pages/RecruiterLogin";
import RecruiterRegister from "./pages/RecruiterRegister";
import RecruiterDashboard from "./pages/RecruiterDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/recruiter/login" element={<RecruiterLogin />} />
            <Route path="/recruiter/register" element={<RecruiterRegister />} />
            <Route path="/recruiter/dashboard" element={<ProtectedRoute element={<RecruiterDashboard />} />} />
            <Route path="/assessments" element={<Navigate to="/dashboard/assessments" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/dashboard/resume" element={<ProtectedRoute element={<MyResume />} />} />
            <Route path="/dashboard/jobs" element={<ProtectedRoute element={<DashboardJobs />} />} />
            <Route path="/dashboard/chatbot" element={<ProtectedRoute element={<AIChatbot />} />} />
            <Route path="/dashboard/assessments" element={<ProtectedRoute element={<Assessments />} />} />
            <Route path="/dashboard/photo" element={<ProtectedRoute element={<PhotoAnalyzer />} />} />
            <Route path="/dashboard/settings" element={<ProtectedRoute element={<Settings />} />} />
            <Route path="/jobs" element={<ProtectedRoute element={<Jobs />} />} />
            <Route path="/apply" element={<ProtectedRoute element={<ApplicationForm />} />} />
            <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} />} />
            <Route path="/admin/jobs" element={<ProtectedRoute element={<AdminJobs />} />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
