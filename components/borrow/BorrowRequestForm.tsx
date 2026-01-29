// components/borrow/BorrowRequestForm.tsx - Form for submitting loan requests

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface Lender {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    trustScore: number;
    _count: { loansGiven: number };
}

interface BorrowRequestFormProps {
    userId: string;
    lenders: Lender[];
}

export function BorrowRequestForm({ userId, lenders }: BorrowRequestFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        amount: '',
        purpose: '',
        description: '',
        lenderId: '',
        dueDate: '',
        urgency: 'normal'
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/borrow/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    borrowerId: userId
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({
                    type: 'success',
                    text: 'Loan request submitted successfully! The lender will be notified.'
                });

                // Reset form
                setFormData({
                    amount: '',
                    purpose: '',
                    description: '',
                    lenderId: '',
                    dueDate: '',
                    urgency: 'normal'
                });

                // Redirect after 2 seconds
                setTimeout(() => {
                    router.push('/loans');
                }, 2000);
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'Failed to submit request'
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Something went wrong. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    }

    // Calculate default due date (30 days from now)
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    const minDate = new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-900 border border-green-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="amount">Loan Amount (₹)</Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="10000"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        min="100"
                        max="500000"
                        className="h-12 text-lg"
                    />
                </div>

                <div>
                    <Label htmlFor="dueDate">Repayment Date</Label>
                    <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                        min={minDate}
                        className="h-12"
                    />
                </div>
            </div>

            {/* Interest Rate Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-bold text-sm">%</span>
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">About Interest Rates</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Interest rates will be decided by the lender upon approval.
                            You can negotiate the rate before accepting the loan offer.
                            The final amount will be shown when the lender approves your request.
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <Label htmlFor="lender">Select Lender (Optional)</Label>
                <Select
                    value={formData.lenderId}
                    onValueChange={(value) => setFormData({ ...formData, lenderId: value })}
                >
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder="Any available lender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="any">Any available lender</SelectItem>
                        {lenders.map((lender) => (
                            <SelectItem key={lender.id} value={lender.id}>
                                {lender.firstName} {lender.lastName} (Score: {lender.trustScore})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                    Leave as &quot;Any available lender&quot; to broadcast to all lenders
                </p>
            </div>

            <div>
                <Label htmlFor="purpose">Loan Purpose</Label>
                <Select
                    value={formData.purpose}
                    onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                    required
                >
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="medical">Medical Emergency</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="home">Home Improvement</SelectItem>
                        <SelectItem value="vehicle">Vehicle</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="urgency">Urgency</Label>
                <Select
                    value={formData.urgency}
                    onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                >
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="low">Low - Can wait</SelectItem>
                        <SelectItem value="normal">Normal - Within a week</SelectItem>
                        <SelectItem value="high">High - As soon as possible</SelectItem>
                        <SelectItem value="urgent">Urgent - Emergency</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="description">Additional Details</Label>
                <Textarea
                    id="description"
                    placeholder="Describe why you need this loan and how you plan to repay it..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="resize-none"
                />
            </div>

            <Button
                type="submit"
                disabled={loading || !formData.amount || !formData.purpose || !formData.dueDate}
                className="w-full h-12 text-lg bg-black text-white hover:bg-black/90 hover:scale-[1.01] transition-all rounded-xl shadow-lg"
                size="lg"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Loan Request
                    </>
                )}
            </Button>
        </form>
    );
}
