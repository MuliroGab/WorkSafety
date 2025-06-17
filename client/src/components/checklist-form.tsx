import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface ChecklistFormProps {
  assessment: any;
  onUpdate: (assessmentId: number, items: any[]) => void;
  isUpdating: boolean;
}

export default function ChecklistForm({ assessment, onUpdate, isUpdating }: ChecklistFormProps) {
  const [items, setItems] = useState(assessment.items || []);
  
  const completedCount = items.filter((item: any) => item.completed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = completedCount === totalCount;

  const handleItemChange = (itemId: string, completed: boolean) => {
    const updatedItems = items.map((item: any) => 
      item.id === itemId ? { ...item, completed } : item
    );
    setItems(updatedItems);
  };

  const handleSubmit = () => {
    onUpdate(assessment.id, items);
  };

  const getStatusBadge = () => {
    switch (assessment.status) {
      case "completed":
        return <Badge className="bg-safety-green text-white">Completed</Badge>;
      case "pending":
        return <Badge className="bg-safety-warning text-white">Pending</Badge>;
      case "in_progress":
        return <Badge className="bg-primary-blue text-white">In Progress</Badge>;
      default:
        return <Badge variant="secondary">{assessment.status}</Badge>;
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "bg-safety-green text-white";
      case "medium":
        return "bg-safety-warning text-white";
      case "high":
      case "critical":
        return "bg-safety-critical text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            {assessment.status === "completed" ? (
              <CheckCircle className="h-5 w-5 mr-2 text-safety-green" />
            ) : (
              <Clock className="h-5 w-5 mr-2 text-safety-warning" />
            )}
            {assessment.title}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getRiskBadgeColor(assessment.riskLevel)}>
              {assessment.riskLevel}
            </Badge>
            {getStatusBadge()}
          </div>
        </div>
        <p className="text-gray-600 text-sm">{assessment.area}</p>
      </CardHeader>
      
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{completedCount} of {totalCount} items completed</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        {/* Checklist Items */}
        <div className="space-y-3 mb-6">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-start space-x-3">
              <Checkbox
                id={`item-${item.id}`}
                checked={item.completed}
                onCheckedChange={(checked) => 
                  handleItemChange(item.id, checked as boolean)
                }
                className="mt-0.5"
                disabled={assessment.status === "completed"}
              />
              <label 
                htmlFor={`item-${item.id}`}
                className={`text-sm flex-1 cursor-pointer ${
                  item.completed ? "line-through text-gray-500" : "text-gray-700"
                }`}
              >
                {item.text}
                {item.required && (
                  <span className="text-safety-critical ml-1">*</span>
                )}
              </label>
            </div>
          ))}
        </div>

        {/* Actions */}
        {assessment.status !== "completed" && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {isComplete ? "Ready to submit" : `${totalCount - completedCount} items remaining`}
            </span>
            <Button 
              onClick={handleSubmit}
              disabled={isUpdating || !isComplete}
              className={isComplete ? "bg-safety-green hover:bg-green-700" : ""}
            >
              {isUpdating ? "Updating..." : isComplete ? "Complete Checklist" : "Save Progress"}
            </Button>
          </div>
        )}

        {assessment.status === "completed" && assessment.completedAt && (
          <div className="flex items-center text-sm text-gray-500">
            <CheckCircle className="h-4 w-4 mr-2 text-safety-green" />
            Completed on {new Date(assessment.completedAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
