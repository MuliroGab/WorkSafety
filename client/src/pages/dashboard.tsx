import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, GraduationCap, ClipboardCheck, TrendingUp, CheckCircle, CircleAlert, FileText } from "lucide-react";
import SafetyMetricsCard from "@/components/safety-metrics-card";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/metrics"],
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/recent-activity"],
  });

  if (metricsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "incident":
        return <CircleAlert className="h-5 w-5 text-safety-warning" />;
      case "notification":
        return <FileText className="h-5 w-5 text-primary-green" />;
      default:
        return <CheckCircle className="h-5 w-5 text-safety-green" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Safety Dashboard</h2>
        <p className="text-gray-600">Real-time overview of workplace safety metrics and alerts</p>
      </div>

      {/* Critical Alerts */}
      <Alert className="mb-6 border-safety-critical bg-red-50">
        <AlertTriangle className="h-4 w-4 text-safety-critical" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <h3 className="text-safety-critical font-semibold">Critical Safety Alert</h3>
            <p className="text-gray-700 text-sm">Equipment maintenance overdue in Warehouse B - Action required immediately</p>
          </div>
          <Button variant="destructive" size="sm">
            View Details
          </Button>
        </AlertDescription>
      </Alert>

      {/* Safety Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SafetyMetricsCard
          title="Overall Safety Score"
          value={`${metrics?.safetyScore || 0}%`}
          icon={<Shield className="h-6 w-6" />}
          trend="↑ 3% from last month"
          color="safety-green"
        />
        <SafetyMetricsCard
          title="Incidents This Month"
          value={metrics?.incidentsThisMonth || 0}
          icon={<CircleAlert className="h-6 w-6" />}
          trend="↓ 1 from last month"
          color="safety-warning"
        />
        <SafetyMetricsCard
          title="Training Completion"
          value={`${metrics?.trainingCompletion || 0}%`}
          icon={<GraduationCap className="h-6 w-6" />}
          trend="↑ 8% from last month"
          color="primary-green"
        />
        <SafetyMetricsCard
          title="Risk Assessments"
          value={metrics?.riskAssessments || 0}
          icon={<ClipboardCheck className="h-6 w-6" />}
          trend="Completed this quarter"
          color="gray"
        />
      </div>

      {/* Dashboard Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Safety Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Safety Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Safety trend visualization</p>
                <p className="text-sm text-gray-400">Chart implementation pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity?.length > 0 ? (
                recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-opacity-10 rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">
                        {activity.description} - {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
