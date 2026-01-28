"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FileDown, Loader2 } from "lucide-react";
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
        installments?: Array<{
            installmentNumber: number;
            amount: number;
            dueDate: Date | string;
            status: string;
        }>;
    };
}

export function ContractExportButton({ loan }: LoanContractProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [upiId, setUpiId] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const lenderName = loan.lender.firstName && loan.lender.lastName
        ? `${loan.lender.firstName} ${loan.lender.lastName}`
        : loan.lender.email;

    const borrowerName = loan.borrower.firstName && loan.borrower.lastName
        ? `${loan.borrower.firstName} ${loan.borrower.lastName}`
        : loan.borrower.email;

    const handleExport = () => {
        setIsGenerating(true);

        try {
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
            doc.text("Lender:", leftMargin, y);
            doc.text(lenderName, valueX, y);
            y += 10;
            doc.text("Email:", leftMargin, y);
            doc.text(loan.lender.email, valueX, y);
            y += 15;

            // Borrower
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
            doc.text(`₹${loan.amount.toLocaleString()}`, valueX, y);
            y += 10;

            doc.text("Due Date:", leftMargin, y);
            doc.text(format(new Date(loan.dueDate), "MMMM d, yyyy"), valueX, y);
            y += 10;

            if (loan.purpose) {
                doc.text("Purpose:", leftMargin, y);
                doc.text(loan.purpose, valueX, y);
                y += 10;
            }

            y += 5;

            // Payment Schedule (if installments exist)
            if (loan.installments && loan.installments.length > 0) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(14);
                doc.text("3. Payment Schedule", leftMargin, y);
                y += 10;

                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");

                // Table header
                doc.text("#", leftMargin, y);
                doc.text("Amount", leftMargin + 20, y);
                doc.text("Due Date", leftMargin + 60, y);
                doc.text("Status", leftMargin + 110, y);
                y += 8;

                // Table rows
                for (const inst of loan.installments.slice(0, 6)) {
                    doc.text(String(inst.installmentNumber), leftMargin, y);
                    doc.text(`₹${inst.amount.toLocaleString()}`, leftMargin + 20, y);
                    doc.text(format(new Date(inst.dueDate), "MMM d, yyyy"), leftMargin + 60, y);
                    doc.text(inst.status, leftMargin + 110, y);
                    y += 7;
                }

                if (loan.installments.length > 6) {
                    doc.text(`... and ${loan.installments.length - 6} more installments`, leftMargin, y);
                    y += 10;
                }

                y += 5;
            }

            // Payment Link Section
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            const paymentSectionNum = loan.installments && loan.installments.length > 0 ? "4" : "3";
            doc.text(`${paymentSectionNum}. Payment Link`, leftMargin, y);
            y += 10;

            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");

            if (upiId) {
                const linkPeUrl = `https://ptprashanttripathi.github.io/linkpe/?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(lenderName)}&amt=${loan.amount}&cu=INR`;

                doc.text("Pay using UPI:", leftMargin, y);
                y += 8;

                doc.setTextColor(0, 0, 255);
                doc.textWithLink("Click here to pay via LinkPe", leftMargin, y, { url: linkPeUrl });
                doc.setTextColor(0, 0, 0);
                y += 8;

                doc.setFontSize(9);
                doc.text(`UPI ID: ${upiId}`, leftMargin, y);
                y += 6;
                doc.text(`URL: ${linkPeUrl}`, leftMargin, y, { maxWidth: 170 });
                y += 15;
            } else {
                doc.text("No UPI ID provided for payment link.", leftMargin, y);
                y += 15;
            }

            // Agreement Text
            doc.setFontSize(11);
            const agreementText = `The Lender agrees to lend the Principal Amount to the Borrower, and the Borrower agrees to repay the Principal Amount to the Lender by the Due Date. This agreement is legally binding and enforceable by law.`;

            const splitText = doc.splitTextToSize(agreementText, 170);
            doc.text(splitText, leftMargin, y);
            y += 30;

            // Signatures
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            const signatureSectionNum = loan.installments && loan.installments.length > 0 ? "5" : "4";
            doc.text(`${signatureSectionNum}. Signatures`, leftMargin, y);
            y += 20;

            // Draw signature lines
            doc.line(leftMargin, y, 90, y);
            doc.line(120, y, 190, y);
            y += 5;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Lender Signature", leftMargin, y);
            doc.text("Borrower Signature", 120, y);

            doc.text(`Digital Verification: TrustLend Authenticated`, 105, 280, { align: "center" });

            doc.save(`loan_contract_${loan.id.substring(0, 8)}.pdf`);
            setIsDialogOpen(false);
            setUpiId("");
        } catch (error) {
            console.error("Failed to generate PDF:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                <FileDown className="mr-2 h-4 w-4" />
                Export Contract
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Export Loan Contract</DialogTitle>
                        <DialogDescription>
                            Enter the Lender&apos;s UPI ID to include a payment link in the contract PDF.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="upi-id">Payee UPI ID</Label>
                            <Input
                                id="upi-id"
                                placeholder="e.g., yourname@okicici"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                                This will generate a LinkPe payment link in the PDF contract.
                            </p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                            <p><strong>Lender:</strong> {lenderName}</p>
                            <p><strong>Amount:</strong> ₹{loan.amount.toLocaleString()}</p>
                            <p><strong>Due:</strong> {format(new Date(loan.dueDate), "MMMM d, yyyy")}</p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleExport} disabled={isGenerating}>
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Generate PDF
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
