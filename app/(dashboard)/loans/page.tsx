// app/(dashboard)/loans/page.tsx - Loans list page

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoanCard } from "@/components/loans/LoanCard";
import { LoansExportButton } from "@/components/loans/LoansExportButton";
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

    // Serialize for client component
    const serializedGiven = JSON.parse(JSON.stringify(loansGiven));
    const serializedTaken = JSON.parse(JSON.stringify(loansTaken));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 border-dashed border-gray-200 pb-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-black mb-2">My Loans</h1>
                    <p className="text-gray-500 font-medium">Manage your lending and borrowing activities</p>
                </div>
                <div className="flex gap-3">
                    <LoansExportButton loansGiven={serializedGiven} loansTaken={serializedTaken} />
                    <Button asChild className="bg-black text-white hover:bg-black/80 h-11 px-6 rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none transition-all hover:translate-x-[2px] hover:translate-y-[2px]">
                        <Link href="/loans/new">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            New Loan
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="given" className="w-full">
                <TabsList className="bg-transparent p-0 mb-8 border-b-2 border-gray-100 w-full justify-start h-auto gap-8 rounded-none">
                    <TabsTrigger
                        value="given"
                        className="gap-2 text-lg font-bold text-gray-400 data-[state=active]:text-black data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-0 pb-3 transition-colors"
                    >
                        <Wallet className="h-5 w-5" />
                        Loans Given ({loansGiven.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="taken"
                        className="gap-2 text-lg font-bold text-gray-400 data-[state=active]:text-black data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-0 pb-3 transition-colors"
                    >
                        <Wallet className="h-5 w-5" />
                        Loans Taken ({loansTaken.length})
                    </TabsTrigger>
                </TabsList>

                {/* Loans Given */}
                <TabsContent value="given" className="mt-0">
                    {loansGiven.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {loansGiven.map((loan) => (
                                <LoanCard key={loan.id} loan={loan} perspective="lender" />
                            ))}
                        </div>
                    ) : (
                        <EmptyState type="given" />
                    )}
                </TabsContent>

                {/* Loans Taken */}
                <TabsContent value="taken" className="mt-0">
                    {loansTaken.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        <div className="text-center py-20 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center border-2 border-gray-100 shadow-sm">
                <Wallet className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">
                No loans {type === "given" ? "given" : "taken"} yet
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">
                {type === "given"
                    ? "Start building your trust network by lending to friends and family."
                    : "Loans you borrow from others will appear here."}
            </p>
            {type === "given" && (
                <Button asChild className="bg-black text-white hover:bg-black/80 h-11 px-6 rounded-xl font-bold">
                    <Link href="/loans/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Loan
                    </Link>
                </Button>
            )}
        </div>
    );
}
