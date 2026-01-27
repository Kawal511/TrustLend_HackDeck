// Export loan due date to Google Calendar
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  return response.json();
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { loanId } = await req.json();

    if (!loanId) {
      return NextResponse.json(
        { error: "Loan ID is required" },
        { status: 400 }
      );
    }

    // Get user's calendar integration
    const integration = await prisma.userIntegration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: "GOOGLE_CALENDAR",
        },
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    // Get loan details
    const loan = await prisma.loan.findFirst({
      where: {
        id: loanId,
        OR: [{ lenderId: userId }, { borrowerId: userId }],
      },
      include: {
        lender: true,
        borrower: true,
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Refresh token if expired
    let accessToken = integration.accessToken;
    if (integration.expiresAt && new Date() > integration.expiresAt) {
      if (!integration.refreshToken) {
        return NextResponse.json(
          { error: "Calendar connection expired. Please reconnect." },
          { status: 401 }
        );
      }

      const tokens = await refreshAccessToken(integration.refreshToken);
      accessToken = tokens.access_token;

      // Update tokens in database
      await prisma.userIntegration.update({
        where: { id: integration.id },
        data: {
          accessToken: tokens.access_token,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
      });
    }

    // Create calendar event
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const isLender = loan.lenderId === userId;
    const otherParty = isLender ? loan.borrower : loan.lender;

    const event = {
      summary: `💰 Loan Payment Due: $${loan.amount}`,
      description: `${isLender ? "Receive" : "Pay"} loan payment\n\nAmount: $${
        loan.balance
      }\n${isLender ? "From" : "To"}: ${otherParty.email}\nPurpose: ${
        loan.purpose || "N/A"
      }\n\nView in TrustLend: ${process.env.NEXT_PUBLIC_APP_URL}/loans/${
        loan.id
      }`,
      start: {
        dateTime: loan.dueDate.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(
          loan.dueDate.getTime() + 60 * 60 * 1000
        ).toISOString(), // 1 hour duration
        timeZone: "UTC",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 day before
          { method: "popup", minutes: 60 }, // 1 hour before
        ],
      },
      colorId: "11", // Red color for loan payments
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      message: "Loan due date added to your calendar",
    });
  } catch (error: any) {
    console.error("Calendar export error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export to calendar" },
      { status: 500 }
    );
  }
}
