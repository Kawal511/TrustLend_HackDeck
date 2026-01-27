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
- **🤖 AI Contract Generator** - NLP-powered loan contracts using Groq AI (Llama 3.1-70B)
- **📧 Automated Email Reminders** - Smart reminders via Resend API (7/3/1 days before due date)
- **📞 AI Voice Call Reminders** - Bolna AI-powered voice calls with transcription & intent detection
- **💬 AI Dispute Resolution** - Groq-powered mediation chat for loan disputes
- **🕸️ Trust Network Visualization** - D3.js interactive relationship graph
- **🛡️ Fraud Detection System** - Admin dashboard with anomaly detection
- **📅 Google Calendar Integration** - Auto-export loan due dates to calendar
- **🧪 AI Services Testing Panel** - Test all AI features directly from frontend (Settings page)

**All AI services are now accessible from the frontend!** Test them in Settings → AI Services tab.

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
| `/settings` | Account settings & AI Services testing panel |

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

# Google Calendar Integration (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

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
│   │   └── settings/              # User settings + AI Services testing
│   └── api/                       # API routes
│       ├── loans/                 # Loan CRUD + reminders
│       ├── contracts/generate/    # AI contract generation
│       ├── notifications/         # Notifications API
│       ├── users/search/          # User search
│       ├── cron/                  # Automated reminder jobs
│       ├── test/                  # AI services testing endpoints
│       └── webhooks/              # External service webhooks
├── components/
│   ├── layout/                    # Navbar, Sidebar, NotificationDropdown
│   ├── loans/                     # LoanCard, LoanForm, RepaymentScheduleBuilder, ContractBuilder
│   ├── trust/                     # TrustBadge, TrustGauge, TrustNetworkViz
│   ├── admin/                     # FraudAlerts, AIServicesPanel
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
- **Frontend Testing**: Settings → AI Services → Generate Sample Contract
- **API Endpoint**: `POST /api/contracts/generate`
- **Features**:
  - Natural language contract generation
  - Formal legal language
  - Customizable terms
  - Instant generation (~2-5 seconds)

### 2. Email Reminder System (Resend)
- **Frontend Testing**: Settings → AI Services → Send Test Email
- **API Endpoints**: 
  - `POST /api/test/email` - Send test email
  - `GET /api/loans/[id]/reminders/email` - List reminders
  - `POST /api/cron/send-reminders` - Trigger reminders
- **Features**:
  - Automated reminders (7/3/1 days before due date)
  - HTML email templates
  - Overdue notifications
  - Runs every 6 hours via cron

### 3. Voice Call Reminders (Bolna AI)
- **Frontend Testing**: Settings → AI Services → Initiate Test Call
- **API Endpoints**:
  - `POST /api/test/voice` - Test voice call
  - `GET /api/loans/[id]/reminders/voice` - List voice reminders
  - `POST /api/loans/voice-reminder` - Schedule call
  - `POST /api/cron/voice-reminders` - Trigger scheduled calls
  - `POST /api/webhooks/bolna` - Post-call webhook
- **Features**:
  - AI-powered voice conversations
  - Transcript capture
  - Intent detection (will_repay, disputes, reschedule)
  - Automatic dispute thread creation
  - Runs daily at 10 AM via cron

### 4. Trust Network Visualization
Visualizes lending relationships with:
- Force-directed D3.js graph
- Node size = trust score
- Edge thickness = loan volume
- Color coding by loan status
- Network metrics: centrality, clustering

### 4. Trust Network Visualization
Visualizes lending relationships with:
- Force-directed D3.js graph
- Node size = trust score
- Edge thickness = loan volume
- Color coding by loan status
- Network metrics: centrality, clustering

### 5. Fraud Detection
Detects suspicious patterns:
- Velocity abuse (too many loans quickly)
- Amount anomalies (unusually large requests)
- New account abuse
- Dispute patterns
- Circular lending

---

## 🧪 Testing AI Services

### From the Web Interface:
1. Sign in to your account
2. Navigate to **Settings** (http://localhost:3000/settings)
3. Click the **"AI Services"** tab
4. Test each service:
   - **Contract Generation**: Click "Generate Sample Contract"
   - **Email**: Enter your email and click "Send Test Email"
   - **Voice Call**: Enter phone number and click "Initiate Test Call" (⚠️ Makes real call!)
   - **Google Calendar**: Connect your calendar

### From Your Code:
```typescript
import {
  generateContract,
  sendTestEmail,
  testVoiceCall,
  getEmailReminders,
  getVoiceReminders,
} from "@/lib/client/api";

// Generate contract
const contract = await generateContract({
  lenderName: "Alice",
  borrowerName: "Bob",
  amount: 1000,
  purpose: "Emergency",
  dueDate: "2026-02-15",
});

// Send test email
await sendTestEmail("your@email.com", {
  amount: 500,
  dueDate: "2026-02-15",
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
