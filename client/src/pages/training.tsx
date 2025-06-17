import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Play, CheckCircle, AlertCircle } from "lucide-react";
import TrainingCourseCard from "@/components/training-course-card";
import { apiRequest } from "@/lib/queryClient";

export default function Training() {
  const queryClient = useQueryClient();
  
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/users/1/progress"], // TODO: Get user ID from auth
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ courseId, progress: progressValue }: { courseId: number; progress: number }) => {
      return apiRequest("PUT", "/api/users/1/progress", { courseId, progress: progressValue });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
    },
  });

  if (coursesLoading || progressLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const progressMap = new Map(progress?.map((p: any) => [p.courseId, p]) || []);
  const totalCourses = courses?.length || 0;
  const completedCourses = progress?.filter((p: any) => p.progress === 100).length || 0;
  const overallProgress = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  const handleCourseAction = async (courseId: number, action: string) => {
    const currentProgress = progressMap.get(courseId);
    
    if (action === "start") {
      await updateProgressMutation.mutateAsync({ courseId, progress: 10 });
    } else if (action === "continue") {
      const newProgress = Math.min(100, (currentProgress?.progress || 0) + 30);
      await updateProgressMutation.mutateAsync({ courseId, progress: newProgress });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Training Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Safety Training</h2>
        <p className="text-gray-600">Comprehensive safety courses and certification tracking</p>
      </div>

      {/* Training Progress Overview */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Training Progress</h3>
            <span className="text-sm text-gray-500">{overallProgress}% Complete</span>
          </div>
          <Progress value={overallProgress} className="w-full" />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{completedCourses} of {totalCourses} courses completed</span>
            <span>{totalCourses - completedCourses} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Training Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course: any) => {
          const courseProgress = progressMap.get(course.id);
          return (
            <TrainingCourseCard
              key={course.id}
              course={course}
              progress={courseProgress}
              onAction={handleCourseAction}
              isUpdating={updateProgressMutation.isPending}
            />
          );
        })}
      </div>

      {courses?.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Courses Available</h3>
          <p className="text-gray-500">Check back later for new safety training courses.</p>
        </div>
      )}
    </div>
  );
}
