// components/loans/PendingLoanActions.tsx - Approve/Reject buttons for pending loans

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';

interface PendingLoanActionsProps {
    loanId: string;
    borrowerName: string;
    amount: number;
}

export function PendingLoanActions({ loanId, borrowerName, amount }: PendingLoanActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function handleAction(action: 'approve' | 'reject') {
        setLoading(action);
        setMessage(null);

        try {
            const res = await fetch(`/api/loans/${loanId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
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
                            <strong>{borrowerName}</strong> is requesting ₹{amount.toLocaleString()} from you.
                            Review the details and take action below.
                        </p>

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
                                        Approve Loan
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
