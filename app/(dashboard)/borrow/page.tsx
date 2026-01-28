// app/(dashboard)/borrow/page.tsx - Request a Loan Page for Verified Borrowers

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrustBadge } from '@/components/trust/TrustBadge';
import { Shield, AlertCircle, CheckCircle, HandCoins, Clock, XCircle, CheckCircle2 } from 'lucide-react';
import { BorrowRequestForm } from '@/components/borrow/BorrowRequestForm';
import { formatCurrency } from '@/lib/utils';

export default async function BorrowPage() {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    // Get user with verification status
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            verification: true
        }
    });

    // Get user's pending/recent loan requests (as borrower)
    const myLoanRequests = await prisma.loan.findMany({
        where: {
            borrowerId: userId,
            status: { in: ['PENDING', 'ACTIVE', 'REJECTED'] }
        },
        include: {
            lender: {
                select: { firstName: true, lastName: true, trustScore: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    // Get potential lenders (users with loans given or high trust scores)
    const lenders = await prisma.user.findMany({
        where: {
            id: { not: userId },
            trustScore: { gte: 50 }
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            trustScore: true,
            _count: {
                select: { loansGiven: true }
            }
        },
        orderBy: { trustScore: 'desc' },
        take: 10
    });

    // Check if user is verified
    const isVerified = user?.isIdVerified || false;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'ACTIVE':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'REJECTED':
                return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Request a Loan</h1>
                <p className="text-gray-500 mt-1">Apply for a loan from trusted lenders in the network</p>
            </div>

            {/* Verification Status */}
            {!isVerified ? (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-yellow-100 rounded-full p-3">
                                <AlertCircle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-yellow-900">Verification Required</h3>
                                <p className="text-yellow-800 mt-1">
                                    You need to complete Aadhaar verification to request loans from lenders.
                                    Verification helps establish trust and unlocks borrowing features.
                                </p>
                                <div className="mt-4">
                                    <Link href="/borrowers/register">
                                        <Button className="bg-yellow-600 hover:bg-yellow-700">
                                            <Shield className="h-4 w-4 mr-2" />
                                            Complete Verification
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Verified Status Banner */}
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div className="flex-1">
                                    <span className="font-medium text-green-900">
                                        You are verified and can request loans
                                    </span>
                                    <span className="text-sm text-green-700 ml-2">
                                        Trust Score: {user?.trustScore}
                                    </span>
                                </div>
                                <TrustBadge score={user?.trustScore || 0} size="sm" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Loan Request Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <HandCoins className="h-5 w-5 text-purple-600" />
                                        Create Loan Request
                                    </CardTitle>
                                    <CardDescription>
                                        Fill in the details for your loan request. Lenders will be notified.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <BorrowRequestForm userId={userId} lenders={lenders} />
                                </CardContent>
                            </Card>

                            {/* My Loan Requests Status Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-purple-600" />
                                        My Loan Requests
                                    </CardTitle>
                                    <CardDescription>
                                        Track the status of your loan applications
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {myLoanRequests.length > 0 ? (
                                        <div className="space-y-4">
                                            {myLoanRequests.map((request) => (
                                                <div
                                                    key={request.id}
                                                    className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="font-semibold text-lg">
                                                                {formatCurrency(request.amount)}
                                                            </span>
                                                            {getStatusBadge(request.status)}
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            {request.purpose || 'General purpose'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            To: {request.lender.firstName} {request.lender.lastName}
                                                            <span className="mx-1">•</span>
                                                            Due: {new Date(request.dueDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(request.createdAt).toLocaleDateString()}
                                                        </p>
                                                        {request.status === 'ACTIVE' && (
                                                            <Link href={`/loans/${request.id}`}>
                                                                <Button size="sm" variant="outline" className="mt-2">
                                                                    View Loan
                                                                </Button>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Clock className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                                            <p>No loan requests yet</p>
                                            <p className="text-sm">Submit a request above to get started</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Available Lenders */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Available Lenders</CardTitle>
                                    <CardDescription>Trusted lenders in the network</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {lenders.length > 0 ? (
                                        lenders.slice(0, 5).map((lender) => (
                                            <div key={lender.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {lender.firstName} {lender.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {lender._count.loansGiven} loans given
                                                    </p>
                                                </div>
                                                <TrustBadge score={lender.trustScore} size="sm" />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No lenders available yet</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                                <CardContent className="p-4">
                                    <h4 className="font-semibold mb-2">💡 Tips for Borrowers</h4>
                                    <ul className="text-sm space-y-1 text-white/90">
                                        <li>• Be clear about your loan purpose</li>
                                        <li>• Set realistic repayment dates</li>
                                        <li>• Higher trust scores get better rates</li>
                                        <li>• Timely repayments boost your score</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
