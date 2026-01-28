'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Installment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  paidAmount?: number;
  status: string;
}

interface InstallmentManagerProps {
  loanId: string;
  loanAmount: number;
  hasInstallments: boolean;
  isLender?: boolean;
}

export default function InstallmentManager({
  loanId,
  loanAmount,
  hasInstallments: initialHasInstallments,
  isLender = false,
}: InstallmentManagerProps) {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [hasInstallments, setHasInstallments] = useState(initialHasInstallments);
  const [numberOfInstallments, setNumberOfInstallments] = useState(3);
  const [isCreating, setIsCreating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<string | null>(
    null
  );
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    if (hasInstallments) {
      fetchInstallments();
    }
  }, [hasInstallments, loanId]);

  const fetchInstallments = async () => {
    try {
      const res = await fetch(`/api/loans/${loanId}/installments`);
      if (res.ok) {
        const data = await res.json();
        setInstallments(data);
      }
    } catch (error) {
      console.error('Error fetching installments:', error);
    }
  };

  const createInstallments = async () => {
    setIsCreating(true);
    try {
      const res = await fetch(`/api/loans/${loanId}/installments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numberOfInstallments }),
      });

      if (res.ok) {
        setHasInstallments(true);
        fetchInstallments();
      }
    } catch (error) {
      console.error('Error creating installments:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const payInstallment = async (installmentId: string, amount: number) => {
    setIsPaying(true);
    try {
      const res = await fetch(
        `/api/loans/${loanId}/installments/${installmentId}/pay`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount }),
        }
      );

      if (res.ok) {
        fetchInstallments();
        setSelectedInstallment(null);
        setPaymentAmount('');
      }
    } catch (error) {
      console.error('Error paying installment:', error);
    } finally {
      setIsPaying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'PENDING':
        return <Badge variant="outline">Pending</Badge>;
      case 'OVERDUE':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!hasInstallments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Split into Installments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Number of Installments</Label>
              <Input
                type="number"
                min={2}
                max={12}
                value={numberOfInstallments}
                onChange={(e) => setNumberOfInstallments(parseInt(e.target.value))}
              />
              <p className="text-sm text-gray-500 mt-1">
                ₹{(loanAmount / numberOfInstallments).toFixed(2)} per installment
              </p>
            </div>
            <Button onClick={createInstallments} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Installments'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {installments.map((installment) => (
            <div
              key={installment.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div>
                  {installment.status === 'PAID' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : installment.status === 'OVERDUE' ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    Installment {installment.installmentNumber}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due: {new Date(installment.dueDate).toLocaleDateString()}
                  </div>
                  {installment.paidDate && (
                    <div className="text-sm text-green-600">
                      Paid: {new Date(installment.paidDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-semibold">₹{installment.amount.toFixed(2)}</div>
                  {getStatusBadge(installment.status)}
                </div>
                {installment.status !== 'PAID' && !isLender && (
                  <Dialog
                    open={selectedInstallment === installment.id}
                    onOpenChange={(open) =>
                      setSelectedInstallment(open ? installment.id : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">Pay</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Pay Installment {installment.installmentNumber}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Amount Due</Label>
                          <div className="text-2xl font-bold">
                            ₹{installment.amount.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <Label>Payment Amount</Label>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                          />
                        </div>
                        <Button
                          onClick={() =>
                            payInstallment(installment.id, parseFloat(paymentAmount))
                          }
                          disabled={isPaying || !paymentAmount}
                          className="w-full"
                        >
                          {isPaying ? 'Processing...' : 'Confirm Payment'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
