import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

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

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        borrower: true,
        lender: true,
      },
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      loanId: loan.id,
      amount: loan.amount,
      borrower: loan.borrower.name,
      lender: loan.lender.name,
      dueDate: loan.dueDate,
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/loans/${loan.id}/repay`,
    });

    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Save QR code to loan
    await prisma.loan.update({
      where: { id: loanId },
      data: { qrCode: qrCodeUrl },
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeUrl,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
