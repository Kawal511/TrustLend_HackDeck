// components/loans/PendingLoanActions.tsx - Approve/Reject buttons for pending loans

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2, AlertTriangle, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PendingLoanActionsProps {
    loanId: string;
    borrowerName: string;
    amount: number;
}

export function PendingLoanActions({ loanId, borrowerName, amount }: PendingLoanActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [interestRate, setInterestRate] = useState('0');

    const interestRateNum = parseFloat(interestRate) || 0;
    const interestAmount = (amount * interestRateNum) / 100;
    const totalWithInterest = amount + interestAmount;

    async function handleAction(action: 'approve' | 'reject') {
        setLoading(action);
        setMessage(null);

        try {
            const res = await fetch(`/api/loans/${loanId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    interestRate: action === 'approve' ? interestRateNum : undefined
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({
                    type: 'success',
                    text: data.message
                });
                // Refresh the page after 1.5 seconds
                setTimeout(() => {
                    router.refresh();
                }, 1500);
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'Action failed'
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Something went wrong. Please try again.'
            });
        } finally {
            setLoading(null);
        }
    }

    return (
        <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-yellow-100 rounded-full p-3">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-yellow-900">Pending Loan Request</h3>
                        <p className="text-yellow-800 mt-1">
                            <strong>{borrowerName}</strong> is requesting {formatCurrency(amount)} from you.
                        </p>

                        {/* Interest Rate Input */}
                        <div className="mt-4 p-4 bg-white rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-2 mb-3">
                                <Percent className="h-5 w-5 text-purple-600" />
                                <Label htmlFor="interestRate" className="font-medium text-gray-800">
                                    Set Interest Rate
                                </Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="interestRate"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                    className="w-32"
                                />
                                <span className="text-gray-600">%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Set 0 for interest-free loan
                            </p>

                            {/* Total Preview */}
                            <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Principal:</span>
                                    <span className="font-medium">{formatCurrency(amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Interest ({interestRateNum}%):</span>
                                    <span className="font-medium">{formatCurrency(interestAmount)}</span>
                                </div>
                                <div className="border-t border-purple-200 mt-2 pt-2 flex justify-between">
                                    <span className="text-gray-700 font-medium">Borrower Pays:</span>
                                    <span className="text-lg font-bold text-purple-700">
                                        {formatCurrency(totalWithInterest)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {message && (
                            <div className={`mt-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="flex gap-3 mt-4">
                            <Button
                                onClick={() => handleAction('approve')}
                                disabled={loading !== null}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {loading === 'approve' ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Approving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve with {interestRateNum}% Interest
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={() => handleAction('reject')}
                                disabled={loading !== null}
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                                {loading === 'reject' ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Rejecting...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
