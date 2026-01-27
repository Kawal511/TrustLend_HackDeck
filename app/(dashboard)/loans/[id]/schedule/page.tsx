// app/(dashboard)/loans/[id]/schedule/page.tsx - Repayment schedule builder page

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RepaymentScheduleBuilder } from "@/components/loans/RepaymentScheduleBuilder";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function RepaymentSchedulePage({ params }: Props) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const { id } = await params;

    const loan = await prisma.loan.findUnique({
        where: { id },
        include: {
            borrower: { select: { trustScore: true } },
            lender: { select: { trustScore: true } }
        }
    });

    if (!loan) notFound();

    // Check if user is part of this loan
    if (loan.lenderId !== userId && loan.borrowerId !== userId) {
        redirect("/loans");
    }

    // Get trust score based on role
    const trustScore = loan.borrowerId === userId
        ? loan.borrower.trustScore
        : loan.lender.trustScore;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/loans/${id}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Loan
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Repayment Schedule</h1>
                <p className="text-gray-500 mt-1">
                    Get personalized repayment plans based on your trust score
                </p>
            </div>

            <RepaymentScheduleBuilder
                loanAmount={loan.amount}
                trustScore={trustScore}
            />
        </div>
    );
}
