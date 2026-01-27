// Client-side API wrappers for AI services
// These functions can be used in React components

/**
 * Generate an AI contract using Groq
 */
export async function generateContract(loanDetails: {
  lenderName: string;
  borrowerName: string;
  amount: number;
  purpose: string;
  dueDate: string;
  interestRate?: number;
}) {
  const response = await fetch("/api/contracts/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ loanDetails }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate contract");
  }

  return response.json();
}

/**
 * Send email reminders for a loan
 */
export async function triggerEmailReminder(loanId: string) {
  const response = await fetch("/api/cron/send-reminders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ loanId }),
  });

  if (!response.ok) {
    throw new Error("Failed to send email reminder");
  }

  return response.json();
}

/**
 * Schedule a voice reminder for a loan
 */
export async function scheduleVoiceReminder(data: {
  loanId: string;
  phoneNumber: string;
  scheduledFor: string;
}) {
  const response = await fetch("/api/loans/voice-reminder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to schedule voice reminder");
  }

  return response.json();
}

/**
 * Get all email reminders for a loan
 */
export async function getEmailReminders(loanId: string) {
  const response = await fetch(`/api/loans/${loanId}/reminders/email`);

  if (!response.ok) {
    throw new Error("Failed to fetch email reminders");
  }

  return response.json();
}

/**
 * Get all voice reminders for a loan
 */
export async function getVoiceReminders(loanId: string) {
  const response = await fetch(`/api/loans/${loanId}/reminders/voice`);

  if (!response.ok) {
    throw new Error("Failed to fetch voice reminders");
  }

  return response.json();
}

/**
 * Send a test email reminder
 */
export async function sendTestEmail(email: string, loanDetails: {
  amount: number;
  dueDate: string;
  borrowerName: string;
}) {
  const response = await fetch("/api/test/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, loanDetails }),
  });

  if (!response.ok) {
    throw new Error("Failed to send test email");
  }

  return response.json();
}

/**
 * Initiate a test voice call
 */
export async function testVoiceCall(phoneNumber: string) {
  const response = await fetch("/api/test/voice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneNumber }),
  });

  if (!response.ok) {
    throw new Error("Failed to initiate test call");
  }

  return response.json();
}

/**
 * Export loan data to Google Calendar
 */
export async function exportToCalendar(loanId: string) {
  const response = await fetch("/api/calendar/export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ loanId }),
  });

  if (!response.ok) {
    throw new Error("Failed to export to calendar");
  }

  return response.json();
}

/**
 * Check if user has Google Calendar connected
 */
export async function getCalendarStatus() {
  const response = await fetch("/api/calendar/status");

  if (!response.ok) {
    return { connected: false };
  }

  return response.json();
}

/**
 * Initiate Google Calendar OAuth flow
 */
export function connectGoogleCalendar() {
  window.location.href = "/api/auth/google";
}
