// Manually schedule a voice reminder for a loan
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { loanId, phoneNumber, scheduledFor } = body;

    if (!loanId || !phoneNumber || !scheduledFor) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user owns this loan
    const loan = await prisma.loan.findFirst({
      where: {
        id: loanId,
        OR: [{ lenderId: userId }, { borrowerId: userId }],
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Create voice reminder
    const reminder = await prisma.voiceReminder.create({
      data: {
        loanId,
        phoneNumber,
        scheduledFor: new Date(scheduledFor),
        status: "SCHEDULED",
      },
    });

    return NextResponse.json({
      success: true,
      reminder,
      message: "Voice reminder scheduled successfully",
    });
  } catch (error) {
    console.error("Error scheduling voice reminder:", error);
    return NextResponse.json(
      { error: "Failed to schedule reminder" },
      { status: 500 }
    );
  }
}
