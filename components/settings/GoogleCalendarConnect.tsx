"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { getCalendarStatus, connectGoogleCalendar } from "@/lib/client/api";

export function GoogleCalendarConnect() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [connectedAt, setConnectedAt] = useState<Date | null>(null);

  useEffect(() => {
    checkStatus();
    
    // Check for success/error in URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('calendar') === 'success') {
      toast.success("Google Calendar connected!");
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('calendar') === 'error') {
      toast.error("Failed to connect Google Calendar");
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkStatus = async () => {
    try {
      const status = await getCalendarStatus();
      setConnected(status.connected);
      if (status.connectedAt) {
        setConnectedAt(new Date(status.connectedAt));
      }
    } catch (error) {
      console.error("Failed to check calendar status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    connectGoogleCalendar();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium">Google Calendar</h3>
          <p className="text-sm text-muted-foreground">
            {connected 
              ? `Connected ${connectedAt ? new Date(connectedAt).toLocaleDateString() : ''}`
              : "Export loan due dates to your calendar"
            }
          </p>
        </div>
      </div>
      
      {connected ? (
        <Badge variant="default" className="gap-1">
          <Check className="h-3 w-3" />
          Connected
        </Badge>
      ) : (
        <Button onClick={handleConnect} size="sm" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Connect
        </Button>
      )}
    </div>
  );
}
