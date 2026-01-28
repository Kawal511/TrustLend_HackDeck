// lib/server/fraud-actions.ts - Server-side actions for fraud detection

import { prisma } from "@/lib/prisma";
import { detectFraud, type UserActivity } from "@/lib/ai/fraud-detection";

/**
 * Checks for fraud and takes action if necessary (alerts, blacklisting)
 */
export async function checkAndFlagFraud(userId: string, requestedAmount?: number) {
    // 1. Gather User Activity Data
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            verification: true,
            loansTaken: {
                include: {
                    repayments: true
                }
            },
            repaymentsReceived: true,
            repaymentsGiven: true,
            loansGiven: true,
        }
    });

    if (!user) return null;

    // Calculate metrics
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const loansRequestedLast24h = user.loansTaken.filter((l: { createdAt: Date }) => l.createdAt > oneDayAgo).length;
    const loansRequestedLast7d = user.loansTaken.filter((l: { createdAt: Date }) => l.createdAt > sevenDaysAgo).length;

    const totalLoans = user.loansTaken.length;
    const totalLoanAmount = user.loansTaken.reduce((sum: number, l: { amount: number }) => sum + l.amount, 0);
    const averageLoanAmount = totalLoans > 0 ? totalLoanAmount / totalLoans : 0;
    const maxLoanAmount = user.loansTaken.reduce((max: number, l: { amount: number }) => Math.max(max, l.amount), 0);

    // Calculate dispute stats (this is simplified, assuming we'd query DisputeThread counts)
    const totalDisputes = await prisma.disputeThread.count({
        where: { loan: { borrowerId: userId } }
    });

    const totalConfirmations = user.repaymentsGiven.filter((r: { status: string }) => r.status === 'CONFIRMED').length;

    // Get unique partners
    const partners = new Set<string>();
    user.loansTaken.forEach((l: { lenderId: string }) => partners.add(l.lenderId));
    user.loansGiven.forEach((l: { borrowerId: string }) => partners.add(l.borrowerId));

    const activity: UserActivity = {
        userId: user.id,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        accountAge: Math.floor((now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        trustScore: user.trustScore,
        loansRequested: totalLoans,
        loansRequestedLast24h,
        loansRequestedLast7d,
        averageLoanAmount,
        maxLoanAmount,
        totalDisputes,
        totalConfirmations,
        repaymentsReceived: user.repaymentsReceived.length,
        repaymentsConfirmed: user.repaymentsReceived.filter(r => r.status === 'CONFIRMED').length,
        loanPartners: Array.from(partners)
    };

    // 2. Run Detection
    // For now we don't pass allUserActivities map as it's expensive, enabling only local checks
    // In a real system, you'd run circular checks via a background job
    const alert = detectFraud(activity, requestedAmount);

    if (alert) {
        // 3. Save Alert
        await prisma.fraudAlert.create({
            data: {
                userId: user.id,
                alertType: alert.alertType,
                severity: alert.severity,
                suspicionScore: alert.suspicionScore,
                redFlags: JSON.stringify(alert.redFlags),
                details: JSON.stringify(alert.details),
                actionTaken: alert.severity === 'critical' ? 'blocked' : 'reviewed'
            }
        });

        // 4. Take Action
        if (alert.severity === 'critical') {
            // Auto-blacklist
            await prisma.user.update({
                where: { id: userId },
                data: { isBlacklisted: true }
            });

            await prisma.blacklist.create({
                data: {
                    userId: userId,
                    reason: `Automated Fraud Block: ${alert.alertType} (Score: ${alert.suspicionScore})`,
                    reportedBy: 'SYSTEM', // System ID
                    severity: 'critical',
                    isActive: true
                }
            });

            return { action: 'blocked', alert };
        }

        if (alert.severity === 'high') {
            // Maybe lower trust score?
            await prisma.user.update({
                where: { id: userId },
                data: { trustScore: { decrement: 10 } }
            });
        }
    }

    return alert ? { action: 'alerted', alert } : null;
}
