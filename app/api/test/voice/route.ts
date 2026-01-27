// Initiate a test voice call via Bolna
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { initiateBolnaCall } from "@/lib/bolna";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Initiate test call
    const callData = await initiateBolnaCall({
      phoneNumber,
      loanAmount: 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      borrowerName: "Test User",
      lenderName: "TrustLend",
      loanId: "test-call-" + Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Test call initiated successfully!",
      callId: callData.call_id,
      status: callData.status,
    });
  } catch (error: any) {
    console.error("Error initiating test call:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate test call" },
      { status: 500 }
    );
  }
}
