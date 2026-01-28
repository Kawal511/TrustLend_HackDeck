'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';

interface Bill {
  id: string;
  billNumber: string;
  generatedAt: string;
  total: number;
  status: string;
  pdfUrl?: string;
}

interface BillGeneratorProps {
  loanId: string;
}

export default function BillGenerator({ loanId }: BillGeneratorProps) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, [loanId]);

  const fetchBills = async () => {
    try {
      const res = await fetch(`/api/loans/${loanId}/bills`);
      if (res.ok) {
        const data = await res.json();
        setBills(data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBill = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/loans/${loanId}/bills`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        fetchBills();
        
        // Auto-download the PDF
        if (data.bill.pdfUrl) {
          downloadBill(data.bill.pdfUrl, data.bill.billNumber);
        }
      }
    } catch (error) {
      console.error('Error generating bill:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBill = (pdfUrl: string, billNumber: string) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${billNumber}.pdf`;
    link.click();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bills & Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">Loading bills...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bills & Invoices</span>
          <Button onClick={generateBill} disabled={isGenerating} size="sm">
            <FileText className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate New Bill'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 mb-4">No bills generated yet</p>
            <p className="text-sm text-gray-400">
              Generate a bill to create a detailed invoice for this loan
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{bill.billNumber}</div>
                    <div className="text-sm text-gray-500">
                      Generated on{' '}
                      {new Date(bill.generatedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold">₹{bill.total.toFixed(2)}</div>
                    <Badge variant="outline">{bill.status}</Badge>
                  </div>
                  {bill.pdfUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadBill(bill.pdfUrl!, bill.billNumber)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
