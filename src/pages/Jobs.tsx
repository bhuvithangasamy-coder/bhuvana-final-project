import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  Building,
  TrendingUp,
  Bookmark,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const mockJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "Remote",
    type: "Full-time",
    salary: "$120k - $150k",
    posted: "2 days ago",
    match: 95,
    skills: ["React", "TypeScript", "Tailwind CSS", "Node.js"],
    logo: "TC",
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    location: "New York, NY",
    type: "Full-time",
    salary: "$100k - $130k",
    posted: "1 week ago",
    match: 88,
    skills: ["React", "Python", "PostgreSQL", "AWS"],
    logo: "SX",
  },
  {
    id: 3,
    title: "React Developer",
    company: "Digital Agency Co.",
    location: "San Francisco, CA",
    type: "Contract",
    salary: "$80 - $100/hr",
    posted: "3 days ago",
    match: 82,
    skills: ["React", "JavaScript", "CSS", "REST APIs"],
    logo: "DA",
  },
  {
    id: 4,
    title: "Software Engineer",
    company: "Enterprise Solutions",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$110k - $140k",
    posted: "5 days ago",
    match: 78,
    skills: ["Java", "Spring Boot", "React", "Kubernetes"],
    logo: "ES",
  },
  {
    id: 5,
    title: "UI/UX Developer",
    company: "Creative Studio",
    location: "Remote",
    type: "Part-time",
    salary: "$60k - $80k",
    posted: "1 day ago",
    match: 75,
    skills: ["React", "Figma", "CSS", "User Research"],
    logo: "CS",
  },
];

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Find Your <span className="gradient-text">Perfect Job</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover opportunities matched to your skills and experience
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-card shadow-card border border-border/50">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Job title, skills, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-0 bg-muted"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="City or remote"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 h-12 border-0 bg-muted"
                />
              </div>
              <Button variant="gradient" size="lg" className="h-12">
                <Search className="w-5 h-5" />
                Search Jobs
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-64 space-y-6"
            >
              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5" />
                  <h3 className="font-display font-semibold">Filters</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Type</label>
                    <div className="space-y-2">
                      {["Full-time", "Part-time", "Contract", "Remote"].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-input" />
                          <span className="text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Experience</label>
                    <div className="space-y-2">
                      {["Entry Level", "Mid Level", "Senior", "Lead"].map((level) => (
                        <label key={level} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-input" />
                          <span className="text-sm">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Matching CTA */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-semibold">AI Job Matching</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your resume to get personalized job recommendations.
                </p>
                <Link to="/register">
                  <Button variant="gradient" size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.aside>

            {/* Jobs Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{mockJobs.length}</span> jobs
                </p>
                <select className="px-4 py-2 rounded-lg border border-input bg-background text-sm">
                  <option>Most Relevant</option>
                  <option>Most Recent</option>
                  <option>Highest Salary</option>
                </select>
              </div>

              <div className="space-y-4">
                {mockJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-card border border-border/50 card-hover"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Company Logo */}
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-display font-bold text-primary flex-shrink-0">
                        {job.logo}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-display text-lg font-semibold mb-1">{job.title}</h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building className="w-4 h-4" />
                              <span>{job.company}</span>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium flex-shrink-0">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {job.match}% Match
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </span>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 rounded-full bg-muted text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{job.posted}</span>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button variant="default" size="sm">
                              Apply Now
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Jobs;
