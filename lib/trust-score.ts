import { prisma } from './prisma';

export type TrustScoreEvent = 
  | 'LOAN_CREATED'
  | 'LOAN_FUNDED'
  | 'REPAYMENT_ON_TIME'
  | 'REPAYMENT_EARLY'
  | 'REPAYMENT_LATE'
  | 'LOAN_DEFAULTED'
  | 'DISPUTE_RAISED'
  | 'DISPUTE_RESOLVED'
  | 'BLACKLIST_REPORTED'
  | 'INSTALLMENT_PAID_ON_TIME'
  | 'INSTALLMENT_PAID_LATE'
  | 'INSTALLMENT_MISSED';

const TRUST_SCORE_CHANGES: Record<TrustScoreEvent, number> = {
  LOAN_CREATED: 5,
  LOAN_FUNDED: 10,
  REPAYMENT_ON_TIME: 20,
  REPAYMENT_EARLY: 25,
  REPAYMENT_LATE: -15,
  LOAN_DEFAULTED: -50,
  DISPUTE_RAISED: -10,
  DISPUTE_RESOLVED: 5,
  BLACKLIST_REPORTED: -100,
  INSTALLMENT_PAID_ON_TIME: 10,
  INSTALLMENT_PAID_LATE: -5,
  INSTALLMENT_MISSED: -20,
};

const EVENT_DESCRIPTIONS: Record<TrustScoreEvent, string> = {
  LOAN_CREATED: 'Created a new loan',
  LOAN_FUNDED: 'Funded a loan',
  REPAYMENT_ON_TIME: 'Repaid loan on time',
  REPAYMENT_EARLY: 'Repaid loan early',
  REPAYMENT_LATE: 'Late loan repayment',
  LOAN_DEFAULTED: 'Defaulted on loan',
  DISPUTE_RAISED: 'Raised a dispute',
  DISPUTE_RESOLVED: 'Dispute resolved successfully',
  BLACKLIST_REPORTED: 'Reported for fraudulent activity',
  INSTALLMENT_PAID_ON_TIME: 'Paid installment on time',
  INSTALLMENT_PAID_LATE: 'Paid installment late',
  INSTALLMENT_MISSED: 'Missed installment payment',
};

export async function updateTrustScore(
  userId: string,
  event: TrustScoreEvent,
  loanId?: string,
  metadata?: Record<string, any>
) {
  // Get current user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const change = TRUST_SCORE_CHANGES[event];
  const previousScore = user.trustScore;
  const newScore = Math.max(0, Math.min(1000, previousScore + change));

  // Update user's trust score
  await prisma.user.update({
    where: { id: userId },
    data: { trustScore: newScore },
  });

  // Create history entry
  await prisma.trustScoreHistory.create({
    data: {
      userId,
      event,
      change,
      previousScore,
      newScore,
      loanId,
      description: EVENT_DESCRIPTIONS[event],
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  return { previousScore, newScore, change };
}

export async function getTrustScoreHistory(userId: string) {
  return prisma.trustScoreHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      loan: {
        select: {
          id: true,
          amount: true,
          status: true,
        },
      },
    },
  });
}

export function calculateTrustBadge(score: number) {
  if (score >= 900) return { label: 'Diamond', color: 'blue' };
  if (score >= 750) return { label: 'Gold', color: 'yellow' };
  if (score >= 600) return { label: 'Silver', color: 'gray' };
  if (score >= 400) return { label: 'Bronze', color: 'orange' };
  return { label: 'New', color: 'green' };
}
