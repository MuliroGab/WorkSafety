import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EmergencyButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [area, setArea] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const emergencyMutation = useMutation({
    mutationFn: async (data: { message: string; area?: string }) => {
      return apiRequest("POST", "/api/emergency", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      
      toast({
        title: "Emergency Alert Sent",
        description: "Emergency services and safety team have been notified.",
        variant: "destructive",
      });
      
      setShowDialog(false);
      setMessage("");
      setArea("");
    },
    onError: () => {
      toast({
        title: "Failed to Send Alert",
        description: "Please try again or contact emergency services directly.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    emergencyMutation.mutate({
      message: message.trim(),
      area: area.trim() || undefined,
    });
  };

  return (
    <>
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-safety-critical hover:bg-red-700 text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-safety-critical focus:ring-offset-2"
          size="lg"
        >
          <AlertTriangle className="h-6 w-6" />
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-safety-critical">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Emergency Alert
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="message">Emergency Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the emergency situation..."
                required
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="area">Location/Area (Optional)</Label>
              <Input
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g., Production Floor A, Warehouse B"
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>This will:</strong>
              </p>
              <ul className="text-sm text-red-700 mt-1 ml-4 list-disc">
                <li>Notify all safety team members immediately</li>
                <li>Create an incident report</li>
                <li>Send alerts to relevant personnel</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                disabled={emergencyMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={emergencyMutation.isPending || !message.trim()}
              >
                {emergencyMutation.isPending ? "Sending Alert..." : "Send Emergency Alert"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
