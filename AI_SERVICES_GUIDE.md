# AI Services Frontend Integration Guide

## Overview
All AI services (Groq, Resend, Bolna) are now accessible from the frontend. You can test and use them directly from your web interface.

## 🎯 How to Access

### 1. **Settings Page - AI Services Tab**
Navigate to: **http://localhost:3000/settings** → Click **"AI Services"** tab

Here you can test all integrated services:
- 🤖 **AI Contract Generation** (Groq)
- 📧 **Email Testing** (Resend)
- 📞 **Voice Calls** (Bolna AI)
- 📅 **Google Calendar** (OAuth setup)

---

## 📚 Available API Functions

### Import in your components:
```typescript
import {
  generateContract,
  sendTestEmail,
  testVoiceCall,
  scheduleVoiceReminder,
  getEmailReminders,
  getVoiceReminders,
  exportToCalendar,
  connectGoogleCalendar,
} from "@/lib/client/api";
```

### 1. **Generate AI Contract** 🤖
```typescript
const contract = await generateContract({
  lenderName: "John Doe",
  borrowerName: "Jane Smith",
  amount: 1000,
  purpose: "Emergency medical expense",
  dueDate: "2026-02-28T00:00:00.000Z",
  interestRate: 0,
});

console.log(contract.contract); // AI-generated contract text
```

**API Endpoint:** `POST /api/contracts/generate`

---

### 2. **Send Test Email** 📧
```typescript
await sendTestEmail("your.email@example.com", {
  amount: 500,
  dueDate: "2026-02-15T00:00:00.000Z",
  borrowerName: "Test User",
});
```

**API Endpoint:** `POST /api/test/email`

**Features:**
- HTML email template
- Loan details included
- Sent via Resend API
- Check your inbox after sending

---

### 3. **Test Voice Call** 📞
```typescript
const result = await testVoiceCall("+1234567890");
console.log(result.callId); // Bolna call ID
```

**API Endpoint:** `POST /api/test/voice`

**⚠️ Warning:** This makes a REAL phone call. Use with caution.

---

### 4. **Schedule Voice Reminder**
```typescript
await scheduleVoiceReminder({
  loanId: "loan-uuid",
  phoneNumber: "+1234567890",
  scheduledFor: "2026-02-15T10:00:00.000Z",
});
```

**API Endpoint:** `POST /api/loans/voice-reminder`

---

### 5. **Get Email Reminders for a Loan**
```typescript
const { reminders } = await getEmailReminders("loan-uuid");

reminders.forEach(r => {
  console.log(`${r.reminderType}: ${r.status} - ${r.scheduledFor}`);
});
```

**API Endpoint:** `GET /api/loans/[id]/reminders/email`

---

### 6. **Get Voice Reminders for a Loan**
```typescript
const { reminders } = await getVoiceReminders("loan-uuid");

reminders.forEach(r => {
  console.log(`Call status: ${r.status}, Call ID: ${r.callId}`);
});
```

**API Endpoint:** `GET /api/loans/[id]/reminders/voice`

---

### 7. **Export to Google Calendar** 📅
```typescript
// First, connect calendar
connectGoogleCalendar(); // Redirects to OAuth

// Then export loan
await exportToCalendar("loan-uuid");
```

**API Endpoint:** `POST /api/calendar/export`  
**Note:** Requires OAuth setup (coming soon)

---

## 🧪 Testing Services

### From the UI:
1. Sign in: http://localhost:3000/sign-in
2. Go to Settings → AI Services tab
3. Test each service:
   - Enter your email for email test
   - Enter phone number for voice test (**⚠️ Real call!**)
   - Click "Generate Sample Contract"

