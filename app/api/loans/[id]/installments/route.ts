import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: loanId } = await params;

    const installments = await prisma.installment.findMany({
      where: { loanId },
      orderBy: { installmentNumber: 'asc' },
    });

    return NextResponse.json(installments);
  } catch (error) {
    console.error('Error fetching installments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch installments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: loanId } = await params;
    const body = await request.json();
    const { numberOfInstallments } = body;

    // Get loan
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Calculate installment amount
    const installmentAmount = loan.amount / numberOfInstallments;
    const startDate = new Date();

    // Create installments
    const installments = [];
    for (let i = 1; i <= numberOfInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      installments.push({
        loanId,
        installmentNumber: i,
        amount: installmentAmount,
        dueDate,
        status: 'PENDING',
      });
    }

    await prisma.installment.createMany({
      data: installments,
    });

    // Update loan
    await prisma.loan.update({
      where: { id: loanId },
      data: { hasInstallments: true },
    });

    return NextResponse.json({
      success: true,
      message: `Created ${numberOfInstallments} installments`,
    });
  } catch (error) {
    console.error('Error creating installments:', error);
    return NextResponse.json(
      { error: 'Failed to create installments' },
      { status: 500 }
    );
  }
}
