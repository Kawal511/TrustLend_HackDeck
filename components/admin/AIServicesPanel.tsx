"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  generateContract,
  sendTestEmail,
  testVoiceCall,
  scheduleVoiceReminder,
  connectGoogleCalendar,
  getCalendarStatus,
} from "@/lib/client/api";

export function AIServicesPanel() {
  const [loading, setLoading] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [contractData, setContractData] = useState("");

  // Test Contract Generation
  const handleGenerateContract = async () => {
    setLoading("contract");
    try {
      const result = await generateContract({
        lenderName: "John Doe",
        borrowerName: "Jane Smith",
        amount: 1000,
        purpose: "Emergency medical expense",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        interestRate: 0,
      });
      setContractData(result.contract);
      toast.success("Contract generated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(null);
    }
  };

  // Test Email Service
  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address");
      return;
    }
    setLoading("email");
    try {
      await sendTestEmail(testEmail, {
        amount: 500,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        borrowerName: "Test User",
      });
      toast.success("Test email sent successfully! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(null);
    }
  };

  // Test Voice Call
  const handleTestVoiceCall = async () => {
    if (!testPhone) {
      toast.error("Please enter a phone number");
      return;
    }
    setLoading("voice");
    try {
      const result = await testVoiceCall(testPhone);
      toast.success(`Voice call initiated! Call ID: ${result.callId}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(null);
    }
  };

  // Connect Google Calendar
  const handleConnectCalendar = async () => {
    try {
      const status = await getCalendarStatus();
      if (status.connected) {
        toast.info("Google Calendar is already connected!");
      } else {
        connectGoogleCalendar();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Services Testing</h2>
          <p className="text-muted-foreground">Test integrated AI services from the frontend</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contract Generation */}
        <Card>
          <CardHeader>
            <CardTitle>🤖 AI Contract Generator</CardTitle>
            <CardDescription>Test Groq AI contract generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGenerateContract}
              disabled={loading === "contract"}
              className="w-full"
            >
              {loading === "contract" ? "Generating..." : "Generate Sample Contract"}
            </Button>
            {contractData && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {contractData.substring(0, 500)}...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Testing */}
        <Card>
          <CardHeader>
            <CardTitle>📧 Email Service (Resend)</CardTitle>
            <CardDescription>Send a test email reminder</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <Button
              onClick={handleSendTestEmail}
              disabled={loading === "email"}
              className="w-full"
            >
              {loading === "email" ? "Sending..." : "Send Test Email"}
            </Button>
          </CardContent>
        </Card>

        {/* Voice Call Testing */}
        <Card>
          <CardHeader>
            <CardTitle>📞 Voice Reminder (Bolna AI)</CardTitle>
            <CardDescription>Initiate a test voice call</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="tel"
              placeholder="+1234567890"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
            />
            <Button
              onClick={handleTestVoiceCall}
              disabled={loading === "voice"}
              className="w-full"
            >
              {loading === "voice" ? "Calling..." : "Initiate Test Call"}
            </Button>
            <p className="text-xs text-muted-foreground">
              ⚠️ This will make a real phone call. Use with caution.
            </p>
          </CardContent>
        </Card>

        {/* Google Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>📅 Google Calendar</CardTitle>
            <CardDescription>Connect your Google Calendar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleConnectCalendar} className="w-full">
              Connect Google Calendar
            </Button>
            <p className="text-xs text-muted-foreground">
              Export loan due dates to your calendar automatically
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Groq AI (Contract Generation)</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                ✓ Ready
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Resend (Email)</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                ✓ Ready
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Bolna AI (Voice)</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                ✓ Ready
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Google Calendar</span>
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                ⚠ OAuth Required
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
