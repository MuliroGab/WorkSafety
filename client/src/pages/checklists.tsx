import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardCheck, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import ChecklistForm from "@/components/checklist-form";
import { apiRequest } from "@/lib/queryClient";

export default function Checklists() {
  const queryClient = useQueryClient();
  
  const { data: assessments, isLoading } = useQuery({
    queryKey: ["/api/assessments"],
  });

  const updateAssessmentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return apiRequest("PUT", `/api/assessments/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pendingAssessments = assessments?.filter((a: any) => a.status === "pending") || [];
  const recentAssessments = assessments?.slice(0, 10) || [];

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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-safety-green text-white";
      case "pending":
        return "bg-safety-warning text-white";
      case "in_progress":
        return "bg-primary-blue text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleChecklistUpdate = async (assessmentId: number, items: any[]) => {
    const completedCount = items.filter(item => item.completed).length;
    const totalCount = items.length;
    const isCompleted = completedCount === totalCount;
    
    await updateAssessmentMutation.mutateAsync({
      id: assessmentId,
      updates: {
        items,
        status: isCompleted ? "completed" : "in_progress",
        completedAt: isCompleted ? new Date().toISOString() : null,
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Risk Assessment Checklists</h2>
        <p className="text-gray-600">Interactive safety checklists for comprehensive risk evaluation</p>
      </div>

      {/* Active Checklists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {pendingAssessments.map((assessment: any) => (
          <ChecklistForm
            key={assessment.id}
            assessment={assessment}
            onUpdate={handleChecklistUpdate}
            isUpdating={updateAssessmentMutation.isPending}
          />
        ))}
        
        {pendingAssessments.length === 0 && (
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-safety-green mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Checklists Complete</h3>
                <p className="text-gray-500">Great job! All pending risk assessments have been completed.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardCheck className="h-5 w-5 mr-2" />
            Recent Risk Assessments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAssessments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAssessments.map((assessment: any) => (
                  <TableRow key={assessment.id}>
                    <TableCell className="font-medium">{assessment.title}</TableCell>
                    <TableCell>{assessment.area}</TableCell>
                    <TableCell>
                      <Badge className={getRiskBadgeColor(assessment.riskLevel)}>
                        {assessment.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(assessment.status)}>
                        {assessment.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
              <p className="text-gray-500">Start by creating your first risk assessment checklist.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
