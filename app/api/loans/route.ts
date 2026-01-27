// app/api/loans/route.ts - Create and list loans

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLoanSchema } from "@/lib/validators";
import { calculateLoanLimit } from "@/lib/trust";

// POST - Create new loan
export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Validate request body
        const validationResult = createLoanSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const validated = validationResult.data;

        // Find borrower by email
        const borrower = await prisma.user.findUnique({
            where: { email: validated.borrowerEmail }
        });

        if (!borrower) {
            return NextResponse.json(
                { error: "Borrower not found. They need to sign up first." },
                { status: 404 }
            );
        }

        // Prevent self-lending
        if (borrower.id === userId) {
            return NextResponse.json(
                { error: "Cannot lend to yourself" },
                { status: 400 }
            );
        }

        // Check trust-based limits
        const limit = calculateLoanLimit(borrower.trustScore);
        if (validated.amount > limit.maxAmount) {
            return NextResponse.json({
                error: `Amount exceeds borrower's trust limit ($${limit.maxAmount})`,
                limit: limit.maxAmount,
                borrowerTrustScore: borrower.trustScore
            }, { status: 400 });
        }

        // Check active loans count
        const activeLoans = await prisma.loan.count({
            where: {
                borrowerId: borrower.id,
                status: { in: ["ACTIVE", "OVERDUE"] }
            }
        });

        if (activeLoans >= limit.maxActiveLoans) {
            return NextResponse.json({
                error: `Borrower has reached maximum active loans (${activeLoans}/${limit.maxActiveLoans})`
            }, { status: 400 });
        }

        // Create loan
        const loan = await prisma.loan.create({
            data: {
                lenderId: userId,
                borrowerId: borrower.id,
                amount: validated.amount,
                balance: validated.amount,
                dueDate: new Date(validated.dueDate),
                purpose: validated.purpose,
                notes: validated.notes,
                status: "ACTIVE"
            },
            include: {
                lender: true,
                borrower: true
            }
        });

        return NextResponse.json(loan, { status: 201 });

    } catch (error) {
        console.error("Loan creation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET - List all loans for current user
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const loans = await prisma.loan.findMany({
            where: {
                OR: [
                    { lenderId: userId },
                    { borrowerId: userId }
                ]
            },
            include: {
                lender: true,
                borrower: true,
                repayments: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(loans);

    } catch (error) {
        console.error("Loan fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
