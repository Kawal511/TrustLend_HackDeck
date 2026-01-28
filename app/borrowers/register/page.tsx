// app/borrowers/register/page.tsx - Borrower Registration with DigiLocker

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, CheckCircle, User } from 'lucide-react';

interface VerificationData {
    aadhaarNumber: string;
    maskedAadhaar: string;
    name: string;
    dob: string;
    gender: string;
    address: string;
    verifiedAt: string;
}

export default function BorrowerRegistrationPage() {
    const router = useRouter();

    const [step, setStep] = useState<'info' | 'verify' | 'complete'>('info');
    const [loading, setLoading] = useState(false);
    const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        address: ''
    });

    useEffect(() => {
        // Check if returning from DigiLocker
        const storedData = sessionStorage.getItem('digilocker_verification');
        const storedFormData = sessionStorage.getItem('borrower_form_data');

        if (storedData) {
            setVerificationData(JSON.parse(storedData));
            sessionStorage.removeItem('digilocker_verification');
            setStep('complete');
        }

        // Restore form data if available
        if (storedFormData) {
            setFormData(JSON.parse(storedFormData));
            sessionStorage.removeItem('borrower_form_data');
        }
    }, []);

    function handleDigiLockerAuth() {
        // Save form data before redirecting
        sessionStorage.setItem('borrower_form_data', JSON.stringify(formData));

        // Redirect to mock DigiLocker
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `/digilocker?return_url=${returnUrl}`;
    }

    async function handleCompleteRegistration() {
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/borrowers/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    aadhaarVerification: verificationData
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({
                    type: 'success',
                    text: `Registration Successful! Your initial trust score: ${data.trustScore}`
                });

                // Redirect to dashboard
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'Registration failed'
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Registration failed. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    }

    const stepClasses = (index: number) => {
        const currentIndex = step === 'info' ? 0 : step === 'verify' ? 1 : 2;
        if (index <= currentIndex) {
            return 'border-purple-600 bg-purple-600 text-white';
        }
        return 'border-gray-300 bg-white text-gray-400';
    };

    const stepTextClasses = (index: number) => {
        const currentIndex = step === 'info' ? 0 : step === 'verify' ? 1 : 2;
        if (index <= currentIndex) {
            return 'text-purple-600 font-medium';
        }
        return 'text-gray-500';
    };

    const lineClasses = (index: number) => {
        const currentIndex = step === 'info' ? 0 : step === 'verify' ? 1 : 2;
        if (index < currentIndex) {
            return 'bg-purple-600';
        }
        return 'bg-gray-300';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {['Basic Info', 'Aadhaar Verification', 'Complete'].map((label, index) => (
                            <div key={label} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${stepClasses(index)}`}>
                                    {index + 1}
                                </div>
                                <span className={`ml-2 text-sm hidden sm:inline ${stepTextClasses(index)}`}>
                                    {label}
                                </span>
                                {index < 2 && (
                                    <div className={`w-12 sm:w-24 h-0.5 mx-2 sm:mx-4 ${lineClasses(index)}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-6 w-6 text-purple-600" />
                            Borrower Registration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {message && (
                            <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                {message.text}
                            </div>
                        )}

                        {step === 'info' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>First Name</Label>
                                        <Input
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            placeholder="Rahul"
                                        />
                                    </div>
                                    <div>
                                        <Label>Last Name</Label>
                                        <Input
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            placeholder="Sharma"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Email Address</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="rahul.sharma@example.com"
                                    />
                                </div>

                                <div>
                                    <Label>Phone Number</Label>
                                    <Input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div>
                                    <Label>Date of Birth</Label>
                                    <Input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label>Address</Label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="House No., Street, City - Pincode"
                                    />
                                </div>

                                <Button
                                    onClick={() => setStep('verify')}
                                    disabled={!formData.firstName || !formData.email || !formData.phoneNumber}
                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                >
                                    Continue to Verification
                                </Button>
                            </div>
                        )}

                        {step === 'verify' && (
                            <div className="space-y-6">
                                <div className="text-center py-6">
                                    <div className="flex justify-center mb-4">
                                        <div className="bg-purple-100 rounded-full p-6">
                                            <Shield className="h-12 w-12 text-purple-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Verify Your Identity</h3>
                                    <p className="text-gray-600">
                                        Complete Aadhaar verification to register as a borrower on TrustLend
                                    </p>
                                </div>

                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                                    <h4 className="font-medium text-purple-900">Why Aadhaar Verification?</h4>
                                    <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                                        <li>Establishes your identity on the platform</li>
                                        <li>Increases your initial trust score to 50</li>
                                        <li>Enables you to borrow from trusted lenders</li>
                                        <li>100% secure through DigiLocker</li>
                                    </ul>
                                </div>

                                <Button
                                    onClick={handleDigiLockerAuth}
                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                    size="lg"
                                >
                                    <Shield className="h-5 w-5 mr-2" />
                                    Verify with DigiLocker
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => setStep('info')}
                                    className="w-full"
                                >
                                    Back to Basic Info
                                </Button>
                            </div>
                        )}

                        {step === 'complete' && verificationData && (
                            <div className="space-y-6">
                                <div className="text-center py-6">
                                    <div className="flex justify-center mb-4">
                                        <div className="bg-green-100 rounded-full p-6">
                                            <CheckCircle className="h-12 w-12 text-green-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Verification Successful!</h3>
                                    <p className="text-gray-600">
                                        Your Aadhaar has been verified successfully
                                    </p>
                                </div>

                                <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
                                    <h4 className="font-semibold">Verified Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Name:</span>
                                            <span className="font-medium">{verificationData.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Aadhaar:</span>
                                            <span className="font-medium">{verificationData.maskedAadhaar}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">DOB:</span>
                                            <span className="font-medium">{verificationData.dob}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Gender:</span>
                                            <span className="font-medium">{verificationData.gender}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="font-medium text-green-900">Initial Trust Score: 50</p>
                                            <p className="text-sm text-green-700">
                                                Your Aadhaar verification has earned you an initial trust score of 50 points. Complete income and collateral verification to unlock higher borrowing limits.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCompleteRegistration}
                                    disabled={loading}
                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                    size="lg"
                                >
                                    {loading ? 'Registering...' : 'Complete Registration'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
