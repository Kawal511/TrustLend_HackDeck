'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { IdCard, Send } from 'lucide-react';

export function IdentityVerification({ onSuccess }: { onSuccess: () => void }) {
  const [idType, setIdType] = useState('AADHAAR');
  const [idNumber, setIdNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [mockOtp, setMockOtp] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmitId() {
    setLoading(true);
    try {
      const res = await fetch('/api/verification/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idType, idNumber })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('ID Submitted', { description: data.message });
      } else {
        toast.error('Error', { description: data.error });
      }
    } catch (error) {
      toast.error('Error', { description: 'Failed to submit ID' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    setLoading(true);
    try {
      const res = await fetch('/api/verification/identity/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send' })
      });

      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
        setMockOtp(data.mockOtp);
        toast.success('OTP Sent', { description: data.message });
      } else {
        toast.error('Error', { description: data.error });
      }
    } catch (error) {
      toast.error('Error', { description: 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setLoading(true);
    try {
      const res = await fetch('/api/verification/identity/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', otp })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Verified!', { description: data.message });
        onSuccess();
      } else {
        toast.error('Error', { description: data.error });
      }
    } catch (error) {
      toast.error('Error', { description: 'Failed to verify OTP' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IdCard className="h-5 w-5" />
          Identity Verification (Aadhaar-like)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>ID Type</Label>
          <Select value={idType} onValueChange={setIdType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AADHAAR">Aadhaar Card (12 digits)</SelectItem>
              <SelectItem value="PAN">PAN Card (10 characters)</SelectItem>
              <SelectItem value="PASSPORT">Passport (8 characters)</SelectItem>
              <SelectItem value="DRIVERS_LICENSE">Driver's License</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>ID Number</Label>
          <Input
            value={idNumber}
            onChange={e => setIdNumber(e.target.value)}
            placeholder={
              idType === 'AADHAAR'
                ? '123456789012'
                : idType === 'PAN'
                  ? 'ABCDE1234F'
                  : 'Enter ID number'
            }
          />
        </div>

        <div>
          <Label>Upload ID Document</Label>
          <Input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              setLoading(true);
              const formData = new FormData();
              formData.append('file', file);
              formData.append('idType', idType);

              try {
                const res = await fetch('/api/verification/identity/upload', {
                  method: 'POST',
                  body: formData
                });
                const data = await res.json();
                if (res.ok) {
                  toast.success('ID Uploaded', { description: 'Data extracted successfully' });
                  // If OCR extracted ID Number, auto-fill it
                  if (data.extractedData?.aadhaarNumber) setIdNumber(data.extractedData.aadhaarNumber.replace(/\s/g, ''));
                  if (data.extractedData?.panNumber) setIdNumber(data.extractedData.panNumber);

                  // Show extracted info toast/alert
                  toast.info("Extracted Data", {
                    description: `Name: ${data.extractedData?.name || 'N/A'}, Address: ${data.extractedData?.address || 'N/A'}`
                  });
                }
              } catch (err) {
                toast.error("Upload Failed");
              } finally {
                setLoading(false);
              }
            }}
          />
          <p className="text-xs text-gray-500 mt-1">Upload front side of your ID card for auto-extraction.</p>
        </div>

        <Button onClick={handleSubmitId} disabled={loading || !idNumber} className="w-full">
          Submit ID Details
        </Button>

        {idNumber && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">OTP Verification</h4>

            {!otpSent ? (
              <Button onClick={handleSendOtp} disabled={loading} variant="outline" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send OTP to Registered Mobile
              </Button>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label>Enter OTP</Label>
                  <Input
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    maxLength={6}
                  />
                  {mockOtp && (
                    <p className="text-xs text-blue-600 mt-1">
                      Demo OTP: {mockOtp}
                    </p>
                  )}
                </div>
                <Button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6} className="w-full">
                  Verify OTP
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
