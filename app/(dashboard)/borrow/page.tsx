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
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'ACTIVE':
                return <Badge className="bg-black text-white hover:bg-black/90"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'REJECTED':
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200" variant="outline"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Request a Loan</h1>
                <p className="text-muted-foreground mt-1">Apply for a loan from trusted lenders in the network</p>
            </div>

            {/* Verification Status */}
            {!isVerified ? (
                <Card className="bg-white border-2 border-dashed border-gray-300">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-gray-100 rounded-full p-3">
                                <AlertCircle className="h-6 w-6 text-gray-900" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold">Verification Required</h3>
                                <p className="text-gray-500 mt-1">
                                    You need to complete Aadhaar verification to request loans from lenders.
                                    Verification helps establish trust and unlocks borrowing features.
                                </p>
                                <div className="mt-4">
                                    <Link href="/borrowers/register">
                                        <Button className="bg-black text-white hover:opacity-80">
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
                    <Card className="bg-[#f0f0f0] border-2 border-black rounded-xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-black text-white rounded-full p-1">
                                    <CheckCircle className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <span className="font-bold">
                                        You are verified and can request loans
                                    </span>
                                    <span className="text-sm text-gray-600 ml-2">
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
                            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b-2 border-black">
                                    <CardTitle className="flex items-center gap-2">
                                        <HandCoins className="h-5 w-5" />
                                        Create Loan Request
                                    </CardTitle>
                                    <CardDescription>
                                        Fill in the details for your loan request. Lenders will be notified.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 bg-white">
                                    <BorrowRequestForm userId={userId} lenders={lenders} />
                                </CardContent>
                            </Card>

                            {/* My Loan Requests Status Section */}
                            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b-2 border-black">
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        My Loan Requests
                                    </CardTitle>
                                    <CardDescription>
                                        Track the status of your loan applications
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 bg-white">
                                    {myLoanRequests.length > 0 ? (
                                        <div className="space-y-4">
                                            {myLoanRequests.map((request) => (
                                                <div
                                                    key={request.id}
                                                    className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 bg-gray-50 hover:border-black transition-colors"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="font-bold text-lg">
                                                                {formatCurrency(request.amount)}
                                                            </span>
                                                            {getStatusBadge(request.status)}
                                                        </div>
                                                        <p className="text-sm font-medium">
                                                            {request.purpose || 'General purpose'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            To: {request.lender.firstName} {request.lender.lastName}
                                                            <span className="mx-1">•</span>
                                                            Due: {new Date(request.dueDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            {new Date(request.createdAt).toLocaleDateString()}
                                                        </p>
                                                        {request.status === 'ACTIVE' && (
                                                            <Link href={`/loans/${request.id}`}>
                                                                <Button size="sm" className="bg-black text-white hover:opacity-80 rounded-lg">
                                                                    View Loan
                                                                </Button>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Clock className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <p className="font-medium">No loan requests yet</p>
                                            <p className="text-sm">Submit a request above to get started</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Available Lenders */}
                        <div className="space-y-6">
                            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b-2 border-black">
                                    <CardTitle className="text-lg">Available Lenders</CardTitle>
                                    <CardDescription>Trusted lenders in the network</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 bg-white">
                                    {lenders.length > 0 ? (
                                        <div className="divide-y divide-gray-100">
                                            {lenders.slice(0, 5).map((lender) => (
                                                <div key={lender.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                                    <div>
                                                        <p className="font-bold text-sm">
                                                            {lender.firstName} {lender.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {lender._count.loansGiven} loans given
                                                        </p>
                                                    </div>
                                                    <TrustBadge score={lender.trustScore} size="sm" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-gray-500 text-sm">No lenders available yet</div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
                                <CardContent className="p-6">
                                    <h4 className="font-bold mb-3 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[#9eff69] rounded-full animate-pulse"></div>
                                        Tips for Borrowers
                                    </h4>
                                    <ul className="text-sm space-y-3 text-gray-300">
                                        <li className="flex gap-2 text-white/90">
                                            <span>•</span> Be clear about your loan purpose
                                        </li>
                                        <li className="flex gap-2 text-white/90">
                                            <span>•</span> Set realistic repayment dates
                                        </li>
                                        <li className="flex gap-2 text-white/90">
                                            <span>•</span> Higher trust scores get better rates
                                        </li>
                                        <li className="flex gap-2 text-white/90">
                                            <span>•</span> Timely repayments boost your score
                                        </li>
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
