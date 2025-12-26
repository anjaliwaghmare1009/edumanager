import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, BookOpen, Shield, ArrowRight, Loader2 } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">EduManager</span>
          </div>
          <Link to="/auth">
            <Button>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Student & Course
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Management System
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A complete backend-powered solution for managing students, courses, and enrollments with secure role-based access control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Core Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 bg-card rounded-xl border border-border shadow-sm animate-slide-in-from-bottom" style={{ animationDelay: '0ms' }}>
              <div className="p-3 rounded-lg gradient-primary w-fit mb-4">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Student Management</h3>
              <p className="text-muted-foreground">
                Add, update, and delete student records with course enrollment tracking. Validate emails and prevent duplicates.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border shadow-sm animate-slide-in-from-bottom" style={{ animationDelay: '100ms' }}>
              <div className="p-3 rounded-lg gradient-accent w-fit mb-4">
                <BookOpen className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Course Catalog</h3>
              <p className="text-muted-foreground">
                Manage courses with unique codes and durations. Track student enrollment counts per course automatically.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border shadow-sm animate-slide-in-from-bottom" style={{ animationDelay: '200ms' }}>
              <div className="p-3 rounded-lg bg-success/20 w-fit mb-4">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Secure JWT authentication with ADMIN and STUDENT roles. Admins have full access, students view their own data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Built With Modern Tech
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Powered by PostgreSQL database, JWT authentication, and Row-Level Security policies for enterprise-grade data protection.
          </p>
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {['PostgreSQL', 'JWT Auth', 'Row-Level Security', 'React', 'TypeScript', 'Tailwind CSS'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground font-medium text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EduManager. Student & Course Management System.</p>
        </div>
      </footer>
    </div>
  );
}
