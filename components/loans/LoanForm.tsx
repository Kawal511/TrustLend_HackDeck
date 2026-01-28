// components/loans/LoanForm.tsx - Create new loan form

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustBadge } from "@/components/trust/TrustBadge";
import { AIContractButton } from "@/components/loans/AIContractButton";
import { TemplateSelector } from "@/components/loans/TemplateSelector";
import { toast } from "sonner";
import { Loader2, Search, User, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { calculateLoanLimit } from "@/lib/trust";

interface BorrowerInfo {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    trustScore: number;
    completedLoans: number;
}

export function LoanForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [borrowerEmail, setBorrowerEmail] = useState("");
    const [borrowerInfo, setBorrowerInfo] = useState<BorrowerInfo | null>(null);
    const [amount, setAmount] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [purpose, setPurpose] = useState("");
    const [notes, setNotes] = useState("");

    // Search for borrower by email
    async function searchBorrower() {
        if (!borrowerEmail) return;

        setSearchLoading(true);
        try {
            const res = await fetch(`/api/users/search?email=${encodeURIComponent(borrowerEmail)}`);
            const data = await res.json();

            if (res.ok) {
                setBorrowerInfo(data);
            } else {
                setBorrowerInfo(null);
                toast.error(data.error || "User not found");
            }
        } catch {
            toast.error("Failed to search user");
        } finally {
            setSearchLoading(false);
        }
    }

    // Submit loan
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!borrowerInfo) {
            toast.error("Please find a valid borrower first");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/loans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    borrowerEmail: borrowerInfo.email,
                    amount: parseFloat(amount),
                    dueDate: new Date(dueDate).toISOString(),
                    purpose: purpose || undefined,
                    notes: notes || undefined
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Loan created successfully!");
                router.push(`/loans/${data.id}`);
                router.refresh();
            } else {
                toast.error(data.error || "Failed to create loan");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    const limits = borrowerInfo ? calculateLoanLimit(borrowerInfo.trustScore) : null;
    const amountNum = parseFloat(amount) || 0;
    const exceedsLimit = limits && amountNum > limits.maxAmount;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template Selector */}
            <TemplateSelector
                onSelect={(template) => {
                    setAmount(template.amount.toString());
                    setPurpose(template.purpose);
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + template.daysUntilDue);
                    setDueDate(dueDate.toISOString().split('T')[0]);
                }}
            />

            {/* Borrower Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Find Borrower</CardTitle>
                    <CardDescription>Enter the email of the person you want to lend to</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                type="email"
                                placeholder="borrower@email.com"
                                value={borrowerEmail}
                                onChange={(e) => setBorrowerEmail(e.target.value)}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={searchBorrower}
                            disabled={searchLoading || !borrowerEmail}
                        >
                            {searchLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Borrower Info Display */}
                    {borrowerInfo && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-green-700" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                        {borrowerInfo.firstName && borrowerInfo.lastName
                                            ? `${borrowerInfo.firstName} ${borrowerInfo.lastName}`
                                            : borrowerInfo.email}
                                    </p>
                                    <p className="text-sm text-gray-500">{borrowerInfo.completedLoans} loans completed</p>
                                </div>
                                <TrustBadge score={borrowerInfo.trustScore} />
                            </div>

                            {/* Limits Info */}
                            {limits && (
                                <div className="mt-3 pt-3 border-t border-green-200 text-sm">
                                    <span className="text-gray-600">
                                        Max loan: <strong>{formatCurrency(limits.maxAmount)}</strong> |
                                        Active loans allowed: <strong>{limits.maxActiveLoans}</strong>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Loan Details */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Loan Details</CardTitle>
                            <CardDescription>Specify the amount and terms</CardDescription>
                        </div>
                        {borrowerInfo && (
                            <AIContractButton
                                onContractGenerated={(contract) => {
                                    if (contract.amount) setAmount(contract.amount.toString());
                                    if (contract.dueDate) setDueDate(contract.dueDate);
                                    if (contract.purpose) setPurpose(contract.purpose);
                                    if (contract.terms) setNotes(contract.terms);
                                }}
                            />
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount ($)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="1"
                            max="10000"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                        {exceedsLimit && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                Exceeds borrower&apos;s trust limit ({formatCurrency(limits!.maxAmount)})
                            </p>
                        )}
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Purpose */}
                    <div className="space-y-2">
                        <Label htmlFor="purpose">Purpose (Optional)</Label>
                        <Input
                            id="purpose"
                            placeholder="e.g., Textbooks, Emergency fund"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            maxLength={200}
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Private Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Only you can see this"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            maxLength={500}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Submit */}
            <Button
                type="submit"
                className="w-full"
                disabled={loading || !borrowerInfo || !amount || !dueDate || !!exceedsLimit}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Loan...
                    </>
                ) : (
                    "Create Loan"
                )}
            </Button>
            {(!borrowerInfo || !amount || !dueDate) && (
                 <p className="text-sm text-center text-muted-foreground mt-2">
                    {!borrowerInfo ? "Search for a borrower above" :
                     !amount ? "Enter loan amount" :
                     "Select a due date"}
                 </p>
            )}
        </form>
    );
}
