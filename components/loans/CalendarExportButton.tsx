"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportToCalendar, getCalendarStatus, connectGoogleCalendar } from "@/lib/client/api";

interface CalendarExportButtonProps {
  loanId: string;
  loanAmount: number;
  dueDate: Date;
}

export function CalendarExportButton({ loanId, loanAmount, dueDate }: CalendarExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  const checkConnection = async () => {
    try {
      const status = await getCalendarStatus();
      setConnected(status.connected);
      return status.connected;
    } catch (error) {
      return false;
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const isConnected = await checkConnection();
      
      if (!isConnected) {
        const confirm = window.confirm(
          "Google Calendar is not connected. Would you like to connect it now?"
        );
        if (confirm) {
          connectGoogleCalendar();
        }
        return;
      }

      const result = await exportToCalendar(loanId);
      toast.success("Added to Google Calendar!", {
        description: "Loan due date has been added to your calendar.",
        action: result.eventLink ? {
          label: "View",
          onClick: () => window.open(result.eventLink, "_blank"),
        } : undefined,
      });
    } catch (error: any) {
      toast.error("Failed to export to calendar", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Calendar className="h-4 w-4" />
      )}
      Add to Calendar
    </Button>
  );
}
