# TrustLend 🤝💰

**Lend with Clarity, Repay with Dignity**

A comprehensive, AI-powered informal lending platform for friends, family, and communities. Track loans, record repayments, build trust scores, verify identities with OCR, and leverage cutting-edge AI features — all without embarrassment.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)

---

## 🌟 What Makes TrustLend Special

TrustLend is not just another loan tracking app. It's a **complete ecosystem** for informal lending that combines:

- 🤖 **AI-Powered Document Verification** - Extract data from Aadhaar, PAN, ITR, and more using Google Gemini OCR
- 🔐 **Multi-Factor Identity Verification** - OTP validation for secure identity confirmation
- 💎 **Dynamic Trust Scoring** - Build and track creditworthiness across your network
- 📞 **AI Voice Call Reminders** - Automated phone call reminders with conversational AI
- 🛡️ **Fraud Detection System** - Real-time anomaly detection to protect lenders
- 📊 **Trust Network Visualization** - D3.js powered interactive relationship graphs

---

## ✨ Complete Feature List

### 🔐 Authentication & User Management
- **Clerk Authentication** - Secure sign-in with email, Google, and social providers
- **User Sync Webhooks** - Automatic user profile synchronization
- **Protected Routes** - Middleware-based route protection
- **Session Management** - Persistent login sessions

### 👤 Identity Verification System
- **Multi-Document Support**:
  - Aadhaar Card (with masked number extraction)
  - PAN Card (with validation)
  - Passport
  - Driver's License
- **Gemini AI OCR** - Automatic data extraction from uploaded documents
- **OTP Verification** - Phone number confirmation via SMS
- **Real-time Validation** - Instant feedback on document quality

### 💰 Income Verification
- **Supported Documents**:
  - Income Tax Returns (ITR)
  - Salary Slips
  - Bank Statements
- **AI-Powered Extraction** - Automatically extract annual income, employer details
- **Confidence Scoring** - Each extraction includes reliability confidence

### 🏠 Collateral Verification
- **Asset Types**:
  - Property deeds
  - Vehicle Registration Certificates (RC)
  - Cryptocurrency wallets
- **Wallet Integration** - Connect and verify crypto wallet balances
- **Document Processing** - OCR extraction from property/vehicle documents

### 💳 Loan Management
- **Full Loan Lifecycle**:
  - Create new loans with detailed terms
  - Track active, paid, and overdue loans
  - Record and confirm repayments
  - Calculate interest and remaining balances
- **Installment Plans** - Split loans into manageable payment schedules
- **QR Code Payments** - Generate UPI QR codes for easy repayment
- **Currency Support** - Multi-currency loan tracking

### 📄 Smart Contracts & Documents
- **AI Contract Generator** - Create formal loan agreements with Groq AI (Llama 3.1-70B)
- **PDF Export** - Generate downloadable PDF contracts using jsPDF
- **Loan Templates** - Save and reuse common loan configurations
- **System Templates** - Pre-configured templates for common scenarios

### ⭐ Trust Score System
| Score Range | Tier | Badge | Loan Limit | Max Active Loans |
|-------------|------|-------|------------|------------------|
| 0-49 | Bronze | 🥉 | $500 | 1 |
| 50-79 | Silver | 🥈 | $1,500 | 2 |
| 80-109 | Gold | 🥇 | $3,000 | 3 |
| 110-139 | Platinum | 💎 | $6,000 | 5 |
| 140-150 | Diamond | 👑 | $10,000 | 10 |

**Score Events:**
- ✅ On-time repayment: +5 to +10 points
- ⚠️ Late repayment: -5 to -10 points
- ❌ Disputed payment: -15 points
- 🤝 New successful loan: +3 points

### 🔔 Notification System
- **Real-time Alerts** - Instant notifications for loan requests, repayments
- **Notification Center** - Centralized view of all notifications
- **Mark as Read** - Individual and bulk read marking
- **Overdue Alerts** - Automatic notifications for missed payments

### 📧 Automated Email Reminders
- **Smart Scheduling** - Reminders at 7, 3, and 1 day before due date
- **Resend API Integration** - Reliable email delivery
- **Status Tracking** - View sent, pending, and failed reminders
- **HTML Templates** - Professional email formatting

