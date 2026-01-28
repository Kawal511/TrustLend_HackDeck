// app/(dashboard)/page.tsx - Main dashboard

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoanCard } from "@/components/loans/LoanCard";
import { TrustGauge } from "@/components/trust/TrustGauge";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle, Wallet, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";

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

    // Auto-sync user from Clerk if not in database
    let data = await getDashboardData(userId);

    if (!data.user) {
        // Import currentUser to get Clerk profile
        const { currentUser } = await import("@clerk/nextjs/server");
        const clerkUser = await currentUser();

        if (clerkUser) {
            // Create or update user in database (upsert handles email conflicts)
            const email = clerkUser.emailAddresses[0]?.emailAddress || "";

            // First try to find by email and update the ID if needed
            const existingByEmail = await prisma.user.findUnique({ where: { email } });

            if (existingByEmail && existingByEmail.id !== userId) {
                // Email exists with different ID - update the existing record
                await prisma.user.update({
                    where: { email },
                    data: {
                        id: userId,
                        firstName: clerkUser.firstName,
                        lastName: clerkUser.lastName,
                        imageUrl: clerkUser.imageUrl,
                        username: clerkUser.username,
                    }
                });
            } else if (!existingByEmail) {
                // Create new user
                await prisma.user.create({
                    data: {
                        id: userId,
                        email,
                        firstName: clerkUser.firstName,
                        lastName: clerkUser.lastName,
                        imageUrl: clerkUser.imageUrl,
                        username: clerkUser.username,
                        trustScore: 100
                    }
                });
            }
            // Refetch data
            data = await getDashboardData(userId);
        }
    }

    const { user, loansGiven, loansTaken, totalLent, totalBorrowed, activeLent, activeBorrowed, overdueCount } = data;

    if (!user) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
                    <p className="text-gray-500">Please refresh the page in a moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back{user.firstName ? `, ${user.firstName}` : ""}!
                    </h1>
                    <p className="text-gray-500 mt-1">Here&apos;s your lending overview</p>
                </div>
                <Button asChild>
                    <Link href="/loans/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Loan
                    </Link>
                </Button>
            </div>

            {/* Overdue Alert */}
            {overdueCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div className="flex-1">
                        <p className="font-medium text-red-900">
                            You have {overdueCount} overdue loan{overdueCount > 1 ? "s" : ""}
                        </p>
                        <p className="text-sm text-red-700">Please review and take action</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100" asChild>
                        <Link href="/loans?filter=overdue">View</Link>
                    </Button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Lent</CardTitle>
                        <Wallet className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalLent)}</div>
                        <p className="text-xs text-gray-500">{activeLent.length} active loans</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Borrowed</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalBorrowed)}</div>
                        <p className="text-xs text-gray-500">{activeBorrowed.length} active loans</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Outstanding Balance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(activeLent.reduce((sum, l) => sum + l.balance, 0))}
                        </div>
                        <p className="text-xs text-gray-500">Owed to you</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">You Owe</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(activeBorrowed.reduce((sum, l) => sum + l.balance, 0))}
                        </div>
                        <p className="text-xs text-gray-500">To be repaid</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trust Score */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Your Trust Score</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-6">
                        <TrustGauge score={user.trustScore} />
                    </CardContent>
                </Card>

                {/* Recent Loans */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Loans Given */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Loans Given</h2>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/loans?tab=given">
                                    View All <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        {loansGiven.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {loansGiven.slice(0, 4).map((loan) => (
                                    <LoanCard key={loan.id} loan={loan} perspective="lender" />
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 text-center">
                                <p className="text-gray-500">No loans given yet</p>
                                <Button variant="link" asChild className="mt-2">
                                    <Link href="/loans/new">Create your first loan</Link>
                                </Button>
                            </Card>
                        )}
                    </div>

                    {/* Loans Taken */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Loans Taken</h2>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/loans?tab=taken">
                                    View All <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        {loansTaken.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {loansTaken.slice(0, 4).map((loan) => (
                                    <LoanCard key={loan.id} loan={loan} perspective="borrower" />
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 text-center">
                                <p className="text-gray-500">No loans taken yet</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
