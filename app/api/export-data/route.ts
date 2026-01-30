
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch User and all related data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                loansTaken: {
                    include: { lender: true, repayments: true },
                    orderBy: { createdAt: 'desc' }
                },
                loansGiven: {
                    include: { borrower: true, repayments: true },
                    orderBy: { createdAt: 'desc' }
                },
                trustScoreHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                repaymentsGiven: true,
                repaymentsReceived: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Aggregate transactions
        const transactions = [
            ...user.repaymentsGiven.map(r => ({ ...r, type: 'Repayment Sent' })),
            ...user.repaymentsReceived.map(r => ({ ...r, type: 'Repayment Received' }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            user: {
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                trustScore: user.trustScore,
                memberSince: user.createdAt
            },
            loans: {
                borrowed: user.loansTaken,
                lent: user.loansGiven
            },
            transactions,
            trustHistory: user.trustScoreHistory
        });

    } catch (error) {
        console.error('Export Data Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
