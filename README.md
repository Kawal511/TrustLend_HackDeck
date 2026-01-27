# TrustLend 🤝💰

**Lend with Clarity, Repay with Dignity**

A trust-based informal lending manager for friends, family, and communities. Track loans, record repayments, and build trust — all without embarrassment.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)

## ✨ Features

- **🔐 Secure Authentication** - Email & Google OAuth via Clerk
- **💳 Loan Management** - Create, track, and manage loans between users
- **💸 Repayment Tracking** - Both parties can record & confirm payments
- **⭐ Trust Score System** - 0-150 score with tier badges (Bronze → Diamond)
- **📊 Dashboard** - Overview of loans, balances, and trust score
- **🔍 User Search** - Find borrowers by email address
- **📱 Responsive Design** - Works on desktop and mobile

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: Clerk
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Validation**: Zod

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Clerk account (free at [clerk.com](https://clerk.com))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/trustlend.git
cd trustlend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Database
DATABASE_URL="file:./dev.db"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**To get Clerk API keys:**
1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Go to **API Keys** in the dashboard
4. Copy the **Publishable Key** and **Secret Key**

### 4. Set Up Database

```bash
# Generate Prisma client and create database
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
trustlend/
├── app/
│   ├── (auth)/              # Sign-in/sign-up pages
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── loans/           # Loan management
│   │   ├── profile/         # Trust score profile
│   │   └── settings/        # User settings
│   └── api/                 # API routes
├── components/
│   ├── layout/              # Navbar, Sidebar
│   ├── loans/               # LoanCard, LoanForm, etc.
│   ├── trust/               # TrustBadge, TrustGauge
│   └── ui/                  # Shadcn UI components
├── lib/
│   ├── prisma.ts            # Prisma client
│   ├── trust.ts             # Trust score calculations
│   ├── utils.ts             # Utility functions
│   └── validators.ts        # Zod schemas
└── prisma/
    └── schema.prisma        # Database schema
```

## 🎯 Trust Score System

| Score Range | Tier | Loan Limit | Active Loans |
|-------------|------|------------|--------------|
| 0-49 | Bronze | $500 | 1 |
| 50-79 | Silver | $1,500 | 2 |
| 80-109 | Gold | $3,000 | 3 |
| 110-139 | Platinum | $6,000 | 5 |
| 140-150 | Diamond | $10,000 | 10 |

**Score Changes:**
- ✅ On-time repayment: +5 to +10 points
- ⚠️ Late repayment: -5 to -10 points  
- ❌ Disputed payment: -15 points

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

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

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

**Note:** For production, consider using a hosted database like:
- Turso (SQLite edge)
- PlanetScale (MySQL)
- Supabase (PostgreSQL)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ for HackDeck 2026