### 📞 AI Voice Call Reminders
- **Bolna AI Integration** - Natural conversational voice calls
- **Intent Detection** - Understands responses like "will_repay", "dispute", "reschedule"
- **Transcription** - Full call transcripts stored
- **Auto Dispute Creation** - Creates dispute threads based on call outcomes

### 📅 Google Calendar Integration
- **OAuth 2.0 Flow** - Secure calendar access
- **One-Click Export** - Add loan due dates to calendar
- **Smart Reminders** - 1-day email + 1-hour popup reminders
- **Token Auto-Refresh** - Seamless reconnection

### 🕸️ Trust Network Visualization
- **D3.js Force Graph** - Interactive network visualization
- **Node Sizing** - Based on trust scores
- **Edge Thickness** - Based on loan volume
- **Color Coding** - Visual loan status indicators
- **Network Metrics** - Centrality, clustering analysis

### 🛡️ Fraud Detection System
- **Velocity Abuse Detection** - Too many loans quickly
- **Amount Anomaly Detection** - Unusually large requests
- **New Account Abuse** - Fresh accounts requesting loans
- **Dispute Pattern Analysis** - Unusual dispute frequency
- **Circular Lending Detection** - Suspicious loan patterns

### 💬 AI Dispute Resolution
- **Groq-Powered Mediation** - AI-assisted negotiation
- **Dispute Threads** - Organized conversation history
- **Resolution Suggestions** - AI-generated compromise solutions

### 🔍 User Search & Discovery
- **Email-based Search** - Find users to lend to
- **Privacy Controls** - Users can opt out of search
- **Blacklist System** - Report and block fraudulent users

### 🏦 Borrower Registration
- **Multi-Step Registration** - Guided borrower onboarding
- **Status Tracking** - Application progress visibility
- **Document Management** - Centralized document storage

### 🎨 Beautiful Landing Page
- **Modern UI/UX** - Glassmorphism, animations, gradients
- **Responsive Design** - Mobile-first approach
- **Feature Highlights** - Interactive feature showcases
- **Testimonials** - Social proof carousel
- **Stats Counter** - Animated statistics display

---

## 🏗️ Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.5 | React framework with App Router, Turbopack |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type-safe development |

### Database & ORM
| Technology | Version | Purpose |
|------------|---------|---------|
| **Prisma** | 6.19.2 | Database ORM |
| **SQLite** | - | Local development database |
| **PostgreSQL** | - | Production database (via Prisma Accelerate) |

### Authentication
| Technology | Purpose |
|------------|---------|
| **Clerk** | Authentication, user management, OAuth |

### AI & ML Services
| Technology | Purpose |
|------------|---------|
| **Groq API** (Llama 3.1-70B) | AI contract generation, dispute resolution |
| **Google Gemini** | Document OCR, data extraction |
| **Bolna AI** | Voice call automation with AI |

### Communication
| Technology | Purpose |
|------------|---------|
| **Resend** | Transactional email delivery |
| **Google Calendar API** | Calendar event integration |

### UI Components
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS 4** | Utility-first styling |
| **Radix UI** | Accessible UI primitives |
| **Shadcn/ui** | Pre-built component library |
| **Lucide React** | Icon library |
| **Recharts** | Data visualization charts |
| **D3.js** | Network visualization |

### PDF & Documents
| Technology | Purpose |
|------------|---------|
| **jsPDF** | PDF generation |
| **QRCode** | UPI payment QR codes |

### Validation & Forms
| Technology | Purpose |
|------------|---------|
| **Zod** | Schema validation |
| **React Hook Form** | Form management |

### Other
| Technology | Purpose |
|------------|---------|
| **date-fns** | Date manipulation |
| **sonner** | Toast notifications |
| **next-themes** | Dark/light mode |
| **axios** | HTTP client |

---

## 📁 Project Structure

