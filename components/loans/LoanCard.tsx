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
        overdue: "text-red-600 bg-red-50",
        urgent: "text-orange-600 bg-orange-50",
        approaching: "text-yellow-600 bg-yellow-50",
        safe: "text-gray-600 bg-gray-50"
    };

    return (
        <Card className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={otherParty.imageUrl || undefined} />
                            <AvatarFallback className="bg-purple-100 text-purple-700">
                                {displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-gray-900">{displayName}</p>
                            <TrustBadge score={otherParty.trustScore} size="sm" />
                        </div>
                    </div>
                    <Badge className={getStatusColor(loan.status)}>
                        {loan.status}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                {/* Amount display */}
                <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(loan.balance)}
                        </span>
                        {loan.balance !== loan.amount && (
                            <span className="text-sm text-gray-500">
                                of {formatCurrency(loan.amount)}
                            </span>
                        )}
                    </div>
                    <span className="text-sm text-gray-500">
                        {perspective === "lender" ? "You lent" : "You owe"}
                    </span>
                </div>

                {/* Purpose */}
                {loan.purpose && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                        {loan.purpose}
                    </p>
                )}

                {/* Due date */}
                <div className={cn(
                    "flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg w-fit",
                    dueStatusColors[dueDateStatus]
                )}>
                    {dueDateStatus === "overdue" ? (
                        <AlertCircle className="h-4 w-4" />
                    ) : (
                        <Calendar className="h-4 w-4" />
                    )}
                    <span>
                        {dueDateStatus === "overdue"
                            ? `Overdue since ${formatDate(loan.dueDate)}`
                            : `Due ${formatDate(loan.dueDate)}`
                        }
                    </span>
                </div>
            </CardContent>

            <CardFooter className="pt-3 border-t">
                <Button asChild variant="ghost" className="w-full group-hover:bg-purple-50">
                    <Link href={`/loans/${loan.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
