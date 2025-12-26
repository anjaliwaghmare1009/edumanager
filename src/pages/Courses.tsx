import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
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
import { Plus, Pencil, Trash2, Search, BookOpen, Loader2, Users, Clock, Hash, BookPlus } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';

interface Course {
  id: string;
  course_name: string;
  course_code: string;
  course_duration: number;
  student_count?: number;
}

const courseSchema = z.object({
  course_name: z.string().trim().min(2, 'Course name must be at least 2 characters').max(255),
  course_code: z.string().trim().min(2, 'Course code must be at least 2 characters').max(50),
  course_duration: z.number().min(1, 'Duration must be at least 1 month').max(120),
});

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    course_name: '',
    course_code: '',
    course_duration: 6,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, course_name, course_code, course_duration')
        .order('course_name');

      if (coursesError) throw coursesError;

      const { data: studentCounts } = await supabase
        .from('students')
        .select('course_id');

      const countMap: Record<string, number> = {};
      studentCounts?.forEach((s) => {
        if (s.course_id) {
          countMap[s.course_id] = (countMap[s.course_id] || 0) + 1;
        }
      });

      const coursesWithCounts = coursesData?.map((course) => ({
        ...course,
        student_count: countMap[course.id] || 0,
      })) || [];

      setCourses(coursesWithCounts);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
    setLoading(false);
  };

  const handleOpenDialog = (course?: Course) => {
    setFormErrors({});
    if (course) {
      setEditingCourse(course);
      setFormData({
        course_name: course.course_name,
        course_code: course.course_code,
        course_duration: course.course_duration,
      });
    } else {
      setEditingCourse(null);
      setFormData({ course_name: '', course_code: '', course_duration: 6 });
    }
    setIsDialogOpen(true);
  };

  const validateForm = (): boolean => {
    try {
      courseSchema.parse(formData);
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
        course_name: formData.course_name.trim(),
        course_code: formData.course_code.trim().toUpperCase(),
        course_duration: formData.course_duration,
      };

      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(payload)
          .eq('id', editingCourse.id);

        if (error) throw error;
        toast.success('Course updated successfully');
      } else {
        const { error } = await supabase.from('courses').insert(payload);

        if (error) {
          if (error.message.includes('duplicate') || error.message.includes('unique')) {
            toast.error('A course with this code already exists');
            setFormErrors({ course_code: 'This course code is already in use' });
            return;
          }
          throw error;
        }
        toast.success('Course added successfully');
      }

      setIsDialogOpen(false);
      fetchCourses();
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error(error.message || 'Failed to save course');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error(error.message || 'Failed to delete course');
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <h1>Courses</h1>
            <p>Manage course catalog and academic programs</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto h-11 gap-2">
            <BookPlus className="h-4 w-4" />
            Add Course
          </Button>
        </div>

        {/* Search Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Search Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Courses Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {searchTerm ? 'No courses found' : 'No courses yet'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {searchTerm
                    ? 'Try adjusting your search criteria.'
                    : 'Get started by creating your first course.'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => handleOpenDialog()} className="mt-4 gap-2">
                    <BookPlus className="h-4 w-4" />
                    Add First Course
                  </Button>
                )}
              </div>
            ) : (
              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[40%]">Course</TableHead>
                      <TableHead className="hidden sm:table-cell">Duration</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course, index) => (
                      <TableRow 
                        key={course.id}
                        className="animate-fade-in opacity-0"
                        style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'forwards' }}
                      >
                        <TableCell>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{course.course_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="badge-accent font-mono text-[11px]">
                                {course.course_code}
                              </span>
                              <span className="text-xs text-muted-foreground sm:hidden flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {course.course_duration}mo
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {course.course_duration} months
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className={cn(
                              'font-medium',
                              course.student_count === 0 ? 'text-muted-foreground' : 'text-foreground'
                            )}>
                              {course.student_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenDialog(course)}
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
                                  <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete <span className="font-medium text-foreground">"{course.course_name}"</span>?
                                    {course.student_count && course.student_count > 0 ? (
                                      <span className="block mt-2 text-warning">
                                        Warning: {course.student_count} student(s) will have their enrollment removed.
                                      </span>
                                    ) : null}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(course.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete Course
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
        {!loading && filteredCourses.length > 0 && (
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingCourse ? (
                  <>
                    <Pencil className="h-5 w-5 text-primary" />
                    Edit Course
                  </>
                ) : (
                  <>
                    <BookPlus className="h-5 w-5 text-primary" />
                    Add New Course
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {editingCourse
                  ? 'Update the course information below.'
                  : 'Enter the details for the new course.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-6">
              <div className="form-field">
                <Label htmlFor="course_name">Course Name</Label>
                <Input
                  id="course_name"
                  value={formData.course_name}
                  onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                  placeholder="Introduction to Programming"
                  className={cn('h-11', formErrors.course_name && 'border-destructive focus:ring-destructive')}
                />
                {formErrors.course_name && (
                  <p className="text-xs text-destructive">{formErrors.course_name}</p>
                )}
              </div>
              <div className="form-field">
                <Label htmlFor="course_code">Course Code</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="course_code"
                    value={formData.course_code}
                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                    placeholder="CS101"
                    className={cn('h-11 pl-10 uppercase', formErrors.course_code && 'border-destructive focus:ring-destructive')}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Must be unique. Will be converted to uppercase.</p>
                {formErrors.course_code && (
                  <p className="text-xs text-destructive">{formErrors.course_code}</p>
                )}
              </div>
              <div className="form-field">
                <Label htmlFor="course_duration">Duration (months)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="course_duration"
                    type="number"
                    min={1}
                    max={120}
                    value={formData.course_duration}
                    onChange={(e) => setFormData({ ...formData, course_duration: parseInt(e.target.value) || 1 })}
                    className={cn('h-11 pl-10', formErrors.course_duration && 'border-destructive focus:ring-destructive')}
                  />
                </div>
                {formErrors.course_duration && (
                  <p className="text-xs text-destructive">{formErrors.course_duration}</p>
                )}
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
                {editingCourse ? 'Save Changes' : 'Add Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}