import { useState, useEffect, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import ApiService from "@/services/api";
import { toast } from "sonner";

const AdminJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const myJobsRef = useRef<HTMLDivElement | null>(null);
  const applicationsRef = useRef<HTMLDivElement | null>(null);
  const params = new URLSearchParams(location.search);
  const focusList = params.get('focus') === 'list';
  const focusApplications = params.get('focus') === 'applications';
  const filterParam = params.get('filter') || null;

  const [form, setForm] = useState({
    title: "",
    location: "",
    salary: "",
    job_type: "",
    skills: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [jobIdToLoad, setJobIdToLoad] = useState<string>("");
  const [applications, setApplications] = useState<Array<any>>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [myJobs, setMyJobs] = useState<Array<any>>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await ApiService.postJob(form);
      toast.success("Job Posted!");
      // refresh my jobs list
      try {
        setJobsLoading(true);
        const resp: any = await ApiService.getMyJobs();
        setMyJobs(resp.jobs || []);
      } catch (err) {
        // ignore
      } finally {
        setJobsLoading(false);
      }
      // navigate back to admin overview so counts refresh
      navigate("/admin");
    } catch (err: any) {
      toast.error(err?.message || "Failed to post job");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "job_poster")) {
    return <div className="p-6">Access denied.</div>;
  }

  useEffect(() => {
    const loadMyJobs = async () => {
      if (!user) return;
      try {
        setJobsLoading(true);
        const resp: any = await ApiService.getMyJobs();
        setMyJobs(resp.jobs || []);
      } catch (err) {
        setMyJobs([]);
      } finally {
        setJobsLoading(false);
      }
    };

    loadMyJobs();

    // If navigated with focus=list, scroll to My Posted Jobs section
    const params = new URLSearchParams(location.search);
    if (params.get('focus') === 'list' && myJobsRef.current) {
      setTimeout(() => myJobsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
    
    if (params.get('focus') === 'applications') {
      setJobIdToLoad('all');
      const loadAllApps = async () => {
        setAppsLoading(true);
        try {
          const resp: any = await ApiService.getApplications('all');
          if (Array.isArray(resp)) {
            setApplications(resp);
          } else {
            setApplications([]);
          }
        } catch (err) {
          console.error(err);
          setApplications([]);
        } finally {
          setAppsLoading(false);
        }
      };
      loadAllApps();
      if (applicationsRef.current) {
        setTimeout(() => applicationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }, [user, location.search]);

  return (
    <div className="p-6">
      {(!focusList && !focusApplications && filterParam !== 'active') ? (
        <>
          <h2 className="font-display text-2xl font-bold mb-4">Post a Job</h2>
          <form id="jobForm" onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <Label>Job Title</Label>
          <Input name="title" value={form.title} onChange={handleChange} required />
        </div>

        <div>
          <Label>Location</Label>
          <Input name="location" value={form.location} onChange={handleChange} required />
        </div>

        <div>
          <Label>Salary</Label>
          <Input name="salary" value={form.salary} onChange={handleChange} />
        </div>

        <div>
          <Label>Job Type</Label>
          <Input name="job_type" value={form.job_type} onChange={handleChange} placeholder="Full-time" />
        </div>

        <div>
          <Label>Skills (comma separated)</Label>
          <Input name="skills" value={form.skills} onChange={handleChange} />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea name="description" value={form.description} onChange={handleChange} />
        </div>

        <div>
          <Button type="submit" variant="gradient" disabled={isLoading}>
            {isLoading ? "Posting..." : "Post Job"}
          </Button>
        </div>
          </form>
        </>
      ) : filterParam === 'active' ? (
        <h2 className="font-display text-2xl font-bold mb-4">Active Jobs</h2>
      ) : (
        <h2 className="font-display text-2xl font-bold mb-4">My Posted Jobs</h2>
      )}

      <div className="mt-8" ref={applicationsRef}>
        <h3 className="font-display text-lg font-semibold mb-2">View Applications</h3>
        <p className="text-muted-foreground mb-3">Enter job ID or "all" to load applications.</p>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Job ID or 'all'"
            value={jobIdToLoad}
            onChange={(e) => setJobIdToLoad(e.target.value)}
            className="max-w-xs"
          />
          <Button
            onClick={async () => {
              if (!jobIdToLoad) return toast.error("Enter a job ID");
              setAppsLoading(true);
              try {
                const queryId = jobIdToLoad.toLowerCase() === 'all' ? 'all' : Number(jobIdToLoad);
                const resp: any = await ApiService.getApplications(queryId);
                // If backend returns an object with message on error, handle gracefully
                if (Array.isArray(resp)) {
                  setApplications(resp);
                } else if (resp && resp.message) {
                  toast.error(resp.message);
                  setApplications([]);
                } else {
                  setApplications([]);
                }
              } catch (err: any) {
                toast.error(err?.message || "Failed to load applications");
                setApplications([]);
              } finally {
                setAppsLoading(false);
              }
            }}
            variant="outline"
          >
            {appsLoading ? "Loading..." : "Load Applications"}
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {applications.length === 0 && <p className="text-muted-foreground">No applications loaded.</p>}
          {applications.map((a) => (
            <div key={a.id} className="p-3 rounded-xl bg-card border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-medium">{a.name} <span className="text-sm text-muted-foreground">({a.email})</span></div>
                {a.phone && <div className="text-sm text-muted-foreground">Phone: {a.phone}</div>}
                <div className="text-sm text-muted-foreground">Status: {a.status}</div>
                {a.job_title && <div className="text-sm text-muted-foreground mt-1">Job: {a.job_title} (ID: {a.job_id})</div>}
              </div>
              <div className="flex flex-wrap gap-2">
                {a.resume && (
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try {
                        const { blob, filename } = await ApiService.downloadApplicationResume(a.id);
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = filename;
                        link.click();
                        window.URL.revokeObjectURL(url);
                      } catch (err: any) {
                        toast.error("Failed to download resume");
                      }
                    }}
                  >
                    Resume
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await ApiService.updateApplicationStatus(a.id, 'Selected');
                      toast.success('Application accepted');
                      // refresh
                      const queryId = jobIdToLoad.toLowerCase() === 'all' ? 'all' : (jobIdToLoad ? Number(jobIdToLoad) : 'all');
                      const resp: any = await ApiService.getApplications(queryId);
                      if (Array.isArray(resp)) setApplications(resp);
                    } catch (err: any) {
                      toast.error(err?.message || 'Failed to update status');
                    }
                  }}
                >
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await ApiService.updateApplicationStatus(a.id, 'Rejected');
                      toast.success('Application rejected');
                      const queryId = jobIdToLoad.toLowerCase() === 'all' ? 'all' : (jobIdToLoad ? Number(jobIdToLoad) : 'all');
                      const resp: any = await ApiService.getApplications(queryId);
                      if (Array.isArray(resp)) setApplications(resp);
                    } catch (err: any) {
                      toast.error(err?.message || 'Failed to update status');
                    }
                  }}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div ref={myJobsRef} className="mt-8">
          <h3 className="font-display text-lg font-semibold mb-2">My Posted Jobs</h3>
          {jobsLoading ? (
            <div className="text-sm text-muted-foreground">Loading jobs...</div>
          ) : myJobs.length === 0 ? (
            <p className="text-muted-foreground">No jobs posted yet.</p>
          ) : (
            <div>
              {filterParam === 'active' && <div className="mb-3 text-sm text-muted-foreground">Showing only active jobs</div>}
              <div className="space-y-3">
                {myJobs
                  .filter((j) => filterParam !== 'active' || (j.status || '').toLowerCase() === 'active')
                  .map((j) => (
                  <div key={j.id} className="p-3 rounded-xl bg-card border border-border/50 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{j.title} <span className="text-sm text-muted-foreground">({j.location})</span></div>
                      <div className="text-sm text-muted-foreground">Status: {j.status}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => { navigator.clipboard?.writeText(String(j.id)); toast.success('Job ID copied'); }}>
                        Copy ID
                      </Button>
                      <Button variant="ghost" onClick={() => { setJobIdToLoad(String(j.id)); toast.success('Job ID loaded above'); }}>
                        Load Applications
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminJobs;
