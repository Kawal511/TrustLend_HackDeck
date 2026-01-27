"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEmailReminders, getVoiceReminders } from "@/lib/client/api";
import { Clock, Mail, Phone, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface RemindersDisplayProps {
  loanId: string;
}

export function RemindersDisplay({ loanId }: RemindersDisplayProps) {
  const [emailReminders, setEmailReminders] = useState<any[]>([]);
  const [voiceReminders, setVoiceReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, [loanId]);

  const loadReminders = async () => {
    try {
      const [emailData, voiceData] = await Promise.all([
        getEmailReminders(loanId).catch(() => ({ reminders: [] })),
        getVoiceReminders(loanId).catch(() => ({ reminders: [] })),
      ]);
      setEmailReminders(emailData.reminders || []);
      setVoiceReminders(voiceData.reminders || []);
    } catch (error) {
      console.error("Failed to load reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reminders</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const hasReminders = emailReminders.length > 0 || voiceReminders.length > 0;

  if (!hasReminders) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
      case "COMPLETED":
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Sent</Badge>;
      case "PENDING":
      case "SCHEDULED":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Scheduled</Badge>;
      case "FAILED":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Automated Reminders</CardTitle>
        <CardDescription>Email and voice call reminders for this loan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Reminders */}
        {emailReminders.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Reminders
            </h4>
            <div className="space-y-2">
              {emailReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {reminder.reminderType === "DUE_DATE_7_DAYS" && "7 days before"}
                      {reminder.reminderType === "DUE_DATE_3_DAYS" && "3 days before"}
                      {reminder.reminderType === "DUE_DATE_1_DAY" && "1 day before"}
                      {reminder.reminderType === "OVERDUE" && "Overdue"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(reminder.scheduledFor).toLocaleDateString()}
                      {reminder.sentAt && ` • Sent ${new Date(reminder.sentAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  {getStatusBadge(reminder.status)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Reminders */}
        {voiceReminders.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Voice Call Reminders
            </h4>
            <div className="space-y-2">
              {voiceReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Voice call to {reminder.phoneNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Scheduled: {new Date(reminder.scheduledFor).toLocaleDateString()}
                      {reminder.callId && ` • Call ID: ${reminder.callId.substring(0, 8)}...`}
                    </p>
                  </div>
                  {getStatusBadge(reminder.status)}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
