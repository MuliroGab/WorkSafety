import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Play, RotateCcw } from "lucide-react";

interface TrainingCourseCardProps {
  course: any;
  progress?: any;
  onAction: (courseId: number, action: string) => void;
  isUpdating: boolean;
}

export default function TrainingCourseCard({ course, progress, onAction, isUpdating }: TrainingCourseCardProps) {
  const progressValue = progress?.progress || 0;
  const isCompleted = progressValue === 100;
  const isInProgress = progressValue > 0 && progressValue < 100;
  const isNotStarted = progressValue === 0;

  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge className="bg-safety-green text-white">Completed</Badge>;
    } else if (isInProgress) {
      return <Badge className="bg-safety-warning text-white">In Progress</Badge>;
    } else {
      return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const getActionButton = () => {
    if (isCompleted) {
      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAction(course.id, "review")}
          disabled={isUpdating}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Review
        </Button>
      );
    } else if (isInProgress) {
      return (
        <Button 
          size="sm"
          onClick={() => onAction(course.id, "continue")}
          disabled={isUpdating}
          className="bg-primary-blue hover:bg-blue-700"
        >
          <Play className="h-4 w-4 mr-2" />
          Continue
        </Button>
      );
    } else {
      return (
        <Button 
          size="sm"
          onClick={() => onAction(course.id, "start")}
          disabled={isUpdating}
          className="bg-primary-blue hover:bg-blue-700"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Course
        </Button>
      );
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Course Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 bg-primary-blue/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Play className="h-8 w-8 text-primary-blue" />
          </div>
          <p className="text-sm text-gray-600">Training Course</p>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{course.title}</h3>
          {getStatusBadge()}
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        {isInProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progressValue}%</span>
            </div>
            <Progress value={progressValue} className="w-full" />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {isInProgress && progressValue < 100
              ? `${Math.round((course.duration * (100 - progressValue)) / 100)} minutes left`
              : `${course.duration} minutes`
            }
          </div>
          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  );
}