### From Code:
```typescript
"use client";

import { useState } from "react";
import { generateContract } from "@/lib/client/api";
import { Button } from "@/components/ui/button";

export function ContractButton() {
  const [loading, setLoading] = useState(false);
  
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateContract({
        lenderName: "Alice",
        borrowerName: "Bob",
        amount: 500,
        purpose: "Rent payment",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      
      console.log(result.contract);
      alert("Contract generated!");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button onClick={handleGenerate} disabled={loading}>
      {loading ? "Generating..." : "Generate Contract"}
    </Button>
  );
}
```

---

## 🔑 Environment Variables Required

All these are already configured in your `.env`:

```bash
# Groq AI (Contract Generation)
GROQ_API_KEY=your_groq_api_key_here

# Resend (Email Service)
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=your-email@domain.com

# Bolna AI (Voice Calls)
BOLNA_API_KEY=your_bolna_api_key_here
BOLNA_AGENT_ID=your_bolna_agent_id_here

# Google Calendar (OAuth)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

---

## 📡 New API Endpoints

### Test Endpoints:
- `POST /api/test/email` - Send test email
- `POST /api/test/voice` - Initiate test voice call

### Reminder Endpoints:
- `GET /api/loans/[id]/reminders/email` - List email reminders
- `GET /api/loans/[id]/reminders/voice` - List voice reminders
- `POST /api/loans/voice-reminder` - Schedule voice reminder

### Existing Endpoints (now usable from frontend):
- `POST /api/contracts/generate` - Generate AI contract
- `POST /api/cron/send-reminders` - Trigger email reminders
- `POST /api/cron/voice-reminders` - Trigger voice reminders

---

## 🎨 UI Component

The `AIServicesPanel` component provides a complete testing interface:

**Location:** `/components/admin/AIServicesPanel.tsx`

**Features:**
- Test contract generation
- Send test emails
- Initiate test voice calls
- Connect Google Calendar
- View service status

**Usage:**
```tsx
import { AIServicesPanel } from "@/components/admin/AIServicesPanel";

export default function TestPage() {
  return <AIServicesPanel />;
}
```

---

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Sign in:**
   http://localhost:3000/sign-in

3. **Go to Settings:**
   http://localhost:3000/settings

4. **Click "AI Services" tab**

5. **Test each service:**
   - Generate a sample contract
   - Send yourself a test email
   - (Optional) Test voice call with your number

---

## 📝 Notes

- **Email Testing:** Emails are sent via Resend. Check your spam folder if not received.
- **Voice Testing:** Bolna makes REAL phone calls. Use your actual phone number.
- **Contract Generation:** Uses Groq's Llama 3.1-70B model, takes 2-5 seconds.
- **Google Calendar:** OAuth flow not yet implemented (schema ready).

---

## 🔧 Troubleshooting

### "Failed to generate contract"
- Check `GROQ_API_KEY` in `.env`
- Ensure you're signed in (Clerk authentication required)

### "Failed to send email"
- Verify `RESEND_API_KEY` in `.env`
- Check `RESEND_FROM_EMAIL` is valid
- Look for errors in terminal logs

### "Failed to initiate test call"
- Confirm `BOLNA_API_KEY` and `BOLNA_AGENT_ID` in `.env`
- Verify phone number format: `+1234567890`
- Check terminal for Bolna API errors

---

## ✅ Service Status

| Service | Status | Accessible From Frontend |
|---------|--------|--------------------------|
| Groq AI (Contracts) | ✅ Ready | ✅ Yes - Settings page |
| Resend (Email) | ✅ Ready | ✅ Yes - Settings page |
| Bolna AI (Voice) | ✅ Ready | ✅ Yes - Settings page |
| Google Calendar | ⚠️ OAuth Pending | 🚧 Schema ready |

---

## 🎯 Next Steps

1. Test all services from the Settings → AI Services tab
2. Use the API functions in your loan creation flow
3. Implement Google Calendar OAuth flow
4. Add service status indicators to dashboard
5. Create automated testing suite

---

**Made with ❤️ for TrustLend**  
*All AI services are now frontend-ready!*
