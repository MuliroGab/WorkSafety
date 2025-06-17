import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Bell, AlertTriangle, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function NotificationToast() {
  const [visibleNotifications, setVisibleNotifications] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 10000, // Check for new notifications every 10 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest("PUT", `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  useEffect(() => {
    if (notifications) {
      // Show only unread notifications from the last 5 minutes
      const recentUnread = notifications.filter((n: any) => {
        const notificationTime = new Date(n.createdAt).getTime();
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return !n.isRead && notificationTime > fiveMinutesAgo;
      });

      // Show up to 3 most recent notifications
      const toShow = recentUnread.slice(0, 3);
      setVisibleNotifications(toShow);

      // Auto-dismiss after 10 seconds for non-critical notifications
      toShow.forEach((notification: any) => {
        if (notification.type !== "critical") {
          setTimeout(() => {
            dismissNotification(notification.id);
          }, 10000);
        }
      });
    }
  }, [notifications]);

  const dismissNotification = (notificationId: number) => {
    setVisibleNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
    markReadMutation.mutate(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-safety-critical" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-safety-warning" />;
      default:
        return <Info className="h-5 w-5 text-primary-blue" />;
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "critical":
        return "border-l-safety-critical bg-red-50";
      case "warning":
        return "border-l-safety-warning bg-yellow-50";
      default:
        return "border-l-primary-blue bg-blue-50";
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {visibleNotifications.map((notification) => (
        <Card
          key={notification.id}
          className={`max-w-sm border-l-4 shadow-lg ${getNotificationStyles(notification.type)} animate-in slide-in-from-right duration-300`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(notification.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
