// app/(dashboard)/admin/fraud/page.tsx - Fraud detection admin dashboard

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FraudAlerts } from "@/components/admin/FraudAlerts";
import { detectFraud, type FraudAlert, type UserActivity } from "@/lib/ai/fraud-detection";

async function generateFraudAlerts(): Promise<FraudAlert[]> {
    // Get all users with their activity data
    const users = await prisma.user.findMany({
        include: {
            loansGiven: true,
            loansTaken: true,
            repaymentsGiven: true,
            repaymentsReceived: true
        }
    });

    const alerts: FraudAlert[] = [];
    const userActivities = new Map<string, UserActivity>();

    // Build activity profiles
    for (const user of users) {
        const accountAge = Math.floor(
            (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        const allLoans = [...user.loansGiven, ...user.loansTaken];
        const avgAmount = allLoans.length > 0
            ? allLoans.reduce((sum, l) => sum + l.amount, 0) / allLoans.length
            : 0;
        const maxAmount = allLoans.length > 0
            ? Math.max(...allLoans.map(l => l.amount))
            : 0;

        // Count recent loans
        const now = Date.now();
        const last24h = allLoans.filter(l =>
            now - new Date(l.createdAt).getTime() < 24 * 60 * 60 * 1000
        ).length;
        const last7d = allLoans.filter(l =>
            now - new Date(l.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
        ).length;

        // Count disputes
        const disputes = user.repaymentsReceived.filter(r => r.status === "DISPUTED").length;
        const confirmations = user.repaymentsReceived.filter(r => r.status === "CONFIRMED").length;

        // Get unique loan partners
        const partners = new Set([
            ...user.loansGiven.map(l => l.borrowerId),
            ...user.loansTaken.map(l => l.lenderId)
        ]);

        const activity: UserActivity = {
            userId: user.id,
            email: user.email,
            name: user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email,
            accountAge,
            trustScore: user.trustScore,
            loansRequested: user.loansTaken.length,
            loansRequestedLast24h: last24h,
            loansRequestedLast7d: last7d,
            averageLoanAmount: avgAmount,
            maxLoanAmount: maxAmount,
            totalDisputes: disputes,
            totalConfirmations: confirmations,
            repaymentsReceived: user.repaymentsReceived.length,
            repaymentsConfirmed: confirmations,
            loanPartners: Array.from(partners)
        };

        userActivities.set(user.id, activity);
    }

    // Run fraud detection on each user
    for (const activity of userActivities.values()) {
        const alert = detectFraud(activity, undefined, undefined, userActivities);
        if (alert) {
            alerts.push(alert);
        }
    }

    // Sort by suspicion score
    return alerts.sort((a, b) => b.suspicionScore - a.suspicionScore);
}

export default async function FraudDashboardPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const alerts = await generateFraudAlerts();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Fraud Detection</h1>
                <p className="text-gray-500 mt-1">
                    Monitor suspicious activities and take action
                </p>
            </div>

            <FraudAlerts alerts={alerts} />
        </div>
    );
}
