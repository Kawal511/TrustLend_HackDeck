// app/(dashboard)/profile/page.tsx - User profile with trust score

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustGauge } from "@/components/trust/TrustGauge";
import TrustScoreTimeline from "@/components/trust/TrustScoreTimeline";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Award, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustHistoryEntry {
    date: string;
    change: number;
    newScore: number;
    loanId?: string;
    reason: string;
}

async function getProfileData(userId: string) {
    const [user, loansGiven, loansTaken] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.loan.findMany({
            where: { lenderId: userId },
            select: { status: true, amount: true }
        }),
        prisma.loan.findMany({
            where: { borrowerId: userId },
            select: { status: true, amount: true }
        })
    ]);

    // Calculate stats
    const completedGiven = loansGiven.filter(l => l.status === "COMPLETED").length;
    const completedTaken = loansTaken.filter(l => l.status === "COMPLETED").length;
    const totalLent = loansGiven.reduce((sum, l) => sum + l.amount, 0);
    const totalBorrowed = loansTaken.reduce((sum, l) => sum + l.amount, 0);

    // Parse trust history
    let trustHistory: TrustHistoryEntry[] = [];
    if (user?.trustHistory) {
        try {
            trustHistory = JSON.parse(user.trustHistory);
        } catch {
            trustHistory = [];
        }
    }

    return {
        user,
        stats: {
            loansGiven: loansGiven.length,
            loansTaken: loansTaken.length,
            completedGiven,
            completedTaken,
            totalLent,
            totalBorrowed,
            onTimeRate: completedTaken > 0
                ? Math.round((completedTaken / loansTaken.length) * 100)
                : 100
        },
        trustHistory: trustHistory.slice(-10).reverse() // Last 10, newest first
    };
}

export default async function ProfilePage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const { user, stats, trustHistory } = await getProfileData(userId);

    if (!user) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <p>Loading profile...</p>
            </div>
        );
    }

    const displayName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.email || "User";

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Your Trust Profile</h1>
                <p className="text-gray-500 mt-1">{displayName}</p>
            </div>

            {/* Trust Gauge Card */}
            <Card>
                <CardContent className="pt-8 pb-6">
                    <TrustGauge score={user.trustScore} email={user.email} size="lg" />
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Wallet className="h-4 w-4" />
                            <span className="text-sm">Loans Given</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.loansGiven}</p>
                        <p className="text-xs text-gray-500">{stats.completedGiven} completed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Wallet className="h-4 w-4" />
                            <span className="text-sm">Loans Taken</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.loansTaken}</p>
                        <p className="text-xs text-gray-500">{stats.completedTaken} completed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Award className="h-4 w-4" />
                            <span className="text-sm">Total Lent</span>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(stats.totalLent)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Award className="h-4 w-4" />
                            <span className="text-sm">On-Time Rate</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.onTimeRate}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Trust History Timeline */}
            <TrustScoreTimeline />

            {/* Trust History (Old) */}
            <Card>
                <CardHeader>
                    <CardTitle>Legacy Trust Score History</CardTitle>
                </CardHeader>
                <CardContent>
                    {trustHistory.length > 0 ? (
                        <div className="space-y-4">
                            {trustHistory.map((entry, index) => (
                                <div key={index}>
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center",
                                            entry.change > 0 && "bg-green-100",
                                            entry.change < 0 && "bg-red-100",
                                            entry.change === 0 && "bg-gray-100"
                                        )}>
                                            {entry.change > 0 ? (
                                                <TrendingUp className="h-5 w-5 text-green-600" />
                                            ) : entry.change < 0 ? (
                                                <TrendingDown className="h-5 w-5 text-red-600" />
                                            ) : (
                                                <Minus className="h-5 w-5 text-gray-600" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{entry.reason}</p>
                                            <p className="text-sm text-gray-500">{formatDate(entry.date)}</p>
                                        </div>

                                        {/* Score change */}
                                        <div className="text-right">
                                            <p className={cn(
                                                "font-bold",
                                                entry.change > 0 && "text-green-600",
                                                entry.change < 0 && "text-red-600",
                                                entry.change === 0 && "text-gray-600"
                                            )}>
                                                {entry.change > 0 ? "+" : ""}{entry.change}
                                            </p>
                                            <p className="text-sm text-gray-500">→ {entry.newScore}</p>
                                        </div>
                                    </div>
                                    {index < trustHistory.length - 1 && <Separator className="mt-4" />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Award className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                            <p>No trust score changes yet</p>
                            <p className="text-sm">Complete loans to build your history</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
