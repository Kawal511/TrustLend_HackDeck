// Get voice reminders for a specific loan
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: loanId } = await params;

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

    // Get all voice reminders
    const reminders = await prisma.voiceReminder.findMany({
      where: { loanId },
      orderBy: { scheduledFor: "asc" },
    });

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error("Error fetching voice reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}
