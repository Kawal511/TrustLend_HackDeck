// app/api/borrowers/register/route.ts - Borrower Registration API

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface AadhaarVerification {
    aadhaarNumber: string;
    maskedAadhaar: string;
    name: string;
    dob: string;
    gender: string;
    address: string;
    verifiedAt: string;
}

interface RegistrationBody {
    firstName: string;
    lastName?: string;
    email: string;
    phoneNumber: string;
    dateOfBirth?: string;
    address?: string;
    aadhaarVerification?: AadhaarVerification;
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        const body: RegistrationBody = await req.json();
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            dateOfBirth,
            address,
            aadhaarVerification
        } = body;

        // Validate required fields
        if (!firstName || !email || !phoneNumber) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Initial trust score
        const initialTrustScore = aadhaarVerification ? 50 : 30;

        let user;

        // First, check if logged-in user exists (by Clerk userId)
        if (userId) {
            const existingByUserId = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (existingByUserId) {
                // Update existing logged-in user
                user = await prisma.user.update({
                    where: { id: userId },
                    data: {
                        firstName,
                        lastName,
                        phoneNumber,
                        trustScore: initialTrustScore,
                        isIdVerified: !!aadhaarVerification,
                    }
                });
            }
        }

        // If no user found by userId, check by email
        if (!user) {
            const existingByEmail = await prisma.user.findUnique({
                where: { email }
            });

            if (existingByEmail) {
                // Update existing user by email
                user = await prisma.user.update({
                    where: { email },
                    data: {
                        firstName,
                        lastName,
                        phoneNumber,
                        trustScore: initialTrustScore,
                        isIdVerified: !!aadhaarVerification,
                    }
                });
            } else {
                // Create new user
                user = await prisma.user.create({
                    data: {
                        id: userId || `borrower_${Date.now()}`,
                        email,
                        firstName,
                        lastName,
                        phoneNumber,
                        trustScore: initialTrustScore,
                        isIdVerified: !!aadhaarVerification,
                    }
                });
            }
        }

        // Create verification record if Aadhaar verified
        if (aadhaarVerification) {
            // Check if verification record exists
            const existingVerification = await prisma.verification.findUnique({
                where: { userId: user.id }
            });

            if (existingVerification) {
                await prisma.verification.update({
                    where: { userId: user.id },
                    data: {
                        idType: 'AADHAAR',
                        idNumber: aadhaarVerification.aadhaarNumber,
                        idVerified: true,
                        idVerifiedAt: new Date(aadhaarVerification.verifiedAt),
                        verificationScore: 50,
                        extractedData: JSON.stringify({
                            name: aadhaarVerification.name,
                            dob: aadhaarVerification.dob,
                            gender: aadhaarVerification.gender,
                            address: aadhaarVerification.address,
                            verificationMethod: 'DIGILOCKER'
                        })
                    }
                });
            } else {
                await prisma.verification.create({
                    data: {
                        userId: user.id,
                        idType: 'AADHAAR',
                        idNumber: aadhaarVerification.aadhaarNumber,
                        idVerified: true,
                        idVerifiedAt: new Date(aadhaarVerification.verifiedAt),
                        verificationScore: 50,
                        extractedData: JSON.stringify({
                            name: aadhaarVerification.name,
                            dob: aadhaarVerification.dob,
                            gender: aadhaarVerification.gender,
                            address: aadhaarVerification.address,
                            verificationMethod: 'DIGILOCKER'
                        })
                    }
                });
            }

            // Create trust score history entry
            await prisma.trustScoreHistory.create({
                data: {
                    userId: user.id,
                    event: 'REGISTRATION',
                    change: 50,
                    previousScore: 0,
                    newScore: 50,
                    description: 'Initial registration with Aadhaar verification via DigiLocker'
                }
            });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                trustScore: user.trustScore
            },
            trustScore: initialTrustScore,
            message: 'Registration successful!'
        });
    } catch (error) {
        console.error('Borrower registration error:', error);
        return NextResponse.json(
            { error: 'Registration failed. Please try again.' },
            { status: 500 }
        );
    }
}
