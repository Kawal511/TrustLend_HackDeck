// app/api/borrow/request/route.ts - API for submitting loan requests

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { amount, purpose, description, lenderId, dueDate, urgency, borrowerId } = body;

        // Validate required fields
        if (!amount || !purpose || !dueDate) {
            return NextResponse.json(
                { error: 'Amount, purpose, and due date are required' },
                { status: 400 }
            );
        }

        // Check if user is verified
        const borrower = await prisma.user.findUnique({
            where: { id: userId },
            select: { isIdVerified: true, trustScore: true, firstName: true, lastName: true }
        });

        if (!borrower?.isIdVerified) {
            return NextResponse.json(
                { error: 'You must complete verification to request loans' },
                { status: 403 }
            );
        }

        // If specific lender is selected, create a pending loan
        if (lenderId && lenderId !== 'any') {
            // Create a loan request (pending status)
            const loan = await prisma.loan.create({
                data: {
                    lenderId: lenderId,
                    borrowerId: userId,
                    amount: amount,
                    balance: amount,
                    currency: 'INR',
                    purpose: purpose,
                    notes: description || `Urgency: ${urgency}`,
                    dueDate: new Date(dueDate),
                    status: 'PENDING'
                }
            });

            // Create notification for the lender
            // Note: This would typically use a notification system
            // For now we'll just return success

            return NextResponse.json({
                success: true,
                loanId: loan.id,
                message: 'Loan request sent to lender. Waiting for approval.'
            });
        } else {
            // Broadcast request - create as pending with no specific lender
            // In a real system, this would notify all available lenders
            // For now, we'll create a loan request record

            // Find a potential lender (first available with high trust score)
            const potentialLender = await prisma.user.findFirst({
                where: {
                    id: { not: userId },
                    trustScore: { gte: 50 }
                },
                orderBy: { trustScore: 'desc' }
            });

            if (!potentialLender) {
                return NextResponse.json(
                    { error: 'No lenders available at the moment. Please try again later.' },
                    { status: 404 }
                );
            }

            const loan = await prisma.loan.create({
                data: {
                    lenderId: potentialLender.id,
                    borrowerId: userId,
                    amount: amount,
                    balance: amount,
                    currency: 'INR',
                    purpose: purpose,
                    notes: `${description || ''}\nUrgency: ${urgency}\n[Broadcast Request]`,
                    dueDate: new Date(dueDate),
                    status: 'PENDING'
                }
            });

            return NextResponse.json({
                success: true,
                loanId: loan.id,
                message: 'Loan request broadcasted. Lenders will be notified.'
            });
        }
    } catch (error) {
        console.error('Borrow request error:', error);
        return NextResponse.json(
            { error: 'Failed to submit loan request' },
            { status: 500 }
        );
    }
}
