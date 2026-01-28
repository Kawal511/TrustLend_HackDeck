// app/(dashboard)/loans/[id]/page.tsx - Loan detail page

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrustBadge } from "@/components/trust/TrustBadge";
import { RepaymentForm } from "@/components/loans/RepaymentForm";
import { RepaymentHistory } from "@/components/loans/RepaymentHistory";
import { ContractExportButton } from "@/components/loans/ContractExportButton";
import { CalendarExportButton } from "@/components/loans/CalendarExportButton";
import { RemindersDisplay } from "@/components/loans/RemindersDisplay";
import { RaiseDisputeButton } from "@/components/loans/RaiseDisputeButton";
import { DisputeChat } from "@/components/loans/DisputeChat";
import { formatCurrency, formatDate, getStatusColor, getDueDateStatus } from "@/lib/utils";
import { ArrowLeft, Calendar, User, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

async function getLoan(loanId: string) {
    return await prisma.loan.findUnique({
        where: { id: loanId },
        include: {
            lender: true,
            borrower: true,
            disputeThread: true,
            repayments: {
                include: { payer: true, receiver: true },
                orderBy: { createdAt: "desc" }
            }
        }
    });
}

export default async function LoanDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const { id } = await params;
    const loan = await getLoan(id);

    if (!loan) notFound();

    // Check access
    if (loan.lenderId !== userId && loan.borrowerId !== userId) {
        redirect("/loans");
    }

    const isLender = loan.lenderId === userId;
    const otherParty = isLender ? loan.borrower : loan.lender;
    const dueDateStatus = getDueDateStatus(loan.dueDate);
    const canRecordPayment = ["ACTIVE", "OVERDUE"].includes(loan.status) && loan.balance > 0;

    const displayName = otherParty.firstName && otherParty.lastName
        ? `${otherParty.firstName} ${otherParty.lastName}`
        : otherParty.email;

    const serializedLoan = JSON.parse(JSON.stringify(loan));

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back button */}
            <Button variant="ghost" asChild className="mb-4">
                <Link href="/loans">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Loans
                </Link>
            </Button>

            {/* Header Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold">
                                    {formatCurrency(loan.amount)} Loan
                                </h1>
                                <Badge className={getStatusColor(loan.status)}>{loan.status}</Badge>
                            </div>
                            <p className="text-gray-500">
                                {isLender ? "You lent to" : "You borrowed from"} {displayName}
                            </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <RaiseDisputeButton 
                                loanId={loan.id} 
                                hasExistingDispute={!!loan.disputeThread}
                            />
                            <CalendarExportButton 
                                loanId={loan.id} 
                                loanAmount={loan.amount} 
                                dueDate={loan.dueDate} 
                            />
                            <ContractExportButton loan={serializedLoan} />
                            {canRecordPayment && (
                                <RepaymentForm loanId={loan.id} maxAmount={loan.balance} />
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Balance Progress */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Remaining Balance</span>
                            <span className="text-sm text-gray-500">
                                {formatCurrency(loan.amount - loan.balance)} paid
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-3">
                            {formatCurrency(loan.balance)}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${((loan.amount - loan.balance) / loan.amount) * 100}%` }}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Loan Details Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Other Party */}
                        <div className="space-y-3">
                            <h3 className="font-medium text-gray-900 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {isLender ? "Borrower" : "Lender"}
                            </h3>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={otherParty.imageUrl || undefined} />
                                    <AvatarFallback className="bg-purple-100 text-purple-700">
                                        {displayName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{displayName}</p>
                                    <TrustBadge score={otherParty.trustScore} size="sm" />
                                </div>
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-3">
                            <h3 className="font-medium text-gray-900 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Due Date
                            </h3>
                            <div className={cn(
                                "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
                                dueDateStatus === "overdue" && "bg-red-50 text-red-700",
                                dueDateStatus === "urgent" && "bg-orange-50 text-orange-700",
                                dueDateStatus === "approaching" && "bg-yellow-50 text-yellow-700",
                                dueDateStatus === "safe" && "bg-gray-50 text-gray-700"
                            )}>
                                {dueDateStatus === "overdue" && <AlertCircle className="h-4 w-4" />}
                                <span className="font-medium">{formatDate(loan.dueDate)}</span>
                            </div>
                        </div>

                        {/* Purpose */}
                        {loan.purpose && (
                            <div className="space-y-3">
                                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Purpose
                                </h3>
                                <p className="text-gray-700">{loan.purpose}</p>
                            </div>
                        )}

                        {/* Notes (only visible to lender) */}
                        {isLender && loan.notes && (
                            <div className="space-y-3">
                                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Private Notes
                                </h3>
                                <p className="text-gray-700">{loan.notes}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dispute Resolution */}
            {loan.disputeThread && (
                <DisputeChat 
                    loanId={loan.id}
                    currentUserId={userId}
                />
            )}

            {/* Automated Reminders */}
            <RemindersDisplay 
                loanId={loan.id}
                borrowerEmail={loan.borrower.email}
                lenderEmail={loan.lender.email}
                loanAmount={loan.amount}
                dueDate={loan.dueDate}
            />

            {/* Repayment History */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <RepaymentHistory
                        repayments={loan.repayments}
                        loanId={loan.id}
                        currentUserId={userId}
                        lenderId={loan.lenderId}
                        borrowerId={loan.borrowerId}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
