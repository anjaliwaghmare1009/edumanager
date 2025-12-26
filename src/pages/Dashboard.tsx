import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookOpen, GraduationCap, TrendingUp, ArrowRight, Clock, Mail, Hash, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Stats {
  totalStudents: number;
  totalCourses: number;
  averageStudentsPerCourse: number;
}

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  course: {
    course_name: string;
    course_code: string;
    course_duration: number;
  } | null;
}

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalStudents: 0, totalCourses: 0, averageStudentsPerCourse: 0 });
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
    } else {
      fetchStudentProfile();
    }
  }, [isAdmin, user]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('courses').select('id', { count: 'exact' }),
      ]);

      const totalStudents = studentsRes.count || 0;
      const totalCourses = coursesRes.count || 0;
      const avg = totalCourses > 0 ? Math.round(totalStudents / totalCourses * 10) / 10 : 0;

      setStats({
        totalStudents,
        totalCourses,
        averageStudentsPerCourse: avg,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    setLoading(false);
  };

  const fetchStudentProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          name,
          email,
          courses (
            course_name,
            course_code,
            course_duration
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setStudentProfile({
          id: data.id,
          name: data.name,
          email: data.email,
          course: data.courses as StudentProfile['course'],
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    setLoading(false);
  };

  if (isAdmin) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          {/* Page Header */}
          <div className="page-header">
            <h1>Dashboard Overview</h1>
            <p>Welcome back! Here's what's happening with your education system.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total Students */}
            <div className="stat-card animate-fade-in-up opacity-0" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  {loading ? (
                    <div className="h-9 w-20 skeleton-pulse" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{stats.totalStudents}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Enrolled students</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            {/* Total Courses */}
            <div className="stat-card animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                  {loading ? (
                    <div className="h-9 w-16 skeleton-pulse" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{stats.totalCourses}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Available courses</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/10">
                  <BookOpen className="h-6 w-6 text-accent" />
                </div>
              </div>
            </div>

            {/* Average per Course */}
            <div className="stat-card animate-fade-in-up opacity-0 sm:col-span-2 lg:col-span-1" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Avg. per Course</p>
                  {loading ? (
                    <div className="h-9 w-14 skeleton-pulse" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{stats.averageStudentsPerCourse}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Students per course</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="animate-fade-in-up opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Manage your education system efficiently</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Link to="/dashboard/students" className="action-card group">
                <div className="p-3 rounded-xl gradient-primary shadow-glow">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Manage Students
                  </h3>
                  <p className="text-sm text-muted-foreground">Add, edit, or remove students</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>

              <Link to="/dashboard/courses" className="action-card group">
                <div className="p-3 rounded-xl gradient-accent">
                  <BookOpen className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    Manage Courses
                  </h3>
                  <p className="text-sm text-muted-foreground">Create and organize courses</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Student View
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="page-header">
          <h1>My Profile</h1>
          <p>View your student information and enrolled course details.</p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full skeleton-pulse" />
                  <div className="space-y-2">
                    <div className="h-5 w-32 skeleton-pulse" />
                    <div className="h-4 w-24 skeleton-pulse" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-full skeleton-pulse" />
                  <div className="h-4 w-3/4 skeleton-pulse" />
                  <div className="h-4 w-1/2 skeleton-pulse" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="h-4 w-24 skeleton-pulse mb-4" />
                <div className="space-y-3">
                  <div className="h-4 w-full skeleton-pulse" />
                  <div className="h-4 w-2/3 skeleton-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : studentProfile ? (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Student Information Card */}
            <Card className="animate-fade-in-up opacity-0" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-glow">
                    <span className="text-xl font-bold text-primary-foreground">
                      {studentProfile.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">{studentProfile.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Student
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email Address</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{studentProfile.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Student ID</p>
                    <p className="font-mono text-xs text-foreground mt-0.5">{studentProfile.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Information Card */}
            <Card className="animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-5 w-5 text-accent" />
                  Enrolled Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentProfile.course ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-accent/20 bg-accent/5">
                      <p className="text-lg font-semibold text-foreground">{studentProfile.course.course_name}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="badge-accent font-mono">
                          {studentProfile.course.course_code}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {studentProfile.course.course_duration} months
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <AlertCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Not enrolled yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact an administrator to enroll in a course
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="animate-fade-in-up opacity-0" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <CardContent className="empty-state">
              <div className="empty-state-icon">
                <GraduationCap className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Student Profile Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Your student profile hasn't been created yet. Please contact an administrator to set up your profile.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}