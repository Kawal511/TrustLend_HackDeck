// lib/trust.ts - Trust score calculation logic

import { prisma } from "./prisma";

export interface TrustEvent {
    type: 'ON_TIME' | 'EARLY' | 'LATE_1_7' | 'LATE_8_30' | 'OVERDUE' | 'DISPUTED' | 'FIRST_LOAN';
    daysLate?: number;
}

export interface TrustHistoryEntry {
    date: string;
    change: number;
    newScore: number;
    loanId?: string;
    reason: string;
}

// Calculate trust score change based on event type
export function calculateTrustScoreChange(event: TrustEvent): number {
    switch (event.type) {
        case 'ON_TIME':
            return 5;
        case 'EARLY':
            return 8;
        case 'LATE_1_7':
            return -5;
        case 'LATE_8_30':
            return -10;
        case 'OVERDUE':
            return -20;
        case 'DISPUTED':
            return -15;
        case 'FIRST_LOAN':
            return 10;
        default:
            return 0;
    }
}

// Calculate loan limits based on trust score
export function calculateLoanLimit(trustScore: number, email?: string) {
    // Exempted users with high limits
    const exemptedEmails = [
        'atharva.v.deo@gmail.com',
        'atharvavdeo75@gmail.com'
    ];

    if (email && exemptedEmails.includes(email)) {
        return { maxAmount: 10000, maxActiveLoans: 5 };
    }

    if (trustScore < 50) return { maxAmount: 100, maxActiveLoans: 1 };
    if (trustScore < 75) return { maxAmount: 500, maxActiveLoans: 3 };
    if (trustScore < 100) return { maxAmount: 2000, maxActiveLoans: 5 };
    if (trustScore < 125) return { maxAmount: 5000, maxActiveLoans: 10 };
    return { maxAmount: 10000, maxActiveLoans: 15 };
}

// Calculate days late (negative means early)
export function calculateDaysLate(dueDate: Date, completedDate: Date): number {
    const diff = completedDate.getTime() - dueDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Determine trust event type based on days late
export function getTrustEventType(daysLate: number): TrustEvent['type'] {
    if (daysLate < -7) return 'EARLY';
    if (daysLate <= 0) return 'ON_TIME';
    if (daysLate <= 7) return 'LATE_1_7';
    if (daysLate <= 30) return 'LATE_8_30';
    return 'OVERDUE';
}

// Update user's trust score after loan completion
export async function updateTrustScore(
    userId: string,
    loanId: string,
    dueDate: Date,
    completedDate: Date = new Date()
) {
    const daysLate = calculateDaysLate(dueDate, completedDate);
    const eventType = getTrustEventType(daysLate);
    const change = calculateTrustScoreChange({ type: eventType, daysLate });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const currentScore = user.trustScore;
    const newScore = Math.max(0, Math.min(150, currentScore + change));

    // Parse existing history
    let history: TrustHistoryEntry[] = [];
    if (user.trustHistory) {
        try {
            history = JSON.parse(user.trustHistory);
        } catch {
            history = [];
        }
    }

    // Add new entry
    history.push({
        date: new Date().toISOString(),
        change,
        newScore,
        loanId,
        reason: getReasonForEvent(eventType, daysLate)
    });

    // Update user
    await prisma.user.update({
        where: { id: userId },
        data: {
            trustScore: newScore,
            trustHistory: JSON.stringify(history)
        }
    });

    return { previousScore: currentScore, newScore, change };
}

// Get human-readable reason for trust change
function getReasonForEvent(eventType: TrustEvent['type'], daysLate: number): string {
    switch (eventType) {
        case 'EARLY':
            return `Repaid ${Math.abs(daysLate)} days early`;
        case 'ON_TIME':
            return 'Repaid on time';
        case 'LATE_1_7':
            return `Repaid ${daysLate} days late`;
        case 'LATE_8_30':
            return `Repaid ${daysLate} days late`;
        case 'OVERDUE':
            return `Repaid ${daysLate} days late`;
        case 'DISPUTED':
            return 'Repayment disputed';
        case 'FIRST_LOAN':
            return 'First loan given';
        default:
            return 'Unknown event';
    }
}

// Get trust tier info for display
export function getTrustTier(score: number) {
    if (score < 50) return { name: 'Bronze', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (score < 75) return { name: 'Silver', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    if (score < 100) return { name: 'Gold', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (score < 125) return { name: 'Platinum', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    return { name: 'Diamond', color: 'text-purple-600', bgColor: 'bg-purple-100' };
}
