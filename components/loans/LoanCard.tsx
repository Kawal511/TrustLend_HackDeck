// components/loans/LoanCard.tsx - Loan summary card

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrustBadge } from "@/components/trust/TrustBadge";
import { formatCurrency, formatDate, getDueDateStatus, getStatusColor } from "@/lib/utils";
import { ArrowRight, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoanCardProps {
    loan: {
        id: string;
        amount: number;
        balance: number;
        status: string;
        dueDate: string | Date;
        purpose?: string | null;
        lender: {
            firstName?: string | null;
            lastName?: string | null;
            email: string;
            imageUrl?: string | null;
            trustScore: number;
        };
        borrower: {
            firstName?: string | null;
            lastName?: string | null;
            email: string;
            imageUrl?: string | null;
            trustScore: number;
        };
    };
    perspective: "lender" | "borrower";
}

export function LoanCard({ loan, perspective }: LoanCardProps) {
    const otherParty = perspective === "lender" ? loan.borrower : loan.lender;
    const dueDateStatus = getDueDateStatus(loan.dueDate);
    const displayName = otherParty.firstName && otherParty.lastName
        ? `${otherParty.firstName} ${otherParty.lastName}`
        : otherParty.email;

    const dueStatusColors = {
        overdue: "text-red-700 bg-red-100 border border-red-200",
        urgent: "text-orange-700 bg-orange-100 border border-orange-200",
        approaching: "text-amber-700 bg-amber-100 border border-amber-200",
        safe: "text-gray-700 bg-gray-100 border border-gray-200"
    };

    const statusBadges = {
        ACTIVE: "bg-black text-white hover:bg-black/90",
        PAID: "bg-[#9eff69] text-black hover:bg-[#8def58] border-2 border-black",
        OVERDUE: "bg-red-100 text-red-900 border-2 border-red-200",
        DEFAULTED: "bg-red-600 text-white hover:bg-red-700",
        PENDING: "bg-yellow-100 text-yellow-900 border-2 border-yellow-200"
    };

    return (
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none bg-white">
            <CardHeader className="pb-3 border-b-2 border-black/5">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-black">
                            <AvatarImage src={otherParty.imageUrl || undefined} />
                            <AvatarFallback className="bg-gray-200 font-bold text-black uppercase">
                                {displayName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-black text-sm">{displayName}</p>
                            <TrustBadge score={otherParty.trustScore} size="sm" />
                        </div>
                    </div>
                    <Badge className={cn("rounded-md px-2 py-0.5 font-bold uppercase text-[10px]", statusBadges[loan.status as keyof typeof statusBadges] || "bg-gray-200 text-gray-800")}>
                        {loan.status}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="py-4">
                {/* Amount display */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-black tracking-tight">
                            {formatCurrency(loan.balance)}
                        </span>
                        {loan.balance !== loan.amount && (
                            <span className="text-xs font-medium text-gray-500">
                                / {formatCurrency(loan.amount)}
                            </span>
                        )}
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        {perspective === "lender" ? "You lent" : "You owe"}
                    </span>
                </div>

                {/* Purpose */}
                {loan.purpose && (
                    <div className="mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <p className="text-sm font-medium text-gray-700 line-clamp-1">
                            &ldquo;{loan.purpose}&rdquo;
                        </p>
                    </div>
                )}

                {/* Due date */}
                <div className={cn(
                    "flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg w-full justify-center",
                    dueStatusColors[dueDateStatus]
                )}>
                    {dueDateStatus === "overdue" ? (
                        <AlertCircle className="h-3.5 w-3.5" />
                    ) : (
                        <Calendar className="h-3.5 w-3.5" />
                    )}
                    <span>
                        {dueDateStatus === "overdue"
                            ? `Overdue (${formatDate(loan.dueDate)})`
                            : `Due ${formatDate(loan.dueDate)}`
                        }
                    </span>
                </div>
            </CardContent>

            <CardFooter className="pt-0 pb-4 px-4">
                <Button asChild className="w-full bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-colors h-11 rounded-xl font-bold">
                    <Link href={`/loans/${loan.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