```
TrustLend_HackDeck/
├── app/
│   ├── (auth)/                     # Authentication pages
│   │   ├── sign-in/                # Sign-in page
│   │   └── sign-up/                # Sign-up page
│   ├── (dashboard)/                # Protected dashboard
│   │   ├── page.tsx                # Main dashboard
│   │   ├── loans/                  # Loan management
│   │   │   ├── [id]/               # Loan details
│   │   │   │   └── schedule/       # AI repayment schedule
│   │   │   └── new/                # Create new loan
│   │   ├── contracts/new/          # AI contract generator
│   │   ├── network/                # Trust network viz
│   │   ├── admin/fraud/            # Fraud detection
│   │   ├── profile/                # User profile
│   │   └── settings/               # User settings
│   ├── api/                        # API routes
│   │   ├── auth/google/            # Google OAuth
│   │   ├── borrowers/              # Borrower registration
│   │   ├── calendar/               # Calendar integration
│   │   ├── contracts/generate/     # AI contracts
│   │   ├── cron/                   # Scheduled jobs
│   │   ├── loans/                  # Loan CRUD
│   │   ├── notifications/          # Notifications
│   │   ├── trust-score/            # Trust calculations
│   │   ├── users/search/           # User search
│   │   ├── verification/           # Document verification
│   │   │   ├── identity/upload/    # ID document upload
│   │   │   ├── income/upload/      # Income doc upload
│   │   │   └── collateral/         # Collateral verification
│   │   └── webhooks/               # External webhooks
│   ├── borrowers/                  # Borrower pages
│   ├── digilocker/                 # DigiLocker integration
│   └── landing/                    # Landing page
├── components/
│   ├── admin/                      # Admin components
│   ├── borrow/                     # Borrower components
│   │   ├── BorrowRequestForm.tsx   # Multi-step form
│   │   └── BorrowRequestFormWrapper.tsx
│   ├── landing/                    # Landing page components
│   │   ├── Hero.tsx                # Hero section
│   │   ├── Navbar.tsx              # Navigation
│   │   ├── Stats.tsx               # Animated stats
│   │   ├── FeaturesGrid.tsx        # Feature cards
│   │   ├── FeatureSection.tsx      # Feature details
│   │   ├── Testimonial.tsx         # Testimonials carousel
│   │   └── Footer.tsx              # Footer
│   ├── layout/                     # Layout components
│   │   ├── Navbar.tsx              # Dashboard nav
│   │   ├── Sidebar.tsx             # Sidebar navigation
│   │   └── NotificationDropdown.tsx
│   ├── loans/                      # Loan components
│   │   ├── LoanCard.tsx            # Loan display card
│   │   ├── LoanForm.tsx            # Loan creation form
│   │   ├── AIContractButton.tsx    # AI contract integration
│   │   ├── CalendarExportButton.tsx
│   │   ├── ContractExportButton.tsx# PDF export
│   │   ├── RemindersDisplay.tsx    # Show reminders
│   │   ├── BorrowerPaymentQR.tsx   # UPI QR code
│   │   └── PendingLoanActions.tsx
│   ├── trust/                      # Trust score components
│   │   ├── TrustBadge.tsx          # Score badge
│   │   ├── TrustGauge.tsx          # Visual gauge
│   │   └── TrustNetworkViz.tsx     # D3 network
│   ├── verification/               # Verification components
│   │   ├── IdentityVerification.tsx  # ID verification
│   │   ├── IncomeVerification.tsx    # Income verification
│   │   ├── CollateralVerification.tsx# Asset verification
│   │   └── VerificationDashboard.tsx # Overview
│   ├── settings/                   # Settings components
│   └── ui/                         # Shadcn UI components
├── lib/
│   ├── ai/                         # AI algorithms
│   │   ├── contract-generator.ts   # Groq contract gen
│   │   ├── fraud-detection.ts      # Anomaly detection
│   │   └── repayment-optimizer.ts  # Payment plans
│   ├── graph/                      # Graph algorithms
│   │   └── trust-network.ts        # Network analysis
│   ├── client/                     # Frontend utilities
│   │   └── api.ts                  # Client-side API
│   ├── server/                     # Server utilities
│   │   └── fraud-actions.ts        # Server actions
│   ├── aadhaar-generator.ts        # Aadhaar utilities
│   ├── bolna.ts                    # Voice AI integration
│   ├── file-storage.ts             # File handling
│   ├── gemini-ocr.ts               # Document OCR
│   ├── prisma.ts                   # Database client
│   ├── reminders.ts                # Reminder utilities
│   ├── trust-score.ts              # Score calculations
│   ├── trust.ts                    # Trust utilities
│   ├── utils.ts                    # General utilities
│   └── validators.ts               # Zod schemas
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Database seeding
├── public/
│   ├── landing/                    # Landing page assets
│   └── uploads/                    # User uploads
└── images(src)/                    # UI Screenshots
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **Clerk** account ([clerk.com](https://clerk.com))
- **Groq** API key ([console.groq.com](https://console.groq.com))
- **Google Gemini** API key ([makersuite.google.com](https://makersuite.google.com))

### Optional Services
- **Resend** API key (email reminders)
- **Bolna** API key (voice calls)
- **Google Cloud** credentials (calendar integration)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Kawal511/TrustLend_HackDeck.git
cd TrustLend_HackDeck

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env.local

# 4. Set up the database
npx prisma db push

# 5. (Optional) Seed sample data
npx prisma db seed

# 6. Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```bash
# ===== REQUIRED =====
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database
DATABASE_URL="file:./dev.db"

