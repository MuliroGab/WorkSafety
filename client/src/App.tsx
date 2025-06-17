import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import Training from "@/pages/training";
import Checklists from "@/pages/checklists";
import Documents from "@/pages/documents";
import NotificationToast from "@/components/notification-toast";
import EmergencyButton from "@/components/emergency-button";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/training" component={Training} />
        <Route path="/checklists" component={Checklists} />
        <Route path="/documents" component={Documents} />
        <Route component={NotFound} />
      </Switch>
      <EmergencyButton />
      <NotificationToast />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
