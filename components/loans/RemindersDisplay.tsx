"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEmailReminders, getVoiceReminders, sendTestEmail, scheduleVoiceReminder } from "@/lib/client/api";
import { Clock, Mail, Phone, CheckCircle2, XCircle, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface RemindersDisplayProps {
  loanId: string;
  borrowerEmail?: string;
  lenderEmail?: string;
  loanAmount: number;
  dueDate: Date;
}

export function RemindersDisplay({ loanId, borrowerEmail, lenderEmail, loanAmount, dueDate }: RemindersDisplayProps) {
  const [emailReminders, setEmailReminders] = useState<any[]>([]);
  const [voiceReminders, setVoiceReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [schedulingCall, setSchedulingCall] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");

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

  const handleSendEmail = async () => {
    if (!emailTo.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setSendingEmail(true);
    try {
      await sendTestEmail(emailTo, {
        amount: loanAmount,
        dueDate: dueDate.toISOString(),
        borrowerName: "Borrower"
      });
      toast.success("Email sent successfully!");
      setEmailDialogOpen(false);
      setEmailTo("");
      loadReminders();
    } catch (error: any) {
      toast.error("Failed to send email", {
        description: error.message,
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleScheduleCall = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    setSchedulingCall(true);
    try {
      // Schedule call for 5 minutes from now
      const scheduledFor = new Date();
      scheduledFor.setMinutes(scheduledFor.getMinutes() + 5);
      
      await scheduleVoiceReminder({
        loanId,
        phoneNumber,
        scheduledFor: scheduledFor.toISOString()
      });
      toast.success("Voice call scheduled for " + scheduledFor.toLocaleTimeString());
      setCallDialogOpen(false);
      setPhoneNumber("");
      loadReminders();
    } catch (error: any) {
      toast.error("Failed to schedule call", {
        description: error.message,
      });
    } finally {
      setSchedulingCall(false);
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Automated Reminders</CardTitle>
            <CardDescription>Email and voice call reminders for this loan</CardDescription>
          </div>
          <div className="flex gap-2">
            {/* Send Email Button */}
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Send Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Reminder Email</DialogTitle>
                  <DialogDescription>
                    Send an instant email reminder about this loan
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailTo">Recipient Email</Label>
                    <Input
                      id="emailTo"
                      type="email"
                      placeholder="user@example.com"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      disabled={sendingEmail}
                    />
                    {borrowerEmail && lenderEmail && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEmailTo(borrowerEmail)}
                          disabled={sendingEmail}
                        >
                          Borrower
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEmailTo(lenderEmail)}
                          disabled={sendingEmail}
                        >
                          Lender
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEmailDialogOpen(false)}
                      disabled={sendingEmail}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendEmail}
                      disabled={sendingEmail}
                      className="gap-2"
                    >
                      {sendingEmail ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Email
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Schedule Call Button */}
            <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Schedule Call
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Voice Reminder</DialogTitle>
                  <DialogDescription>
                    Schedule an AI-powered voice call reminder
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={schedulingCall}
                    />
                    <p className="text-xs text-muted-foreground">
                      Include country code (e.g., +1 for US)
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCallDialogOpen(false)}
                      disabled={schedulingCall}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleScheduleCall}
                      disabled={schedulingCall}
                      className="gap-2"
                    >
                      {schedulingCall ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <Phone className="h-4 w-4" />
                          Schedule Call
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
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
