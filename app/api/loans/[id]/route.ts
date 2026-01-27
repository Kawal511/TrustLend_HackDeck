// app/api/loans/[id]/route.ts - Loan detail operations

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateLoanSchema } from "@/lib/validators";

// GET - Get loan details
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const loan = await prisma.loan.findUnique({
            where: { id },
            include: {
                lender: true,
                borrower: true,
                repayments: {
                    include: {
                        payer: true,
                        receiver: true
                    },
                    orderBy: { createdAt: "desc" }
                }
            }
        });

        if (!loan) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }

        // Check if user is lender or borrower
        if (loan.lenderId !== userId && loan.borrowerId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(loan);

    } catch (error) {
        console.error("Loan fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PATCH - Update loan status
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // Validate request body
        const validationResult = updateLoanSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const loan = await prisma.loan.findUnique({
            where: { id }
        });

        if (!loan) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }

        // Only lender can update loan
        if (loan.lenderId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedLoan = await prisma.loan.update({
            where: { id },
            data: validationResult.data,
            include: {
                lender: true,
                borrower: true
            }
        });

        return NextResponse.json(updatedLoan);

    } catch (error) {
        console.error("Loan update error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE - Cancel loan (only if ACTIVE and no repayments)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const loan = await prisma.loan.findUnique({
            where: { id },
            include: { repayments: true }
        });

        if (!loan) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }

        // Only lender can cancel loan
        if (loan.lenderId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Can only cancel if ACTIVE and no repayments
        if (loan.status !== "ACTIVE") {
            return NextResponse.json(
                { error: "Can only cancel active loans" },
                { status: 400 }
            );
        }

        if (loan.repayments.length > 0) {
            return NextResponse.json(
                { error: "Cannot cancel loan with existing repayments" },
                { status: 400 }
            );
        }

        await prisma.loan.update({
            where: { id },
            data: { status: "CANCELLED" }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Loan delete error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
