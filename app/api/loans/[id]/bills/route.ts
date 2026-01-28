import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { jsPDF } from 'jspdf';

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
        repayments: true,
        installments: true,
      },
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Generate bill number
    const billNumber = `BILL-${Date.now()}-${loan.id.slice(0, 8)}`;

    // Calculate fees and totals
    const lateFee = loan.status === 'OVERDUE' ? loan.amount * 0.05 : 0;
    const processingFee = 50;
    const subtotal = loan.amount;
    const fees = lateFee + processingFee;
    const total = subtotal + fees;

    // Create bill items
    const items = [
      { description: 'Loan Principal', amount: loan.amount },
      { description: 'Processing Fee', amount: processingFee },
    ];

    if (lateFee > 0) {
      items.push({ description: 'Late Payment Fee (5%)', amount: lateFee });
    }

    // Generate PDF
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('TrustLend', 20, 20);
    doc.setFontSize(10);
    doc.text('Peer-to-Peer Lending Platform', 20, 27);

    // Bill info
    doc.setFontSize(16);
    doc.text('LOAN BILL', 150, 20);
    doc.setFontSize(10);
    doc.text(`Bill #: ${billNumber}`, 150, 27);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 32);

    // Line
    doc.line(20, 40, 190, 40);

    // Parties
    doc.setFontSize(12);
    doc.text('Borrower:', 20, 50);
    doc.setFontSize(10);
    const borrowerName = loan.borrower.firstName && loan.borrower.lastName
      ? `${loan.borrower.firstName} ${loan.borrower.lastName}`
      : loan.borrower.email;
    doc.text(borrowerName, 20, 56);
    doc.text(loan.borrower.email, 20, 61);

    doc.setFontSize(12);
    doc.text('Lender:', 120, 50);
    doc.setFontSize(10);
    const lenderName = loan.lender.firstName && loan.lender.lastName
      ? `${loan.lender.firstName} ${loan.lender.lastName}`
      : loan.lender.email;
    doc.text(lenderName, 120, 56);
    doc.text(loan.lender.email, 120, 61);

    // Line
    doc.line(20, 70, 190, 70);

    // Items table
    doc.setFontSize(12);
    doc.text('Description', 20, 80);
    doc.text('Amount', 160, 80);
    doc.line(20, 82, 190, 82);

    let yPos = 90;
    doc.setFontSize(10);
    items.forEach((item) => {
      doc.text(item.description, 20, yPos);
      doc.text(`₹${item.amount.toFixed(2)}`, 160, yPos);
      yPos += 7;
    });

    // Totals
    doc.line(20, yPos + 3, 190, yPos + 3);
    yPos += 10;
    doc.text('Subtotal:', 120, yPos);
    doc.text(`₹${subtotal.toFixed(2)}`, 160, yPos);
    yPos += 7;
    doc.text('Fees:', 120, yPos);
    doc.text(`₹${fees.toFixed(2)}`, 160, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.text('Total:', 120, yPos);
    doc.text(`₹${total.toFixed(2)}`, 160, yPos);

    // Footer
    doc.setFontSize(8);
    doc.text(
      'This is a computer-generated bill. No signature required.',
      20,
      280
    );

    // Convert to base64
    const pdfBase64 = doc.output('datauristring');

    // Save bill to database
    const bill = await prisma.bill.create({
      data: {
        loanId,
        billNumber,
        items: JSON.stringify(items),
        subtotal,
        fees,
        total,
        status: 'GENERATED',
        pdfUrl: pdfBase64,
      },
    });

    return NextResponse.json({
      success: true,
      bill: {
        id: bill.id,
        billNumber: bill.billNumber,
        total: bill.total,
        pdfUrl: bill.pdfUrl,
      },
    });
  } catch (error) {
    console.error('Error generating bill:', error);
    return NextResponse.json(
      { error: 'Failed to generate bill' },
      { status: 500 }
    );
  }
}

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

    const bills = await prisma.bill.findMany({
      where: { loanId },
      orderBy: { generatedAt: 'desc' },
    });

    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}
