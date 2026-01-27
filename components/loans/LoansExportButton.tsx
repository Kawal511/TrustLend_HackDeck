"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

interface Loan {
    id: string;
    amount: number;
    status: string;
    dueDate: Date | string;
    createdAt: Date | string;
    lender: {
        firstName?: string | null;
        lastName?: string | null;
        email: string;
    };
    borrower: {
        firstName?: string | null;
        lastName?: string | null;
        email: string;
    };
}

interface LoansExportButtonProps {
    loansGiven: Loan[];
    loansTaken: Loan[];
}

export function LoansExportButton({ loansGiven, loansTaken }: LoansExportButtonProps) {
    const handleExport = () => {
        // Combine data
        const allLoans = [
            ...loansGiven.map(l => ({ ...l, type: "Given" })),
            ...loansTaken.map(l => ({ ...l, type: "Taken" }))
        ];

        if (allLoans.length === 0) return;

        // Create CSV header
        const headers = ["ID", "Type", "Amount", "Status", "Lender", "Borrower", "Created Date", "Due Date"];
        
        // Create CSV rows
        const rows = allLoans.map(loan => {
            const lenderName = loan.lender.firstName && loan.lender.lastName 
                ? `${loan.lender.firstName} ${loan.lender.lastName}` 
                : loan.lender.email;
                
            const borrowerName = loan.borrower.firstName && loan.borrower.lastName 
                ? `${loan.borrower.firstName} ${loan.borrower.lastName}` 
                : loan.borrower.email;

            return [
                loan.id,
                loan.type,
                loan.amount.toString(),
                loan.status,
                lenderName,
                borrowerName,
                format(new Date(loan.createdAt), "yyyy-MM-dd"),
                format(new Date(loan.dueDate), "yyyy-MM-dd")
            ].map(val => `"${val}"`).join(","); // Quote values
        });

        // Combine all
        const csvContent = [headers.join(","), ...rows].join("\n");

        // Download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `my_loans_${format(new Date(), "yyyyMMdd")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
        </Button>
    );
}
