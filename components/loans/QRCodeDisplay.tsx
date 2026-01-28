'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Download, ExternalLink, Smartphone, RefreshCw, Calendar } from 'lucide-react';
import QRCode from 'qrcode';

interface Installment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date | string;
  status: string;
}

interface QRCodeDisplayProps {
  loanId: string;
  amount: number;
  payeeName: string;
  existingQRCode?: string | null;
  installments?: Installment[];
}

export default function QRCodeDisplay({
  loanId,
  amount = 0,
  payeeName = 'Lender',
  existingQRCode,
  installments = [],
}: QRCodeDisplayProps) {
  const [upiId, setUpiId] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(existingQRCode || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

  // Get pending installments (not paid yet)
  const pendingInstallments = installments.filter(
    inst => inst.status === 'PENDING' || inst.status === 'OVERDUE'
  );

  // Determine the payment amount based on selection
  const paymentAmount = selectedInstallment ? selectedInstallment.amount : amount;
  const paymentNote = selectedInstallment
    ? `Installment ${selectedInstallment.installmentNumber} - ${loanId.slice(0, 8)}`
    : `Loan repayment - ${loanId.slice(0, 8)}`;

  // Generate UPI deep link string (this is what UPI apps scan)
  const generateUpiString = (upiAddress: string) => {
    const params = new URLSearchParams({
      pa: upiAddress,
      pn: payeeName,
      am: paymentAmount.toString(),
      cu: 'INR',
      tn: paymentNote
    });
    return `upi://pay?${params.toString()}`;
  };

  // Generate QR code from UPI string
  const generateQRCode = async () => {
    if (!upiId.trim()) {
      setError('Please enter a valid UPI ID');
      return;
    }

    if (!upiId.includes('@')) {
      setError('UPI ID must contain @ (e.g., name@upi)');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const upiString = generateUpiString(upiId.trim());

      const dataUrl = await QRCode.toDataURL(upiString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `upi-payment-${loanId.slice(0, 8)}.png`;
    link.click();
  };

  const openInUpiApp = () => {
    if (!upiId) return;
    const upiString = generateUpiString(upiId);
    window.location.href = upiString;
  };

  const resetQRCode = () => {
    setQrCodeDataUrl(null);
    setError(null);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Show input form
  if (!qrCodeDataUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            UPI Payment QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <Smartphone className="h-4 w-4 inline mr-1" />
                Enter the lender&apos;s UPI ID to generate a scannable payment QR code.
              </p>
            </div>

            {/* Installment Selection */}
            {pendingInstallments.length > 0 && (
              <div className="space-y-2">
                <Label>Select Payment</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {/* Full amount option */}
                  <button
                    onClick={() => setSelectedInstallment(null)}
                    className={`w-full p-3 rounded-lg border text-left transition ${selectedInstallment === null
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Full Loan Amount</span>
                      <span className="text-purple-600 font-semibold">₹{amount.toLocaleString()}</span>
                    </div>
                  </button>

                  {/* Installment options */}
                  {pendingInstallments.map((inst) => (
                    <button
                      key={inst.id}
                      onClick={() => setSelectedInstallment(inst)}
                      className={`w-full p-3 rounded-lg border text-left transition ${selectedInstallment?.id === inst.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">Installment {inst.installmentNumber}</span>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            Due: {formatDate(inst.dueDate)}
                          </p>
                        </div>
                        <span className={`font-semibold ${inst.status === 'OVERDUE' ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{inst.amount.toLocaleString()}
                        </span>
                      </div>
                      {inst.status === 'OVERDUE' && (
                        <span className="text-xs text-red-600 mt-1">⚠️ Overdue</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="upi-input">Payee UPI ID</Label>
              <Input
                id="upi-input"
                placeholder="e.g., name@okicici, phone@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateQRCode()}
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <p><strong>Payee:</strong> {payeeName}</p>
              <p className="text-lg font-semibold text-purple-600">
                <strong>Amount:</strong> ₹{paymentAmount.toLocaleString()}
              </p>
              {selectedInstallment && (
                <p className="text-xs text-gray-500">
                  Installment {selectedInstallment.installmentNumber} of {installments.length}
                </p>
              )}
            </div>

            <Button
              onClick={generateQRCode}
              disabled={isGenerating || !upiId.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate UPI QR Code
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show generated QR code
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          UPI Payment QR Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          {/* QR Code Display */}
          <div className="inline-block p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
            <img
              src={qrCodeDataUrl}
              alt="UPI Payment QR Code"
              className="w-64 h-64"
            />
          </div>

          {/* Payment Details */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>UPI ID:</strong> {upiId}
            </p>
            <p className="text-lg font-bold text-green-700 mt-1">
              Amount: ₹{paymentAmount.toLocaleString()}
            </p>
            {selectedInstallment && (
              <p className="text-xs text-green-600 mt-1">
                Installment {selectedInstallment.installmentNumber} | Due: {formatDate(selectedInstallment.dueDate)}
              </p>
            )}
          </div>

          <p className="text-sm text-gray-500">
            Scan with any UPI app (GPay, PhonePe, Paytm, BHIM, etc.)
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={downloadQRCode} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={openInUpiApp} variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in UPI App
            </Button>
            <Button onClick={resetQRCode} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Change Payment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
