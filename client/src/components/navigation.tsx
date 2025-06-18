import { Link, useLocation } from "wouter";
import { Shield, Bell, User, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Training", href: "/training" },
  { name: "Checklists", href: "/checklists" },
  { name: "Documents", href: "/documents" },
];

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear();
      window.location.reload();
    },
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="relative mr-3">
                <Shield className="text-primary-green h-8 w-8" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">+</span>
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-900">SafetyFirst</h1>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex space-x-8">
                {navigationItems.map((item) => {
                  const isActive = location === item.href || 
                    (item.href === "/dashboard" && location === "/");
                  
                  return (
                    <Link key={item.name} href={item.href}>
                      <a
                        className={`px-1 pb-4 text-sm font-medium border-b-2 transition-colors ${
                          isActive
                            ? "text-primary-green border-primary-green"
                            : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
                        }`}
                      >
                        {item.name}
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Welcome, {user?.name}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
