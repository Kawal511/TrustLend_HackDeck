
"use client";

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const ExportDataButton = () => {
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        const res = await fetch('/api/export-data');
        if (!res.ok) throw new Error('Failed to fetch data');
        return await res.json();
    };

    const generateCSV = async () => {
        try {
            setIsLoading(true);
            const data = await fetchData();

            // Flatten data for CSV
            const rows = [];
            // Header
            rows.push(['Type', 'Date', 'Amount', 'Status', 'Counterparty']);

            // Loans Borrowed
            data.loans.borrowed.forEach((l: any) => {
                rows.push(['Loan Taken', format(new Date(l.createdAt), 'yyyy-MM-dd'), l.amount, l.status, l.lender?.firstName || 'Unknown']);
            });
            // Loans Given
            data.loans.lent.forEach((l: any) => {
                rows.push(['Loan Given', format(new Date(l.createdAt), 'yyyy-MM-dd'), l.amount, l.status, l.borrower?.firstName || 'Unknown']);
            });

            let csvContent = "data:text/csv;charset=utf-8,"
                + rows.map(e => e.join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `trustlend_data_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("CSV Exported Successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to export CSV");
        } finally {
            setIsLoading(false);
        }
    };

    const generatePDF = async () => {
        try {
            setIsLoading(true);
            const data = await fetchData();
            const doc = new jsPDF();

            // Brand Colors
            const brandGreen = '#a3e635'; // lime-400
            const brandDark = '#1a1a1a';

            // Header
            doc.setFillColor(28, 30, 28); // Dark background
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text("TrustLend Credit Report", 14, 20);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 30);
            doc.text(`User: ${data.user.firstName} ${data.user.lastName} (${data.user.email})`, 14, 35);

            // Trust Score Card
            const score = data.user.trustScore;
            let scoreColor = [200, 200, 200]; // Default gray
            if (score >= 140) scoreColor = [56, 189, 248]; // Diamond
            else if (score >= 80) scoreColor = [250, 204, 21]; // Gold
            else if (score >= 50) scoreColor = [163, 230, 53]; // Lime/SIlverish

            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(14, 50, 182, 35, 3, 3, 'FD');

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.text("Current Trust Score", 20, 62);

            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]); // Colorize score
            doc.text(score.toString(), 20, 75);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(" / 150", 35, 75);

            // Summary Stats
            const totalBorrowed = data.loans.borrowed.reduce((acc: number, curr: any) => acc + curr.amount, 0);
            const totalLent = data.loans.lent.reduce((acc: number, curr: any) => acc + curr.amount, 0);

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Total Borrowed: ₹${totalBorrowed}`, 100, 65);
            doc.text(`Total Lent: ₹${totalLent}`, 100, 75);

            // Tables - Active Loans
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text("Active Loans", 14, 100);

            const loanRows = data.loans.borrowed.map((l: any) => [
                format(new Date(l.createdAt), 'MMM d, yyyy'),
                `₹${l.amount}`,
                l.status,
                l.lender?.firstName || 'Confidential'
            ]);

            autoTable(doc, {
                startY: 105,
                head: [['Date', 'Amount', 'Status', 'Lender']],
                body: loanRows,
                theme: 'grid',
                headStyles: { fillColor: [28, 30, 28], textColor: 255 },
            });

            // Tables - Transaction History
            const finalY = (doc as any).lastAutoTable.finalY || 150;
            doc.text("Transaction History", 14, finalY + 15);

            const txnRows = data.transactions.slice(0, 15).map((t: any) => [
                format(new Date(t.createdAt), 'MMM d, HH:mm'),
                t.type,
                `₹${t.amount}`,
                t.status
            ]);

            autoTable(doc, {
                startY: finalY + 20,
                head: [['Date', 'Type', 'Amount', 'Status']],
                body: txnRows,
                theme: 'striped',
                headStyles: { fillColor: [163, 230, 53], textColor: 0 }, // Lime header
            });

            doc.save(`TrustLend_Report_${data.user.username || 'user'}.pdf`);
            toast.success("PDF Report Generated");

        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Export Data
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={generateCSV} className="cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={generatePDF} className="cursor-pointer">
                    <FileText className="w-4 h-4 mr-2" />
                    Download PDF Report
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
