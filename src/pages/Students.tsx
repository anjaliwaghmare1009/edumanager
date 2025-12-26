import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Users, Loader2, UserPlus, Mail, GraduationCap } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Course {
  id: string;
  course_name: string;
  course_code: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  course_id: string | null;
  courses: Course | null;
}

const studentSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().trim().email('Invalid email address').max(255),
  course_id: z.string().optional(),
});

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        supabase.from('students').select(`
          id,
          name,
          email,
          course_id,
          courses (
            id,
            course_name,
            course_code
          )
        `).order('created_at', { ascending: false }),
        supabase.from('courses').select('id, course_name, course_code').order('course_name'),
      ]);

      if (studentsRes.data) {
        setStudents(studentsRes.data as Student[]);
      }
      if (coursesRes.data) {
        setCourses(coursesRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const handleOpenDialog = (student?: Student) => {
    setFormErrors({});
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        email: student.email,
        course_id: student.course_id || '',
      });
    } else {
      setEditingStudent(null);
      setFormData({ name: '', email: '', course_id: '' });
    }
    setIsDialogOpen(true);
  };

  const validateForm = (): boolean => {
    try {
      studentSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            errors[e.path[0] as string] = e.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        course_id: formData.course_id || null,
      };

      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update(payload)
          .eq('id', editingStudent.id);

        if (error) throw error;
        toast.success('Student updated successfully');
      } else {
        const { error } = await supabase
          .from('students')
          .insert(payload);

        if (error) {
          if (error.message.includes('duplicate')) {
            toast.error('A student with this email already exists');
            setFormErrors({ email: 'This email is already registered' });
            return;
          }
          throw error;
        }
        toast.success('Student added successfully');
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving student:', error);
      toast.error(error.message || 'Failed to save student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      toast.success('Student deleted successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast.error(error.message || 'Failed to delete student');
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse =
      filterCourse === 'all' || student.course_id === filterCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <h1>Students</h1>
            <p>Manage student records and course enrollments</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto h-11 gap-2">
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="w-full sm:w-[200px] h-11">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.course_code} - {course.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {searchTerm || filterCourse !== 'all' ? 'No students found' : 'No students yet'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {searchTerm || filterCourse !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by adding your first student.'}
                </p>
                {!searchTerm && filterCourse === 'all' && (
                  <Button onClick={() => handleOpenDialog()} className="mt-4 gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add First Student
                  </Button>
                )}
              </div>
            ) : (
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[300px]">Student</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => (
                      <TableRow 
                        key={student.id}
                        className="animate-fade-in opacity-0"
                        style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'forwards' }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                {student.name[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{student.name}</p>
                              <p className="text-xs text-muted-foreground md:hidden truncate">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-muted-foreground">{student.email}</span>
                        </TableCell>
                        <TableCell>
                          {student.courses ? (
                            <span className="badge-primary font-mono text-[11px]">
                              {student.courses.course_code}
                            </span>
                          ) : (
                            <span className="badge-muted">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenDialog(student)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete <span className="font-medium text-foreground">{student.name}</span>? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(student.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete Student
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result count */}
        {!loading && filteredStudents.length > 0 && (
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Showing {filteredStudents.length} of {students.length} students
          </p>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingStudent ? (
                  <>
                    <Pencil className="h-5 w-5 text-primary" />
                    Edit Student
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 text-primary" />
                    Add New Student
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {editingStudent
                  ? 'Update the student information below.'
                  : 'Enter the details for the new student.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-6">
              <div className="form-field">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className={cn('h-11', formErrors.name && 'border-destructive focus:ring-destructive')}
                />
                {formErrors.name && (
                  <p className="text-xs text-destructive">{formErrors.name}</p>
                )}
              </div>
              <div className="form-field">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className={cn('h-11 pl-10', formErrors.email && 'border-destructive focus:ring-destructive')}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-destructive">{formErrors.email}</p>
                )}
              </div>
              <div className="form-field">
                <Label htmlFor="course">Course Assignment</Label>
                <Select
                  value={formData.course_id}
                  onValueChange={(value) => setFormData({ ...formData, course_id: value === 'none' ? '' : value })}
                >
                  <SelectTrigger className="h-11">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select a course (optional)" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Course Assigned</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <span className="font-mono text-xs text-muted-foreground mr-2">{course.course_code}</span>
                        {course.course_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="h-10"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading} className="h-10 min-w-[100px]">
                {formLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingStudent ? 'Save Changes' : 'Add Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}