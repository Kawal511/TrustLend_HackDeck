'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, ExternalLink, Smartphone, RefreshCw, Calendar, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';

interface Installment {
    id: string;
    installmentNumber: number;
    amount: number;
    dueDate: Date | string;
    status: string;
}

interface BorrowerPaymentQRProps {
    loanId: string;
    loanAmount: number;
    payeeName: string;
    payeeUpiId?: string | null;
    installments?: Installment[];
}

export default function BorrowerPaymentQR({
    loanId,
    loanAmount,
    payeeName,
    payeeUpiId,
    installments = [],
}: BorrowerPaymentQRProps) {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

    // Get pending installments
    const pendingInstallments = installments.filter(
        inst => inst.status === 'PENDING' || inst.status === 'OVERDUE'
    );

    // Payment amount based on selection
    const paymentAmount = selectedInstallment ? selectedInstallment.amount : loanAmount;
    const paymentNote = selectedInstallment
        ? `Installment ${selectedInstallment.installmentNumber} - ${loanId.slice(0, 8)}`
        : `Loan repayment - ${loanId.slice(0, 8)}`;

    // Generate UPI deep link
    const generateUpiString = () => {
        if (!payeeUpiId) return '';
        const params = new URLSearchParams({
            pa: payeeUpiId,
            pn: payeeName,
            am: paymentAmount.toString(),
            cu: 'INR',
            tn: paymentNote
        });
        return `upi://pay?${params.toString()}`;
    };

    // Generate QR code
    const generateQRCode = async () => {
        if (!payeeUpiId) return;

        setIsGenerating(true);
        try {
            const upiString = generateUpiString();
            const dataUrl = await QRCode.toDataURL(upiString, {
                width: 300,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' },
                errorCorrectionLevel: 'M'
            });
            setQrCodeDataUrl(dataUrl);
        } catch (err) {
            console.error('Error generating QR code:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadQRCode = () => {
        if (!qrCodeDataUrl) return;
        const link = document.createElement('a');
        link.href = qrCodeDataUrl;
        link.download = `payment-${loanId.slice(0, 8)}.png`;
        link.click();
    };

    const openInUpiApp = () => {
        if (!payeeUpiId) return;
        window.location.href = generateUpiString();
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // No UPI ID set by lender
    if (!payeeUpiId) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        Payment QR Code
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
                        <p className="text-gray-700 font-medium">Payment Setup Pending</p>
                        <p className="text-sm text-gray-500 mt-1">
                            The lender hasn&apos;t set up their UPI ID yet.
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Once they add their UPI ID, you&apos;ll see a scannable QR code here.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show QR code selection/generation
    if (!qrCodeDataUrl) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        Pay via UPI
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <Smartphone className="h-4 w-4 inline mr-1" />
                            Generate a QR code to pay {payeeName}
                        </p>
                    </div>

                    {/* Payment Selection */}
                    {pendingInstallments.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Select Payment</label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {/* Full amount */}
                                <button
                                    onClick={() => setSelectedInstallment(null)}
                                    className={`w-full p-3 rounded-lg border text-left transition ${!selectedInstallment
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Full Amount</span>
                                        <span className="text-purple-600 font-semibold">₹{loanAmount.toLocaleString()}</span>
                                    </div>
                                </button>

                                {/* Installments */}
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
                                            <span className="text-xs text-red-600">⚠️ Overdue</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payment Summary */}
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <p><strong>Pay to:</strong> {payeeName}</p>
                        <p><strong>UPI ID:</strong> {payeeUpiId}</p>
                        <p className="text-lg font-bold text-purple-600 mt-2">
                            Amount: ₹{paymentAmount.toLocaleString()}
                        </p>
                    </div>

                    <Button onClick={generateQRCode} className="w-full" disabled={isGenerating}>
                        {isGenerating ? (
                            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Generating...</>
                        ) : (
                            <><QrCode className="h-4 w-4 mr-2" />Generate Payment QR</>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Show generated QR
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Scan to Pay
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-4">
                    <div className="inline-block p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                        <img src={qrCodeDataUrl} alt="Payment QR" className="w-64 h-64" />
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800"><strong>Pay to:</strong> {payeeName}</p>
                        <p className="text-sm text-green-700"><strong>UPI:</strong> {payeeUpiId}</p>
                        <p className="text-lg font-bold text-green-700 mt-1">₹{paymentAmount.toLocaleString()}</p>
                        {selectedInstallment && (
                            <p className="text-xs text-green-600">Installment {selectedInstallment.installmentNumber}</p>
                        )}
                    </div>

                    <p className="text-sm text-gray-500">Scan with GPay, PhonePe, Paytm, BHIM, etc.</p>

                    <div className="flex flex-wrap gap-2 justify-center">
                        <Button onClick={downloadQRCode} variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />Download
                        </Button>
                        <Button onClick={openInUpiApp} variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />Open UPI App
                        </Button>
                        <Button onClick={() => setQrCodeDataUrl(null)} variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />Change
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
