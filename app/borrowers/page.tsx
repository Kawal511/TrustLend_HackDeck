// app/borrowers/page.tsx - Verified Borrowers Directory

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrustBadge } from '@/components/trust/TrustBadge';
import { Shield, UserPlus, Search, Wallet, Calendar } from 'lucide-react';

export default async function BorrowersPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    // Get all verified borrowers
    const borrowers = await prisma.user.findMany({
        where: {
            isIdVerified: true,
            id: { not: userId }
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            trustScore: true,
            isIdVerified: true,
            isIncomeVerified: true,
            hasCollateral: true,
            createdAt: true,
            verification: {
                select: {
                    incomeBracket: true,
                    collateralValue: true,
                    verificationScore: true
                }
            },
            _count: {
                select: {
                    loansTaken: true,
                    loansGiven: true
                }
            }
        },
        orderBy: {
            trustScore: 'desc'
        },
        take: 50
    });

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Verified Borrowers</h1>
                    <p className="text-gray-600 mt-2">
                        Browse verified borrowers on the TrustLend network
                    </p>
                </div>
                <Link href="/borrowers/register">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Register as Borrower
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {borrowers.map((borrower) => (
                    <Card key={borrower.id} className="hover:shadow-lg transition">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {borrower.firstName} {borrower.lastName}
                                        </h3>
                                        <TrustBadge score={borrower.trustScore} size="sm" />
                                    </div>

                                    <p className="text-gray-600 mb-3">{borrower.email}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {borrower.isIdVerified && (
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                <Shield className="h-3 w-3 mr-1" />
                                                ID Verified
                                            </Badge>
                                        )}
                                        {borrower.isIncomeVerified && (
                                            <Badge variant="secondary">
                                                <Wallet className="h-3 w-3 mr-1" />
                                                Income Verified
                                            </Badge>
                                        )}
                                        {borrower.hasCollateral && (
                                            <Badge variant="outline">
                                                Has Collateral
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-500">Trust Score</div>
                                            <div className="font-semibold text-lg text-purple-600">{borrower.trustScore}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Income Bracket</div>
                                            <div className="font-semibold">
                                                {borrower.verification?.incomeBracket || 'Not verified'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Loans Taken</div>
                                            <div className="font-semibold">{borrower._count.loansTaken}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Member Since</div>
                                            <div className="font-semibold flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(borrower.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-shrink-0">
                                    <Link href={`/loans/new?borrower=${borrower.id}`}>
                                        <Button className="bg-purple-600 hover:bg-purple-700">
                                            Create Loan
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {borrowers.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-gray-900">No Verified Borrowers Found</h3>
                            <p className="text-gray-600 mb-4">
                                Be the first to register as a verified borrower!
                            </p>
                            <Link href="/borrowers/register">
                                <Button className="bg-purple-600 hover:bg-purple-700">Register Now</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
