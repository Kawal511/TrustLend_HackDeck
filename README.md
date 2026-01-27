# TrustLend 🤝💰

**Lend with Clarity, Repay with Dignity**

A trust-based informal lending manager for friends, family, and communities. Track loans, record repayments, build trust scores, and leverage AI-powered features — all without embarrassment.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)

---

## ✨ Features

### Core Features
- **🔐 Secure Authentication** - Email & Google OAuth via Clerk
- **💳 Loan Management** - Create, track, and manage loans between users
- **💸 Repayment Tracking** - Both parties can record & confirm payments
- **⭐ Trust Score System** - 0-150 score with tier badges (Bronze → Diamond)
- **📊 Dashboard** - Overview of loans, balances, and trust score
- **🔍 User Search** - Find borrowers by email address
- **🔔 Real-time Notifications** - Loan requests, repayments, confirmations, overdue alerts
- **📄 CSV Export** - Export specific loan lists to CSV for record keeping
- **📜 PDF Contracts** - Generate formal PDF loan agreements

### AI-Powered Features ✨
- **🤖 AI Contract Generator** - Integrated into loan creation flow (Groq AI with Llama 3.1-70B)
- **📧 Automated Email Reminders** - Smart reminders via Resend API (7/3/1 days before due date)
- **📞 AI Voice Call Reminders** - Bolna AI-powered voice calls with transcription & intent detection
- **💬 AI Dispute Resolution** - Groq-powered mediation chat for loan disputes
- **🕸️ Trust Network Visualization** - D3.js interactive relationship graph
- **🛡️ Fraud Detection System** - Admin dashboard with anomaly detection
- **📅 Google Calendar OAuth** - One-click export of loan due dates (with auto-refresh tokens)
- **📊 Reminders Dashboard** - View all automated reminders on loan detail pages

**AI features are contextually integrated throughout the app!** Generate contracts during loan creation, export to calendar from loan pages, and manage integrations in Settings.

---

## 📱 Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Main dashboard with loan overview and stats |
| `/loans` | List all your loans (given and taken) |
| `/loans/new` | Create a new loan |
| `/loans/[id]` | View loan details and repayments |
| `/loans/[id]/schedule` | AI Repayment Schedule Builder |
| `/profile` | Your trust score profile and history |
| `/contracts/new` | AI Contract Generator |
| `/network` | Trust Network Visualization |
| `/admin/fraud` | Fraud Detection Dashboard |
| `/settings` | Account settings & service integrations (Google Calendar) |

