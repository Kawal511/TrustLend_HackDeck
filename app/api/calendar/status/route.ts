// Check Google Calendar connection status
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integration = await prisma.userIntegration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: "GOOGLE_CALENDAR",
        },
      },
    });

    if (!integration) {
      return NextResponse.json({ connected: false });
    }

    // Check if token is expired
    const isExpired = integration.expiresAt
      ? new Date() > integration.expiresAt
      : false;

    return NextResponse.json({
      connected: true,
      expired: isExpired,
      connectedAt: integration.createdAt,
    });
  } catch (error) {
    console.error("Calendar status check error:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
