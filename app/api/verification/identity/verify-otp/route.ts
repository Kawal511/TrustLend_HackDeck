import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// In-memory OTP storage (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, otp } = await req.json();

    const verification = await prisma.verification.findUnique({
      where: { userId }
    });

    if (!verification || !verification.idNumber) {
      return NextResponse.json(
        { error: 'Please submit ID details first' },
        { status: 400 }
      );
    }

    if (action === 'send') {
      // Generate mock OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      otpStore.set(userId, {
        otp: generatedOtp,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
      });

      // In production, send SMS/email here
      console.log(`Mock OTP for ${verification.idNumber}: ${generatedOtp}`);

      return NextResponse.json({
        success: true,
        message: 'OTP sent to registered mobile number',
        // FOR DEMO ONLY - Remove in production
        mockOtp: generatedOtp
      });
    }

    if (action === 'verify') {
      const stored = otpStore.get(userId);

      if (!stored) {
        return NextResponse.json(
          { error: 'OTP expired or not sent' },
          { status: 400 }
        );
      }

      if (Date.now() > stored.expiresAt) {
        otpStore.delete(userId);
        return NextResponse.json(
          { error: 'OTP expired' },
          { status: 400 }
        );
      }

      if (stored.otp !== otp) {
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 400 }
        );
      }

      // Mark as verified
      await prisma.verification.update({
        where: { userId },
        data: {
          idVerified: true,
          idVerifiedAt: new Date(),
          verificationScore: { increment: 30 } // +30 for OTP verification
        }
      });

      await prisma.user.update({
        where: { id: userId },
        data: { isIdVerified: true }
      });

      otpStore.delete(userId);

      return NextResponse.json({
        success: true,
        message: 'Identity verified successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
