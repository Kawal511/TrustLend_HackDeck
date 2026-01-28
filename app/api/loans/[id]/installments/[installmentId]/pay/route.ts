import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { updateTrustScore } from '@/lib/trust-score';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; installmentId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: loanId, installmentId } = await params;
    const body = await request.json();
    const { amount } = body;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get installment
    const installment = await prisma.installment.findUnique({
      where: { id: installmentId },
    });

    if (!installment) {
      return NextResponse.json({ error: 'Installment not found' }, { status: 404 });
    }

    if (installment.status === 'PAID') {
      return NextResponse.json(
        { error: 'Installment already paid' },
        { status: 400 }
      );
    }

    // Update installment
    const paidDate = new Date();
    const isOnTime = paidDate <= installment.dueDate;

    await prisma.installment.update({
      where: { id: installmentId },
      data: {
        status: 'PAID',
        paidDate,
        paidAmount: amount,
      },
    });

    // Update trust score
    const event = isOnTime ? 'INSTALLMENT_PAID_ON_TIME' : 'INSTALLMENT_PAID_LATE';
    await updateTrustScore(user.id, event, loanId, {
      installmentNumber: installment.installmentNumber,
      amount,
    });

    // Check if all installments are paid
    const allInstallments = await prisma.installment.findMany({
      where: { loanId },
    });

    const allPaid = allInstallments.every((i) => i.status === 'PAID');

    if (allPaid) {
      await prisma.loan.update({
        where: { id: loanId },
        data: { status: 'PAID' },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Installment paid successfully',
    });
  } catch (error) {
    console.error('Error paying installment:', error);
    return NextResponse.json(
      { error: 'Failed to pay installment' },
      { status: 500 }
    );
  }
}
