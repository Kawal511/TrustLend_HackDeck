// app/api/borrowers/status/route.ts - Check borrower registration status

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({
                isRegistered: false,
                isVerified: false
            });
        }

        // Check if user exists and has verification
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                verification: true
            }
        });

        if (!user) {
            return NextResponse.json({
                isRegistered: false,
                isVerified: false
            });
        }

        const isVerified = user.verification?.idVerified === true;

        return NextResponse.json({
            isRegistered: true,
            isVerified,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                trustScore: user.trustScore
            },
            verification: user.verification ? {
                verifiedAt: user.verification.idVerifiedAt,
                maskedId: user.verification.idNumber ?
                    'XXXX-XXXX-' + user.verification.idNumber.slice(-4) : null
            } : null
        });

    } catch (error) {
        console.error('Status check error:', error);
        return NextResponse.json(
            { error: 'Failed to check status' },
            { status: 500 }
        );
    }
}
