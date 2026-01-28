// app/api/loans/[id]/approve/route.ts - API for approving/rejecting loan requests

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { action } = body; // 'approve' or 'reject'

        // Find the loan
        const loan = await prisma.loan.findUnique({
            where: { id },
            include: {
                borrower: { select: { firstName: true, lastName: true } }
            }
        });

        if (!loan) {
            return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
        }

        // Only the lender can approve/reject
        if (loan.lenderId !== userId) {
            return NextResponse.json(
                { error: 'Only the lender can approve or reject this request' },
                { status: 403 }
            );
        }

        // Can only approve/reject pending loans
        if (loan.status !== 'PENDING') {
            return NextResponse.json(
                { error: 'This loan is no longer pending' },
                { status: 400 }
            );
        }

        if (action === 'approve') {
            const interestRate = body.interestRate || 0;
            const interestAmount = (loan.amount * interestRate) / 100;
            const totalWithInterest = loan.amount + interestAmount;

            // Approve the loan - change status to ACTIVE and set interest
            const updatedLoan = await prisma.loan.update({
                where: { id },
                data: {
                    status: 'ACTIVE',
                    interestRate: interestRate,
                    totalWithInterest: totalWithInterest,
                    balance: totalWithInterest
                }
            });

            return NextResponse.json({
                success: true,
                message: `Loan approved with ${interestRate}% interest! Total repayment: ₹${totalWithInterest.toLocaleString()}`,
                loan: updatedLoan
            });
        } else if (action === 'reject') {
            // Reject the loan
            const updatedLoan = await prisma.loan.update({
                where: { id },
                data: {
                    status: 'REJECTED'
                }
            });

            return NextResponse.json({
                success: true,
                message: 'Loan request rejected.',
                loan: updatedLoan
            });
        } else {
            return NextResponse.json(
                { error: 'Invalid action. Use "approve" or "reject"' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Loan approval error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
