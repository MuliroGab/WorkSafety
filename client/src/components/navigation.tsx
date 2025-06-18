import { Link, useLocation } from "wouter";
import { Shield, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Training", href: "/training" },
  { name: "Checklists", href: "/checklists" },
  { name: "Documents", href: "/documents" },
];

export default function Navigation() {
  const [location] = useLocation();

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

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
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-safety-critical rounded-full text-xs flex items-center justify-center text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">John Smith</span>
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
