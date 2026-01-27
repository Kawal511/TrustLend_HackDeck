// components/loans/RepaymentForm.tsx - Record payment form

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RepaymentFormProps {
    loanId: string;
    maxAmount: number;
}

export function RepaymentForm({ loanId, maxAmount }: RepaymentFormProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const amountNum = parseFloat(amount);
        if (amountNum <= 0 || amountNum > maxAmount) {
            toast.error(`Amount must be between $0.01 and ${formatCurrency(maxAmount)}`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/loans/${loanId}/repay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: amountNum,
                    note: note || undefined
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Payment recorded! Waiting for confirmation.");
                setOpen(false);
                setAmount("");
                setNote("");
                router.refresh();
            } else {
                toast.error(data.error || "Failed to record payment");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    function setFullAmount() {
        setAmount(maxAmount.toString());
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <DollarSign className="h-4 w-4" />
                    Record Payment
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Record a Payment</DialogTitle>
                    <DialogDescription>
                        Enter the amount that was paid. The other party will need to confirm this payment.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Amount */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="repayment-amount">Amount ($)</Label>
                            <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-purple-600"
                                onClick={setFullAmount}
                            >
                                Pay full balance ({formatCurrency(maxAmount)})
                            </Button>
                        </div>
                        <Input
                            id="repayment-amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={maxAmount}
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <Label htmlFor="repayment-note">Note (Optional)</Label>
                        <Textarea
                            id="repayment-note"
                            placeholder="e.g., Venmo transfer, Cash payment"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            maxLength={200}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !amount}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Recording...
                                </>
                            ) : (
                                "Record Payment"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
