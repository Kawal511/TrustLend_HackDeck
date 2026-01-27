// components/loans/RepaymentHistory.tsx - Payment timeline

"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, getStatusColor } from "@/lib/utils";
import { Check, X, Clock, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Repayment {
    id: string;
    amount: number;
    note?: string | null;
    status: string;
    initiatedBy: string;
    confirmedAt?: Date | string | null;
    createdAt: Date | string;
    payer: {
        firstName?: string | null;
        lastName?: string | null;
        email: string;
    };
    receiver: {
        firstName?: string | null;
        lastName?: string | null;
        email: string;
    };
}

interface RepaymentHistoryProps {
    repayments: Repayment[];
    loanId: string;
    currentUserId: string;
    lenderId: string;
    borrowerId: string;
}

export function RepaymentHistory({
    repayments,
    loanId,
    currentUserId,
    lenderId,
    borrowerId
}: RepaymentHistoryProps) {
    const router = useRouter();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    if (repayments.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No payments recorded yet</p>
            </div>
        );
    }

    async function handleAction(repaymentId: string, action: "confirm" | "dispute") {
        setActionLoading(repaymentId);
        try {
            const res = await fetch(`/api/loans/${loanId}/repay?repaymentId=${repaymentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(action === "confirm" ? "Payment confirmed!" : "Payment disputed");
                router.refresh();
            } else {
                toast.error(data.error || "Failed to process");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setActionLoading(null);
        }
    }

    function canConfirmDispute(repayment: Repayment): boolean {
        if (repayment.status !== "PENDING_CONFIRMATION") return false;

        // If borrower initiated, lender can confirm
        if (repayment.initiatedBy === "borrower" && currentUserId === lenderId) return true;
        // If lender initiated, borrower can confirm
        if (repayment.initiatedBy === "lender" && currentUserId === borrowerId) return true;

        return false;
    }

    function getPayerName(repayment: Repayment): string {
        return repayment.payer.firstName && repayment.payer.lastName
            ? `${repayment.payer.firstName} ${repayment.payer.lastName}`
            : repayment.payer.email;
    }

    return (
        <div className="space-y-4">
            {repayments.map((repayment) => (
                <div
                    key={repayment.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                >
                    {/* Icon */}
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border">
                        {repayment.status === "CONFIRMED" ? (
                            <Check className="h-5 w-5 text-green-600" />
                        ) : repayment.status === "DISPUTED" ? (
                            <X className="h-5 w-5 text-red-600" />
                        ) : (
                            <Clock className="h-5 w-5 text-orange-600" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                                {formatCurrency(repayment.amount)}
                            </span>
                            <Badge className={getStatusColor(repayment.status)}>
                                {repayment.status.replace("_", " ")}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                            <User className="h-3 w-3" />
                            <span>Paid by {getPayerName(repayment)}</span>
                        </div>

                        <p className="text-xs text-gray-400">
                            {formatDateTime(repayment.createdAt)}
                            {repayment.initiatedBy && (
                                <span> • Recorded by {repayment.initiatedBy}</span>
                            )}
                        </p>

                        {repayment.note && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                                &quot;{repayment.note}&quot;
                            </p>
                        )}

                        {/* Action buttons */}
                        {canConfirmDispute(repayment) && (
                            <div className="flex gap-2 mt-3">
                                <Button
                                    size="sm"
                                    onClick={() => handleAction(repayment.id, "confirm")}
                                    disabled={actionLoading === repayment.id}
                                >
                                    {actionLoading === repayment.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-1" />
                                            Confirm
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAction(repayment.id, "dispute")}
                                    disabled={actionLoading === repayment.id}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Dispute
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
