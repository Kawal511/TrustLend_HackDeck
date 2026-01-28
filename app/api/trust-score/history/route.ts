import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTrustScoreHistory } from '@/lib/trust-score';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const history = await getTrustScoreHistory(user.id);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching trust score history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trust score history' },
      { status: 500 }
    );
  }
}
