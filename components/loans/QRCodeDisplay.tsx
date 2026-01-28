'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download } from 'lucide-react';

interface QRCodeDisplayProps {
  loanId: string;
  existingQRCode?: string | null;
}

export default function QRCodeDisplay({
  loanId,
  existingQRCode,
}: QRCodeDisplayProps) {
  const [qrCode, setQrCode] = useState(existingQRCode);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/loans/${loanId}/qrcode`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setQrCode(data.qrCode);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `loan-${loanId}-qrcode.png`;
    link.click();
  };

  if (!qrCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">
              Generate a QR code for easy loan payment
            </p>
            <Button onClick={generateQRCode} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-lg border">
            <img src={qrCode} alt="Loan QR Code" className="w-64 h-64" />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Scan this QR code to view loan details and make payment
          </p>
          <Button onClick={downloadQRCode} className="mt-4" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
