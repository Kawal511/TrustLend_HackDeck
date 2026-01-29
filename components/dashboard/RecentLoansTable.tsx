"use client";

import { Loan, User } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

type LoanWithRelations = Loan & {
    borrower: User;
    lender: User;
};

interface RecentLoansTableProps {
    loans: LoanWithRelations[];
    userId: string;
}

export function RecentLoansTable({ loans, userId }: RecentLoansTableProps) {
    if (loans.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-bold">Recent Loans</h3>
                {/* Mock Year Selectors from Image */}
                <div className="flex gap-4 font-bold text-sm">
                    <span>2024</span>
                    <span className="text-gray-400">2025</span>
                </div>
            </div>

            <div className="flex justify-between text-sm font-bold mb-2 px-6">
                <span className="w-1/3">Detail</span>
                <span className="w-1/3 text-right">Due Date</span>
                <span className="w-1/3 text-right">Amount</span>
            </div>

            <div className="space-y-3">
                {loans.slice(0, 3).map((loan) => {
                    const isLender = loan.lenderId === userId;
                    const counterpart = isLender ? loan.borrower : loan.lender;

                    return (
                        <Link
                            key={loan.id}
                            href={`/loans/${loan.id}`}
                            className="flex items-center justify-between bg-white border-2 border-black rounded-[1.5rem] px-6 py-4 transition-transform hover:-translate-y-1"
                        >
                            <div className="w-1/3 flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-gray-200">
                                    <AvatarImage src={counterpart.imageUrl || ""} />
                                    <AvatarFallback>{counterpart.firstName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-sm">{isLender ? "Lent to" : "Borrowed from"}</p>
                                    <p className="text-xs text-gray-500">{counterpart.firstName} {counterpart.lastName}</p>
                                </div>
                            </div>
                            <div className="w-1/3 text-right font-medium">
                                {format(new Date(loan.dueDate), "MMM dd, yyyy")}
                            </div>
                            <div className="w-1/3 text-right font-bold text-lg">
                                {formatCurrency(loan.amount)}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
