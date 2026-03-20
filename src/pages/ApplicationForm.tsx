import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowLeft, Upload, CheckCircle2, Building, MapPin } from "lucide-react";

export default function ApplicationForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Try to get job data from navigation state, or provide a fallback
  const job = location.state?.job || {
    title: "Software Engineer",
    company: "Tech Company",
    location: "Remote",
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setSubmitted] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeName(e.target.files[0].name);
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Get form elements
    const form = e.target as HTMLFormElement;
    const firstName = (form.elements[0] as HTMLInputElement).value;
    const lastName = (form.elements[1] as HTMLInputElement).value;
    const email = (form.elements[2] as HTMLInputElement).value;
    const phone = (form.elements[3] as HTMLInputElement).value;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Please log in to apply");

      const formData = new FormData();
      if (job.id) formData.append('job_id', String(job.id));
      formData.append('job_title', job.title || '');
      formData.append('company', job.company || '');
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('phone', phone);
      if (resumeFile) {
        formData.append('file', resumeFile);
      }

      const response = await fetch('http://localhost:5000/api/jobs/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setSubmitted(true);
      toast({
        title: "Success",
        description: `Your application to ${job.company} has been submitted!`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full text-center p-8 rounded-2xl bg-card border border-border/50 shadow-sm"
          >
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-4">Application Submitted!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for applying to the <span className="font-medium text-foreground">{job.title}</span> position at <span className="font-medium text-foreground">{job.company}</span>. We will review your application and get back to you soon.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/dashboard/jobs')} variant="default">
                Back to Dashboard
              </Button>
              <Button onClick={() => navigate('/jobs')} variant="outline">
                Browse More Jobs
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-3xl mx-auto px-4">
          <Button 
            variant="ghost" 
            className="mb-8 -ml-4 text-muted-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">Submit Application</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground p-4 bg-muted/50 rounded-xl border border-border/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-primary mr-2">
                  {job.company.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-foreground font-semibold text-lg">{job.title}</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" /> {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {job.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name <span className="text-destructive">*</span></label>
                  <Input required placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name <span className="text-destructive">*</span></label>
                  <Input required placeholder="Doe" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
                  <Input required type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input type="tel" placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Resume/CV <span className="text-destructive">*</span></label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted/50 transition-colors relative">
                  <input 
                    type="file" 
                    required 
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    {resumeName ? (
                      <p className="font-medium text-primary">{resumeName}</p>
                    ) : (
                      <>
                        <p className="font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-muted-foreground">PDF, DOC, DOCX (Max 5MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cover Letter <span className="text-muted-foreground font-normal">(Optional)</span></label>
                <Textarea 
                  placeholder="Tell us why you're a great fit for this role..." 
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">LinkedIn Profile <span className="text-muted-foreground font-normal">(Optional)</span></label>
                <Input type="url" placeholder="https://linkedin.com/in/johndoe" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Portfolio/Website <span className="text-muted-foreground font-normal">(Optional)</span></label>
                <Input type="url" placeholder="https://johndoe.com" />
              </div>

              <div className="pt-4 border-t border-border">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