# AI Services
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===== OPTIONAL =====
# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Voice (Bolna)
BOLNA_API_KEY=bn_...
BOLNA_AGENT_ID=your_agent_id

# Google Calendar
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Cron Security
CRON_SECRET=your_random_secret
```

---

## 📝 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback |

### Loans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/loans` | List user's loans |
| POST | `/api/loans` | Create new loan |
| GET | `/api/loans/[id]` | Get loan details |
| PATCH | `/api/loans/[id]` | Update loan |
| POST | `/api/loans/[id]/repay` | Record repayment |
| PATCH | `/api/loans/[id]/repay` | Confirm repayment |
| POST | `/api/loans/[id]/approve` | Approve loan request |

### Verification
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/verification/identity/upload` | Upload ID document |
| POST | `/api/verification/income/upload` | Upload income document |
| POST | `/api/verification/collateral/upload` | Upload collateral document |
| POST | `/api/verification/collateral/crypto` | Verify crypto wallet |

### AI Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contracts/generate` | Generate AI contract |
| GET | `/api/loans/[id]/reminders/email` | List email reminders |
| GET | `/api/loans/[id]/reminders/voice` | List voice reminders |

### Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar/status` | Check connection |
| POST | `/api/calendar/export` | Export to calendar |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search` | Search users by email |
| GET | `/api/trust-score/[id]` | Get user trust score |

### Borrowers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/borrowers/register` | Register as borrower |
| GET | `/api/borrowers/status` | Get registration status |

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma db push   # Push schema to database
npx prisma generate  # Generate Prisma client
npx prisma studio    # Open visual database editor
npx prisma db seed   # Seed sample data
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add all environment variables
4. Deploy!

**For Production:**
- Use **PostgreSQL** (via Prisma Accelerate or PlanetScale)
- Configure cron jobs in `vercel.json`
- Set up Clerk webhooks

---

## 📸 Application Screenshots

![App Preview 1](images(src)/1.png)
![App Preview 2](images(src)/2.png)
![App Preview 3](images(src)/3.png)
![App Preview 4](images(src)/4.png)
![App Preview 5](images(src)/5.png)
![App Preview 6](images(src)/6.png)
![App Preview 7](images(src)/7.png)
![App Preview 8](images(src)/8.png)
![App Preview 9](images(src)/9.png)
![App Preview 10](images(src)/10.png)
![App Preview 11](images(src)/11.png)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

## 👥 Team

Built with ❤️ for **HackDeck 2026**

---

## 📚 Additional Documentation

- [AI_SERVICES_GUIDE.md](AI_SERVICES_GUIDE.md) - Complete AI integration guide
- [BACKEND_TEST_REPORT.md](BACKEND_TEST_REPORT.md) - Backend testing documentation
- [prisma/schema.prisma](prisma/schema.prisma) - Database schema reference
