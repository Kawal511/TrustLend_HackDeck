'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wallet, CheckCircle, Save, Loader2, IndianRupee, TrendingUp, Clock } from 'lucide-react';

interface Installment {
    id: string;
    installmentNumber: number;
    amount: number;
    paidAmount: number;
    dueDate: Date | string;
    status: string;
}

interface Repayment {
    id: string;
    amount: number;
    createdAt: Date | string;
    status: string;
}

interface LenderPaymentSetupProps {
    loanId: string;
    loanAmount: number;
    balance: number;
    existingUpiId?: string | null;
    installments?: Installment[];
    repayments?: Repayment[];
}

export default function LenderPaymentSetup({
    loanId,
    loanAmount,
    balance,
    existingUpiId,
    installments = [],
    repayments = [],
}: LenderPaymentSetupProps) {
    const [upiId, setUpiId] = useState(existingUpiId || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(!!existingUpiId);
    const [error, setError] = useState<string | null>(null);

    const totalPaid = loanAmount - balance;
    const paidPercentage = loanAmount > 0 ? (totalPaid / loanAmount) * 100 : 0;

    const paidInstallments = installments.filter(i => i.status === 'PAID').length;
    const totalInstallments = installments.length;

    const saveUpiId = async () => {
        if (!upiId.trim()) {
            setError('Please enter your UPI ID');
            return;
        }

        if (!upiId.includes('@')) {
            setError('UPI ID must contain @ (e.g., name@upi)');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/loans/${loanId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payeeUpiId: upiId.trim() })
            });

            if (res.ok) {
                setSaved(true);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save UPI ID');
            }
        } catch (err) {
            setError('Failed to save UPI ID');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Payment Collection
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Payment Progress */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Amount Collected</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {paidPercentage.toFixed(0)}%
                        </Badge>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <IndianRupee className="h-5 w-5 text-green-600" />
                        <span className="text-2xl font-bold text-green-700">
                            {totalPaid.toLocaleString()}
                        </span>
                        <span className="text-gray-500">/ ₹{loanAmount.toLocaleString()}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                            style={{ width: `${paidPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Remaining Balance */}
                {balance > 0 && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-yellow-800">Remaining Balance</span>
                        </div>
                        <span className="font-semibold text-yellow-900">₹{balance.toLocaleString()}</span>
                    </div>
                )}

                {/* Installment Progress */}
                {totalInstallments > 0 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-800">Installments</span>
                        </div>
                        <span className="font-semibold text-blue-900">
                            {paidInstallments} / {totalInstallments} paid
                        </span>
                    </div>
                )}

                {/* Recent Payments */}
                {repayments.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Payments</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {repayments.slice(0, 5).map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm">{formatDate(payment.createdAt)}</span>
                                    </div>
                                    <span className="font-medium text-green-600">+₹{payment.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* UPI ID Setup */}
                <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Your UPI ID for Payments</h4>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g., yourname@okicici"
                                value={upiId}
                                onChange={(e) => {
                                    setUpiId(e.target.value);
                                    setSaved(false);
                                }}
                                className={saved ? 'border-green-300 bg-green-50' : ''}
                            />
                            <Button
                                onClick={saveUpiId}
                                disabled={isSaving || (saved && upiId === existingUpiId)}
                                size="sm"
                                className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : saved ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}
                        {saved && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                UPI ID saved. Borrower can see this for payments.
                            </p>
                        )}
                        <p className="text-xs text-gray-500">
                            This UPI ID will be shown to the borrower when they want to make payments.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
