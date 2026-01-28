import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idType, idNumber } = await req.json();

    // Validate ID number format (mock validation)
    const isValid = validateIdNumber(idType, idNumber);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid ID number format' },
        { status: 400 }
      );
    }

    // Check if ID already exists
    const existing = await prisma.verification.findFirst({
      where: {
        idNumber,
        userId: { not: userId }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This ID is already registered with another user' },
        { status: 400 }
      );
    }

    // Create or update verification record
    const verification = await prisma.verification.upsert({
      where: { userId },
      create: {
        userId,
        idType,
        idNumber,
        idVerified: false,
        verificationScore: 20 // +20 for providing ID
      },
      update: {
        idType,
        idNumber,
        verificationScore: { increment: 20 }
      }
    });

    return NextResponse.json({
      success: true,
      verification,
      message: 'ID submitted. Please upload ID document for verification.'
    });
  } catch (error) {
    console.error('ID verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validateIdNumber(idType: string, idNumber: string): boolean {
  const patterns: Record<string, RegExp> = {
    AADHAAR: /^\d{12}$/,
    PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    PASSPORT: /^[A-Z][0-9]{7}$/,
    DRIVERS_LICENSE: /^[A-Z]{2}[0-9]{13}$/
  };

  return patterns[idType]?.test(idNumber) || false;
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const verification = await prisma.verification.findUnique({
      where: { userId }
    });

    return NextResponse.json(verification || {});
  } catch (error) {
    console.error('Get verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
