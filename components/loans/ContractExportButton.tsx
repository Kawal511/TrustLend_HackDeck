"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

interface LoanContractProps {
    loan: {
        id: string;
        amount: number;
        status: string;
        dueDate: Date | string;
        createdAt: Date | string;
        purpose?: string | null;
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
    };
}

export function ContractExportButton({ loan }: LoanContractProps) {
    const handleExport = () => {
        const doc = new jsPDF();
        
        // Fonts
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("LOAN AGREEMENT", 105, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Reference ID: ${loan.id}`, 105, 30, { align: "center" });
        doc.text(`Date: ${format(new Date(loan.createdAt), "MMMM d, yyyy")}`, 105, 35, { align: "center" });

        // Divider
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);

        // Content
        let y = 60;
        const leftMargin = 20;
        const valueX = 80;

        // Parties
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("1. The Parties", leftMargin, y);
        y += 10;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        
        // Lender
        const lenderName = loan.lender.firstName && loan.lender.lastName 
            ? `${loan.lender.firstName} ${loan.lender.lastName}` 
            : loan.lender.email;
        doc.text("Lender:", leftMargin, y);
        doc.text(lenderName, valueX, y);
        y += 10;
        doc.text("Email:", leftMargin, y);
        doc.text(loan.lender.email, valueX, y);
        y += 15;

        // Borrower
        const borrowerName = loan.borrower.firstName && loan.borrower.lastName 
            ? `${loan.borrower.firstName} ${loan.borrower.lastName}` 
            : loan.borrower.email;
        doc.text("Borrower:", leftMargin, y);
        doc.text(borrowerName, valueX, y);
        y += 10;
        doc.text("Email:", leftMargin, y);
        doc.text(loan.borrower.email, valueX, y);
        y += 20;

        // Terms
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("2. Loan Terms", leftMargin, y);
        y += 10;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        doc.text("Principal Amount:", leftMargin, y);
        doc.text(`$${loan.amount.toFixed(2)}`, valueX, y);
        y += 10;

        doc.text("Due Date:", leftMargin, y);
        doc.text(format(new Date(loan.dueDate), "MMMM d, yyyy"), valueX, y);
        y += 10;

        if (loan.purpose) {
            doc.text("Purpose:", leftMargin, y);
            doc.text(loan.purpose, valueX, y);
            y += 10;
        }

        y += 10;
        
        // Agreement Text
        doc.setFontSize(11);
        const agreementText = `The Lender agrees to lend the Principal Amount to the Borrower, and the Borrower agrees to repay the Principal Amount to the Lender by the Due Date. This agreement is legally binding and enforceable by law.`;
        
        const splitText = doc.splitTextToSize(agreementText, 170);
        doc.text(splitText, leftMargin, y);
        y += 30;

        // Signatures
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("3. Signatures", leftMargin, y);
        y += 20;

        // Draw signature lines
        doc.line(leftMargin, y, 90, y);
        doc.line(120, y, 190, y);
        y += 5;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Lender Signature", leftMargin, y);
        doc.text("Borrower Signature", 120, y);
        y += 20;

        doc.text(`Digital Verification: TrustLend Authenticated`, 105, 280, { align: "center" });

        doc.save(`loan_contract_${loan.id.substring(0, 8)}.pdf`);
    };

    return (
        <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Contract
        </Button>
    );
}
