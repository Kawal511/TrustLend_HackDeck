// Handle Google OAuth callback and store tokens
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // userId
    const error = url.searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/settings?error=${error}`, process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings?error=missing_params", process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    const userId = state;

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange error:", errorData);
      return NextResponse.redirect(
        new URL("/settings?error=token_exchange_failed", process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    const tokens = await tokenResponse.json();

    // Store or update tokens in database
    await prisma.userIntegration.upsert({
      where: {
        userId_provider: {
          userId,
          provider: "GOOGLE_CALENDAR",
        },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : new Date(),
      },
      create: {
        userId,
        provider: "GOOGLE_CALENDAR",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : new Date(),
      },
    });

    // Redirect back to settings with success
    return NextResponse.redirect(
      new URL("/settings?success=calendar_connected", process.env.NEXT_PUBLIC_APP_URL)
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/settings?error=callback_failed", process.env.NEXT_PUBLIC_APP_URL)
    );
  }
}
