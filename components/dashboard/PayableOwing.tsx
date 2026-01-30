"use client";

import { Loan, User } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type LoanWithRelations = Loan & {
    borrower: User;
    lender: User;
};

interface PayableOwingProps {
    owedToUser: LoanWithRelations[];
    owedByUser: LoanWithRelations[];
}

export function PayableOwing({ owedToUser, owedByUser }: PayableOwingProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Active Loans</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Owed To User (Invoices payable to you) */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-500 text-sm">Money Owed to You</h3>
                    {owedToUser.length > 0 ? (
                        owedToUser.slice(0, 3).map(loan => (
                            <div key={loan.id} className="flex items-center justify-between bg-white border-2 border-black rounded-[1.5rem] px-6 py-4">
                                <span className="font-medium text-sm">
                                    {loan.borrower.firstName || "Borrower"}
                                </span>
                                <span className="font-bold">
                                    {formatCurrency(loan.balance)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-between bg-white border-2 border-black rounded-[1.5rem] px-6 py-4">
                            <span className="font-medium text-sm">No active loans</span>
                            <span className="font-bold">₹0.00</span>
                        </div>
                    )}
                </div>

                {/* Owed By User (Bills you owe) */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-500 text-sm">Money You Owe</h3>
                    {owedByUser.length > 0 ? (
                        owedByUser.slice(0, 3).map(loan => (
                            <div key={loan.id} className="flex items-center justify-between bg-white border-2 border-black rounded-[1.5rem] px-6 py-4">
                                <span className="font-medium text-sm">
                                    {loan.lender.firstName || "Lender"}
                                </span>
                                <span className="font-bold text-red-600">
                                    {formatCurrency(loan.balance)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-between bg-white border-2 border-black rounded-[1.5rem] px-6 py-4">
                            <span className="font-medium text-sm">No active debts</span>
                            <span className="font-bold">₹0.00</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
