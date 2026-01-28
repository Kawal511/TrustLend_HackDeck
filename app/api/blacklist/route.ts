import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { updateTrustScore } from '@/lib/trust-score';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blacklistEntries = await prisma.blacklist.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            trustScore: true,
          },
        },
        reporter: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(blacklistEntries);
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blacklist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reporter = await prisma.user.findUnique({
      where: { id: clerkUserId },
    });

    if (!reporter) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { userId, reason, evidence, severity } = body;

    // Check if user already blacklisted
    const existing = await prisma.blacklist.findUnique({
      where: { userId },
    });

    if (existing && existing.isActive) {
      return NextResponse.json(
        { error: 'User already blacklisted' },
        { status: 400 }
      );
    }

    // Create blacklist entry
    const expiresAt = severity === 'CRITICAL' ? null : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days for non-critical

    await prisma.blacklist.create({
      data: {
        userId,
        reason,
        reportedBy: reporter.id,
        evidence,
        severity,
        expiresAt,
      },
    });

    // Update user's trust score
    await updateTrustScore(userId, 'BLACKLIST_REPORTED', undefined, {
      reason,
      severity,
      reportedBy: `${reporter.firstName} ${reporter.lastName}`,
    });

    // Mark user as blacklisted
    await prisma.user.update({
      where: { id: userId },
      data: { isBlacklisted: true },
    });

    return NextResponse.json({
      success: true,
      message: 'User blacklisted successfully',
    });
  } catch (error) {
    console.error('Error creating blacklist entry:', error);
    return NextResponse.json(
      { error: 'Failed to create blacklist entry' },
      { status: 500 }
    );
  }
}
