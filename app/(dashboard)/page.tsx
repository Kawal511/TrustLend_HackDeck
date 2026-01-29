// app/(dashboard)/page.tsx - Main dashboard

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatCards } from "@/components/dashboard/StatCards";
import { ActivityGraph } from "@/components/dashboard/ActivityGraph";
import { RecentLoansTable } from "@/components/dashboard/RecentLoansTable";
import { PayableOwing } from "@/components/dashboard/PayableOwing";

async function getDashboardData(userId: string) {
    const [user, loansGiven, loansTaken] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.loan.findMany({
            where: { lenderId: userId },
            include: { borrower: true, lender: true },
            orderBy: { createdAt: "desc" },
            take: 5
        }),
        prisma.loan.findMany({
            where: { borrowerId: userId },
            include: { lender: true, borrower: true },
            orderBy: { createdAt: "desc" },
            take: 5
        })
    ]);

    // Calculate totals
    const totalLent = loansGiven.reduce((sum, loan) => sum + loan.amount, 0);
    const totalBorrowed = loansTaken.reduce((sum, loan) => sum + loan.amount, 0);
    const activeLent = loansGiven.filter(l => ["ACTIVE", "OVERDUE"].includes(l.status));
    const activeBorrowed = loansTaken.filter(l => ["ACTIVE", "OVERDUE"].includes(l.status));
    const overdueCount = [...loansGiven, ...loansTaken].filter(l => l.status === "OVERDUE").length;

    // Calculate "Today" stats (mocked logic or based on createdAt)
    // For demo purposes, we will use total lent as "Inflow Today" and total borrowed as "Outflow"
    // in a real app these would be filtered by date.

    return {
        user,
        loansGiven,
        loansTaken,
        totalLent,
        totalBorrowed,
        activeLent,
        activeBorrowed,
        overdueCount
    };
}

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    let data = await getDashboardData(userId);

    if (!data.user) {
        // Auto-sync logic is handled in layout, but double check here or just return loading
        return <div>Loading...</div>
    }

    const { user, loansGiven, loansTaken, totalLent, totalBorrowed, activeLent, activeBorrowed } = data;

    return (
        <div className="space-y-12">
            {/* Top Row: Cash Flow & Profit/Loss */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left: Cash Flow */}
                <StatCards totalLent={totalLent} totalBorrowed={totalBorrowed} />

                {/* Right: Profit & Loss (Activity) */}
                <div className="h-full">
                    <h2 className="text-2xl font-bold mb-1">Profit and loss</h2>
                    <p className="text-gray-500 mb-6">income and expenses on (Includes unpaid invoice and bills)</p>

                    {/* The Graph Card itself handles the styling */}
                    <div className="h-[400px]">
                        <ActivityGraph inflowToday={totalLent} outflowToday={totalBorrowed} />
                    </div>
                </div>
            </div>

            {/* Bottom Row: Net Income & Payable/Owing */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left: Net Income (Recent Loans) */}
                <RecentLoansTable loans={[...loansGiven, ...loansTaken].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())} userId={userId} />

                {/* Right: Payable & Owing */}
                <PayableOwing owedToUser={activeLent} owedByUser={activeBorrowed} />
            </div>
        </div>
    );
}
