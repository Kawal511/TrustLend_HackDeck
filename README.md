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

### AI-Powered Features
- **🤖 AI Repayment Optimizer** - Personalized repayment schedules with 3 plan options
- **📝 AI Contract Generator** - NLP-powered loan contracts using Groq AI
- **🕸️ Trust Network Visualization** - D3.js interactive relationship graph
- **🛡️ Fraud Detection System** - Admin dashboard with anomaly detection
- **📧 Email Reminders** - Automated payment reminders via Resend API (7/3/1 day before due)
- **📞 Voice Call Reminders** - AI-powered voice calls via Bolna AI with conversation tracking
- **💬 AI Dispute Resolution** - Groq-powered mediation chat for loan disputes
- **🛡️ Fraud Detection System** - Admin dashboard with anomaly detection

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
| `/settings` | Account settings |

---

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: Clerk
- **UI Components**: Shadcn/ui + Tailwind CSS
- **AI**: Groq API (Llama 3.1)
- **Email**: Resend API
- **Voice**: Bolna AI
- **Calendar**: Google Calendar API
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

# Groq API for AI Contract Generator (get from https://console.groq.com)
GROQ_API_KEY=gsk_YOUR_GROQ_API_KEY_HERE
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
│   │   └── settings/              # User settings
│   └── api/                       # API routes
│       ├── loans/                 # Loan CRUD
│       ├── contracts/generate/    # AI contract generation
│       ├── notifications/         # Notifications API
│       └── users/search/          # User search
├── components/
│   ├── layout/                    # Navbar, Sidebar, NotificationDropdown
│   ├── loans/                     # LoanCard, LoanForm, RepaymentScheduleBuilder, ContractBuilder
│   ├── trust/                     # TrustBadge, TrustGauge, TrustNetworkViz
│   ├── admin/                     # FraudAlerts
│   └── ui/                        # Shadcn UI components
├── lib/
│   ├── ai/                        # AI algorithms
│   │   ├── repayment-optimizer.ts # Repayment plan generation
│   │   ├── contract-generator.ts  # NLP contract generation (Groq)
│   │   └── fraud-detection.ts     # Anomaly detection
│   ├── graph/                     # Graph algorithms
│   │   └── trust-network.ts       # Network analysis
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

### 1. Repayment Optimizer
Generates 3 personalized repayment plans:
- **Aggressive** - Pay off 40% faster with higher payments
- **Balanced** - Optimal balance of speed and affordability
- **Conservative** - Lower payments over longer duration

Based on: trust score, loan amount, payment frequency preference

### 2. Contract Generator
Uses Groq AI (Llama 3.1) to:
- Parse natural language loan descriptions
- Extract terms: amount, duration, interest rate, payment schedule
- Generate formal contract text
- Support digital signatures from both parties

### 3. Trust Network
Visualizes lending relationships with:
- Force-directed D3.js graph
- Node size = trust score
- Edge thickness = loan volume
- Color coding by loan status
- Network metrics: centrality, clustering

### 4. Fraud Detection
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
```

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/loans` | List user's loans |
| POST | `/api/loans` | Create new loan |
| GET | `/api/loans/[id]` | Get loan details |
| PATCH | `/api/loans/[id]` | Update loan |
| POST | `/api/loans/[id]/repay` | Record repayment |
| PATCH | `/api/loans/[id]/repay` | Confirm/dispute repayment |
| GET | `/api/users/search` | Search users by email |
| POST | `/api/contracts/generate` | Generate AI contract |
| GET | `/api/notifications` | Get user notifications |

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

**For production**, consider using:
- **Turso** or **PlanetScale** for database
- Keep `GROQ_API_KEY` in production secrets

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ for HackDeck 2026
