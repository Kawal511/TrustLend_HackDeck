// app/digilocker/page.tsx - Mock DigiLocker Authentication

'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, CheckCircle } from 'lucide-react';

export default function MockDigiLockerPage() {
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('return_url') || '/borrowers/register';

    const [step, setStep] = useState<'auth' | 'consent' | 'success'>('auth');
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [mockOtp, setMockOtp] = useState('');

    const [userData, setUserData] = useState({
        name: '',
        dob: '',
        gender: '',
        address: ''
    });

    async function handleSendOtp() {
        if (aadhaarNumber.length !== 12) {
            alert('Please enter a valid 12-digit Aadhaar number');
            return;
        }

        setLoading(true);

        // Simulate OTP generation
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setMockOtp(generatedOtp);

        // Simulate API delay
        setTimeout(() => {
            setLoading(false);
            alert(`Mock OTP sent: ${generatedOtp}\n\n(In production, this would be sent to registered mobile)`);
        }, 1000);
    }

    async function handleVerifyOtp() {
        if (otp !== mockOtp) {
            alert('Invalid OTP. Please try again.');
            return;
        }

        setLoading(true);

        // Simulate fetching Aadhaar data
        setTimeout(() => {
            setUserData({
                name: 'RAJESH KUMAR',
                dob: '15/06/1992',
                gender: 'Male',
                address: 'House No. 45, Sector 12, Mumbai - 400001, Maharashtra'
            });
            setStep('consent');
            setLoading(false);
        }, 1500);
    }

    async function handleConsent() {
        setLoading(true);

        try {
            // Create verification session token
            const verificationData = {
                aadhaarNumber: aadhaarNumber,
                maskedAadhaar: `XXXX XXXX ${aadhaarNumber.slice(-4)}`,
                name: userData.name,
                dob: userData.dob,
                gender: userData.gender,
                address: userData.address,
                verifiedAt: new Date().toISOString()
            };

            // Store in sessionStorage for retrieval on next page
            sessionStorage.setItem('digilocker_verification', JSON.stringify(verificationData));

            setStep('success');

            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = returnUrl;
            }, 2000);
        } catch (error) {
            alert('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                {/* DigiLocker Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-8 w-8" />
                        <div>
                            <h1 className="text-2xl font-bold">DigiLocker</h1>
                            <p className="text-sm opacity-90">Digital India Initiative</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-sm">
                        <Lock className="h-4 w-4" />
                        <span>Secure Authentication</span>
                    </div>
                </div>

                <CardContent className="p-6">
                    {step === 'auth' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>TrustLend</strong> is requesting access to your Aadhaar details for verification purposes.
                                </p>
                            </div>

                            <div>
                                <Label>Aadhaar Number</Label>
                                <Input
                                    type="text"
                                    maxLength={12}
                                    placeholder="Enter 12-digit Aadhaar"
                                    value={aadhaarNumber}
                                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                                    className="text-lg tracking-wider"
                                />
                            </div>

                            {!mockOtp ? (
                                <Button
                                    onClick={handleSendOtp}
                                    disabled={loading || aadhaarNumber.length !== 12}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <Label>Enter OTP</Label>
                                        <Input
                                            type="text"
                                            maxLength={6}
                                            placeholder="6-digit OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="text-lg tracking-wider text-center"
                                        />
                                        <p className="text-xs text-green-600 mt-1">
                                            Demo OTP: <strong>{mockOtp}</strong>
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleVerifyOtp}
                                        disabled={loading || otp.length !== 6}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        {loading ? 'Verifying...' : 'Verify OTP'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'consent' && (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-green-800 mb-2">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-semibold">Authentication Successful</span>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 space-y-3">
                                <h3 className="font-semibold mb-2">Aadhaar Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium">{userData.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Aadhaar:</span>
                                        <span className="font-medium">XXXX XXXX {aadhaarNumber.slice(-4)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">DOB:</span>
                                        <span className="font-medium">{userData.dob}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Gender:</span>
                                        <span className="font-medium">{userData.gender}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Address:</span>
                                        <span className="font-medium text-right max-w-[200px]">{userData.address}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Consent:</strong> By clicking &quot;Allow Access&quot;, you authorize TrustLend to access your Aadhaar details for verification purposes only.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setStep('auth');
                                        setOtp('');
                                        setMockOtp('');
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConsent}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    {loading ? 'Processing...' : 'Allow Access'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8 space-y-4">
                            <div className="flex justify-center">
                                <div className="bg-green-100 rounded-full p-4">
                                    <CheckCircle className="h-12 w-12 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold">Verification Successful!</h3>
                            <p className="text-gray-600">
                                Redirecting you back to TrustLend...
                            </p>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    )}
                </CardContent>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t">
                    <p className="text-xs text-center text-gray-600">
                        🔒 This is a mock DigiLocker page for demo purposes
                    </p>
                </div>
            </Card>
        </div>
    );
}
