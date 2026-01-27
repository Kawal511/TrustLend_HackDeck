// app/(dashboard)/loans/page.tsx - Loans list page

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoanCard } from "@/components/loans/LoanCard";
import { PlusCircle, Wallet } from "lucide-react";

async function getLoans(userId: string) {
    const [loansGiven, loansTaken] = await Promise.all([
        prisma.loan.findMany({
            where: { lenderId: userId },
            include: { borrower: true, lender: true },
            orderBy: { createdAt: "desc" }
        }),
        prisma.loan.findMany({
            where: { borrowerId: userId },
            include: { lender: true, borrower: true },
            orderBy: { createdAt: "desc" }
        })
    ]);

    return { loansGiven, loansTaken };
}

export default async function LoansPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const { loansGiven, loansTaken } = await getLoans(userId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Loans</h1>
                    <p className="text-gray-500 mt-1">Manage your lending and borrowing</p>
                </div>
                <Button asChild>
                    <Link href="/loans/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Loan
                    </Link>
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="given" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="given" className="gap-2">
                        <Wallet className="h-4 w-4" />
                        Loans Given ({loansGiven.length})
                    </TabsTrigger>
                    <TabsTrigger value="taken" className="gap-2">
                        <Wallet className="h-4 w-4" />
                        Loans Taken ({loansTaken.length})
                    </TabsTrigger>
                </TabsList>

                {/* Loans Given */}
                <TabsContent value="given">
                    {loansGiven.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {loansGiven.map((loan) => (
                                <LoanCard key={loan.id} loan={loan} perspective="lender" />
                            ))}
                        </div>
                    ) : (
                        <EmptyState type="given" />
                    )}
                </TabsContent>

                {/* Loans Taken */}
                <TabsContent value="taken">
                    {loansTaken.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {loansTaken.map((loan) => (
                                <LoanCard key={loan.id} loan={loan} perspective="borrower" />
                            ))}
                        </div>
                    ) : (
                        <EmptyState type="taken" />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function EmptyState({ type }: { type: "given" | "taken" }) {
    return (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
                No loans {type === "given" ? "given" : "taken"} yet
            </h3>
            <p className="text-gray-500 mb-4">
                {type === "given"
                    ? "Start by lending to someone you trust"
                    : "Loans you receive will appear here"}
            </p>
            {type === "given" && (
                <Button asChild>
                    <Link href="/loans/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Loan
                    </Link>
                </Button>
            )}
        </div>
    );
}
