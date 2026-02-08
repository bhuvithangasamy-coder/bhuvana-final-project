import { motion } from "framer-motion";
import { 
  FileText, 
  Brain, 
  Briefcase, 
  Camera, 
  MessageSquare, 
  ClipboardCheck,
  Target,
  TrendingUp,
  Shield
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Resume Analysis",
    description: "AI-powered parsing extracts skills, experience, and education. Get detailed ATS compatibility scores instantly.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "AI Job Matching",
    description: "Our algorithm matches your profile with the most relevant jobs using advanced skill similarity scoring.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description: "Identify missing skills for your target roles and get personalized learning recommendations.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Camera,
    title: "Photo Analyzer",
    description: "AI evaluates your professional photo for quality, lighting, and professional appearance.",
    color: "from-green-500 to-teal-500",
  },
  {
    icon: MessageSquare,
    title: "AI Career Chatbot",
    description: "Get instant career advice, interview tips, and guidance from our AI-powered assistant.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: ClipboardCheck,
    title: "Skill Assessments",
    description: "Take AI-generated tests to validate your skills and earn certifications for your profile.",
    color: "from-pink-500 to-rose-500",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
            Everything You Need to
            <span className="gradient-text"> Land Your Dream Job</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A comprehensive AI-powered platform designed to analyze, enhance, and match your career potential.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border/50 card-hover"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20 p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-display text-3xl font-bold">85%</span>
              </div>
              <p className="text-muted-foreground">Higher Interview Rate</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-accent" />
                <span className="font-display text-3xl font-bold">10K+</span>
              </div>
              <p className="text-muted-foreground">Active Job Listings</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-success" />
                <span className="font-display text-3xl font-bold">100%</span>
              </div>
              <p className="text-muted-foreground">Data Privacy Secured</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
