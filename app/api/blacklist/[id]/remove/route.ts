import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: blacklistId } = await params;

    const blacklistEntry = await prisma.blacklist.findUnique({
      where: { id: blacklistId },
    });

    if (!blacklistEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Deactivate blacklist entry
    await prisma.blacklist.update({
      where: { id: blacklistId },
      data: { isActive: false },
    });

    // Update user
    await prisma.user.update({
      where: { id: blacklistEntry.userId },
      data: { isBlacklisted: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Blacklist entry removed',
    });
  } catch (error) {
    console.error('Error removing blacklist entry:', error);
    return NextResponse.json(
      { error: 'Failed to remove blacklist entry' },
      { status: 500 }
    );
  }
}
