import { Card, CardContent } from "@/components/ui/card";

interface SafetyMetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  color: string;
}

export default function SafetyMetricsCard({ title, value, icon, trend, color }: SafetyMetricsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "safety-green":
        return {
          bg: "bg-green-50",
          text: "text-safety-green",
          icon: "text-safety-green"
        };
      case "safety-warning":
        return {
          bg: "bg-yellow-50",
          text: "text-safety-warning",
          icon: "text-safety-warning"
        };
      case "safety-critical":
        return {
          bg: "bg-red-50",
          text: "text-safety-critical",
          icon: "text-safety-critical"
        };
      case "primary-blue":
        return {
          bg: "bg-blue-50",
          text: "text-primary-blue",
          icon: "text-primary-blue"
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-900",
          icon: "text-gray-600"
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-3xl font-bold ${colorClasses.text}`}>{value}</p>
          </div>
          <div className={`h-12 w-12 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
            <div className={colorClasses.icon}>
              {icon}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">{trend}</p>
      </CardContent>
    </Card>
  );
}