---

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM v6
- **Authentication**: Clerk
- **UI Components**: Shadcn/ui + Tailwind CSS
- **AI/ML**: Groq API (Llama 3.1-70B)
- **Email Service**: Resend API
- **Voice AI**: Bolna AI (automated voice calls)
- **Calendar**: Google Calendar API (OAuth integration)
- **Visualization**: D3.js, Recharts
- **PDF Generation**: jsPDF
- **Validation**: Zod

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A [Clerk](https://clerk.com) account (free)
- A [Groq](https://console.groq.com) API key (free, for AI features)
- A [Resend](https://resend.com) API key (optional, for email reminders)
- A [Bolna](https://bolna.dev) API key (optional, for voice reminders)

### 1. Clone the Repository

```bash
git clone https://github.com/Kawal511/TrustLend_HackDeck.git
cd TrustLend_HackDeck
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Clerk Authentication (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE

# Clerk Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Database
DATABASE_URL="file:./dev.db"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Groq API for AI features (get from https://console.groq.com)
GROQ_API_KEY=gsk_YOUR_GROQ_API_KEY_HERE

# Resend API for email reminders (optional, get from https://resend.com)
RESEND_API_KEY=re_YOUR_RESEND_API_KEY_HERE
RESEND_FROM_EMAIL=your-email@domain.com

# Bolna AI for voice reminders (optional, get from https://bolna.dev)
BOLNA_API_KEY=bn_YOUR_BOLNA_API_KEY_HERE
BOLNA_AGENT_ID=your_bolna_agent_id

# Google Calendar Integration (OAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Cron Job Security
CRON_SECRET=your_random_secret_key_here
```

#### Getting API Keys

**Clerk (Authentication):**
1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Go to **API Keys** in the dashboard
4. Copy the **Publishable Key** and **Secret Key**

**Groq (AI Features):**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Go to **API Keys** and create a new key
4. Copy the key (starts with `gsk_`)

**Resend (Email Reminders - Optional):**
1. Go to [resend.com](https://resend.com)
2. Sign up and verify your email
3. Add your domain or use their testing domain
4. Create an API key in dashboard

**Bolna AI (Voice Reminders - Optional):**
1. Go to [bolna.dev](https://bolna.dev)
2. Sign up for an account
3. Create an agent and get the Agent ID
4. Generate an API key

### 4. Set Up Database

```bash
# Generate Prisma client and create database tables
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
trustlend/
├── app/
│   ├── (auth)/                    # Sign-in/sign-up pages
│   ├── (dashboard)/               # Protected dashboard pages
│   │   ├── loans/                 # Loan management
│   │   │   ├── [id]/schedule/     # AI Repayment Schedule
│   │   │   └── new/               # New loan form
│   │   ├── contracts/new/         # AI Contract Generator
│   │   ├── network/               # Trust Network Viz
│   │   ├── admin/fraud/           # Fraud Detection
│   │   ├── profile/               # Trust score profile
│   │   └── settings/              # User settings + service integrations
│   └── api/                       # API routes
│       ├── auth/google/           # Google OAuth flow
│       ├── calendar/              # Calendar integration (status, export)
│       ├── loans/                 # Loan CRUD + reminders
│       ├── contracts/generate/    # AI contract generation
│       ├── notifications/         # Notifications API
│       ├── users/search/          # User search
│       ├── cron/                  # Automated reminder jobs
│       ├── test/                  # AI services testing endpoints
│       └── webhooks/              # External service webhooks
├── components/
│   ├── layout/                    # Navbar, Sidebar, NotificationDropdown
│   ├── loans/                     # LoanCard, LoanForm, AIContractButton, CalendarExportButton, RemindersDisplay
│   ├── trust/                     # TrustBadge, TrustGauge, TrustNetworkViz
│   ├── settings/                  # GoogleCalendarConnect
│   ├── admin/                     # FraudAlerts
│   └── ui/                        # Shadcn UI components
├── lib/
│   ├── ai/                        # AI algorithms
│   │   ├── repayment-optimizer.ts # Repayment plan generation
│   │   ├── contract-generator.ts  # NLP contract generation (Groq)
│   │   └── fraud-detection.ts     # Anomaly detection
│   ├── graph/                     # Graph algorithms
│   │   └── trust-network.ts       # Network analysis
│   ├── client/                    # Frontend API wrappers
│   │   └── api.ts                 # Client-side service calls
│   ├── reminders.ts               # Reminder creation utilities
│   ├── bolna.ts                   # Bolna AI integration
│   ├── prisma.ts                  # Prisma client
│   ├── trust.ts                   # Trust score calculations
│   └── utils.ts                   # Utility functions
└── prisma/
    └── schema.prisma              # Database schema
```

---

## 🎯 Trust Score System

| Score Range | Tier | Loan Limit | Active Loans |
|-------------|------|------------|--------------|
| 0-49 | 🥉 Bronze | $500 | 1 |
| 50-79 | 🥈 Silver | $1,500 | 2 |
| 80-109 | 🥇 Gold | $3,000 | 3 |
| 110-139 | 💎 Platinum | $6,000 | 5 |
| 140-150 | 👑 Diamond | $10,000 | 10 |

**Score Changes:**
- ✅ On-time repayment: +5 to +10 points
- ⚠️ Late repayment: -5 to -10 points  
- ❌ Disputed payment: -15 points

---

## 🤖 AI Features Detail

### 1. AI Contract Generator (Groq/Llama 3.1-70B)
- **Where**: Integrated into loan creation flow
- **How**: Click "Generate with AI" button when creating a loan
- **API Endpoint**: `POST /api/contracts/generate`
- **Features**:
  - Natural language contract generation
  - Auto-fills loan form with extracted details
  - Formal legal language
  - Instant generation (~2-5 seconds)

### 2. Email Reminder System (Resend)
- **Where**: Automatic for all loans (visible on loan detail pages)
- **Schedule**: 7 days, 3 days, and 1 day before due date
- **API Endpoints**: 
  - `GET /api/loans/[id]/reminders/email` - View reminders
  - `POST /api/cron/send-reminders` - Trigger reminders (automated)
- **Features**:
  - Automated HTML email reminders
  - Overdue notifications
  - Status tracking (Sent, Pending, Failed)
  - Runs every 6 hours via cron

### 3. Voice Call Reminders (Bolna AI)
- **Where**: Automatic for all loans (visible on loan detail pages)
- **Schedule**: Daily at 10 AM for upcoming due dates
- **API Endpoints**:
  - `GET /api/loans/[id]/reminders/voice` - View voice reminders
  - `POST /api/loans/voice-reminder` - Schedule call
  - `POST /api/cron/voice-reminders` - Trigger scheduled calls (automated)
  - `POST /api/webhooks/bolna` - Post-call webhook
- **Features**:
  - AI-powered voice conversations
  - Transcript capture
  - Intent detection (will_repay, disputes, reschedule)
  - Automatic dispute thread creation
  - Runs daily at 10 AM via cron

### 4. Google Calendar Integration (OAuth 2.0)
- **Where**: Loan detail pages & Settings → Integrations
- **How**: Click "Add to Calendar" on any loan
- **API Endpoints**:
  - `GET /api/auth/google` - Initiate OAuth flow
  - `GET /api/auth/google/callback` - Handle OAuth callback
  - `GET /api/calendar/status` - Check connection status
  - `POST /api/calendar/export` - Export loan to calendar
- **Features**:
  - One-click calendar event creation
  - Auto-refresh expired tokens
  - Due date reminders (1 day email + 1 hour popup)
  - Color-coded events (red for payments)
  - Direct link to view event in Google Calendar

### 5. Trust Network Visualization
- **Where**: `/network` page
- **Features**:
  - Force-directed D3.js graph
  - Node size = trust score
  - Edge thickness = loan volume
  - Color coding by loan status
  - Network metrics: centrality, clustering

### 6. Fraud Detection
- **Where**: `/admin/fraud` (admin only)
- **Detects**:
  - Velocity abuse (too many loans quickly)
  - Amount anomalies (unusually large requests)
  - New account abuse
  - Dispute patterns
  - Circular lending

---

## 🧪 Using AI Features

### AI Contract Generation (During Loan Creation)
1. Go to "New Loan" page
2. Search and select a borrower
3. Click **"Generate with AI"** button
4. Enter lender/borrower names and loan description
5. Contract is generated and form auto-fills
6. Review and submit the loan

### Google Calendar Export (From Loan Page)
1. Go to any loan detail page
2. Click **"Add to Calendar"** button
3. If not connected, you'll be redirected to Google OAuth
4. Approve calendar access
5. Loan due date is added to your Google Calendar
6. Click "View" in the success toast to see the event

### View Automated Reminders
1. Go to any loan detail page
2. Scroll down to **"Automated Reminders"** card
3. See all scheduled and sent email/voice reminders
4. Track reminder status (Sent, Scheduled, Failed)

### Connect Google Calendar (Settings)
1. Go to Settings → Integrations
2. Click **"Connect"** on Google Calendar
3. Approve permissions on Google
4. Once connected, export loans from loan pages

### From Your Code (Client-Side API):
```typescript
import {
  generateContract,
  exportToCalendar,
  getEmailReminders,
  getVoiceReminders,
  getCalendarStatus,
  connectGoogleCalendar,
} from "@/lib/client/api";

// Generate contract
const contract = await generateContract({
  lenderName: "Alice",
  borrowerName: "Bob",
  prompt: "$1000 for 6 months at 5% interest",
});

// Export to Google Calendar
const result = await exportToCalendar("loan_id_here");
console.log("Event created:", result.eventLink);

// Get reminders for a loan
const emailReminders = await getEmailReminders("loan_id_here");
const voiceReminders = await getVoiceReminders("loan_id_here");
  borrowerName: "Test User",
});
```

See [AI_SERVICES_GUIDE.md](AI_SERVICES_GUIDE.md) for detailed documentation.
Detects suspicious patterns:
- Velocity abuse (too many loans quickly)
- Amount anomalies (unusually large requests)
- New account abuse
- Dispute patterns
- Circular lending

---

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint

# Database
npx prisma db push              # Push schema to database
npx prisma generate            # Generate Prisma client
npx prisma studio              # Open Prisma Studio (GUI)

# Testing
./test-backend.sh              # Quick backend health check
./test-api-endpoints.sh        # Detailed API endpoint testing
```

---

## 📚 Documentation

- **[AI_SERVICES_GUIDE.md](AI_SERVICES_GUIDE.md)** - Complete AI services integration guide
- **[BACKEND_TEST_REPORT.md](BACKEND_TEST_REPORT.md)** - Comprehensive backend testing report
- **[prisma/schema.prisma](prisma/schema.prisma)** - Database schema with all models

---

## 📝 API Endpoints

### Core Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/loans` | List user's loans |
| POST | `/api/loans` | Create new loan (auto-creates reminders) |
| GET | `/api/loans/[id]` | Get loan details |
| PATCH | `/api/loans/[id]` | Update loan |
| POST | `/api/loans/[id]/repay` | Record repayment |
| PATCH | `/api/loans/[id]/repay` | Confirm/dispute repayment |
| GET | `/api/users/search` | Search users by email |
| GET | `/api/notifications` | Get user notifications |

### AI Service Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contracts/generate` | Generate AI contract (Groq) |
| POST | `/api/test/email` | Send test email (Resend) |
| POST | `/api/test/voice` | Initiate test voice call (Bolna) |
| GET | `/api/loans/[id]/reminders/email` | List email reminders |
| GET | `/api/loans/[id]/reminders/voice` | List voice reminders |
| POST | `/api/loans/voice-reminder` | Schedule voice reminder |

### Cron Job Endpoints (require `CRON_SECRET` auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cron/send-reminders` | Process pending email reminders |
| POST | `/api/cron/voice-reminders` | Process scheduled voice calls |

### Webhook Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/bolna` | Bolna post-call webhook |
| POST | `/api/webhooks/clerk` | Clerk user sync webhook |

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard:
   - Clerk keys (required)
   - Groq API key (required)
   - Resend API key (optional)
   - Bolna API key (optional)
   - Google Calendar credentials (optional)
   - `CRON_SECRET` (required for automated reminders)
4. Deploy!

**Cron Jobs**: Vercel will automatically configure cron jobs from `vercel.json`:
- Email reminders: Every 6 hours
- Voice reminders: Daily at 10 AM

**For production**, consider using:
- **Turso** or **PlanetScale** for database (instead of SQLite)
- Keep all API keys in Vercel's environment secrets

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ for HackDeck 2026
