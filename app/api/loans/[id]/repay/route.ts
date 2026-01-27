// app/api/loans/[id]/repay/route.ts - Repayment operations

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRepaymentSchema, confirmRepaymentSchema } from "@/lib/validators";
import { updateTrustScore } from "@/lib/trust";

// POST - Record new repayment
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: loanId } = await params;
        const body = await req.json();

        // Validate request
        const validationResult = createRepaymentSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const validated = validationResult.data;

        // Get loan
        const loan = await prisma.loan.findUnique({
            where: { id: loanId },
            include: { lender: true, borrower: true }
        });

        if (!loan) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }

        // Check if user is lender or borrower
        const isLender = userId === loan.lenderId;
        const isBorrower = userId === loan.borrowerId;

        if (!isLender && !isBorrower) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Check loan status
        if (!["ACTIVE", "OVERDUE"].includes(loan.status)) {
            return NextResponse.json(
                { error: "Cannot add repayment to this loan" },
                { status: 400 }
            );
        }

        // Validate amount
        if (validated.amount > loan.balance) {
            return NextResponse.json(
                { error: `Amount exceeds remaining balance ($${loan.balance})` },
                { status: 400 }
            );
        }

        // Create repayment
        const repayment = await prisma.repayment.create({
            data: {
                loanId: loan.id,
                payerId: loan.borrowerId,
                receiverId: loan.lenderId,
                amount: validated.amount,
                note: validated.note,
                status: "PENDING_CONFIRMATION",
                initiatedBy: isLender ? "lender" : "borrower"
            },
            include: {
                payer: true,
                receiver: true
            }
        });

        return NextResponse.json(repayment, { status: 201 });

    } catch (error) {
        console.error("Repayment creation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PATCH - Confirm or dispute repayment
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: loanId } = await params;
        const url = new URL(req.url);
        const repaymentId = url.searchParams.get("repaymentId");

        if (!repaymentId) {
            return NextResponse.json(
                { error: "Repayment ID required" },
                { status: 400 }
            );
        }

        const body = await req.json();

        // Validate request
        const validationResult = confirmRepaymentSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const { action } = validationResult.data;

        // Get repayment
        const repayment = await prisma.repayment.findUnique({
            where: { id: repaymentId },
            include: { loan: true }
        });

        if (!repayment || repayment.loanId !== loanId) {
            return NextResponse.json({ error: "Repayment not found" }, { status: 404 });
        }

        // Check if repayment is pending
        if (repayment.status !== "PENDING_CONFIRMATION") {
            return NextResponse.json(
                { error: "Repayment already processed" },
                { status: 400 }
            );
        }

        // Check if user is the one who should confirm
        const shouldConfirm =
            (repayment.initiatedBy === "borrower" && userId === repayment.receiverId) ||
            (repayment.initiatedBy === "lender" && userId === repayment.payerId);

        if (!shouldConfirm) {
            return NextResponse.json(
                { error: "You cannot confirm/dispute this repayment" },
                { status: 403 }
            );
        }

        if (action === "confirm") {
            // Update repayment status
            await prisma.repayment.update({
                where: { id: repaymentId },
                data: {
                    status: "CONFIRMED",
                    confirmedBy: userId,
                    confirmedAt: new Date()
                }
            });

            // Update loan balance
            const newBalance = repayment.loan.balance - repayment.amount;
            const loanUpdate: { balance: number; status?: string; completedAt?: Date } = {
                balance: newBalance
            };

            if (newBalance <= 0) {
                loanUpdate.status = "COMPLETED";
                loanUpdate.completedAt = new Date();

                // Update trust score on completion
                await updateTrustScore(
                    repayment.payerId,
                    repayment.loanId,
                    repayment.loan.dueDate
                );
            }

            await prisma.loan.update({
                where: { id: loanId },
                data: loanUpdate
            });

            return NextResponse.json({ success: true, action: "confirmed" });
        }

        if (action === "dispute") {
            // Update repayment to disputed
            await prisma.repayment.update({
                where: { id: repaymentId },
                data: { status: "DISPUTED" }
            });

            // Update loan status to disputed
            await prisma.loan.update({
                where: { id: loanId },
                data: { status: "DISPUTED" }
            });

            return NextResponse.json({ success: true, action: "disputed" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Repayment confirmation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
