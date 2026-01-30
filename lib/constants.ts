// lib/constants.ts - Application constants

export const LOAN_STATUS = {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    OVERDUE: 'OVERDUE',
    DISPUTED: 'DISPUTED',
    CANCELLED: 'CANCELLED'
} as const;

export const REPAYMENT_STATUS = {
    PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
    CONFIRMED: 'CONFIRMED',
    DISPUTED: 'DISPUTED'
} as const;

export const TRUST_SCORE = {
    INITIAL: 100,
    MIN: 0,
    MAX: 150
} as const;

export const TRUST_CHANGES = {
    EARLY: 8,
    ON_TIME: 5,
    LATE_1_7: -5,
    LATE_8_30: -10,
    OVERDUE: -20,
    DISPUTED: -15,
    FIRST_LOAN: 10
} as const;

export const TRUST_TIERS = {
    BRONZE: { min: 0, max: 49, maxAmount: 100, maxLoans: 1 },
    SILVER: { min: 50, max: 74, maxAmount: 500, maxLoans: 3 },
    GOLD: { min: 75, max: 99, maxAmount: 2000, maxLoans: 5 },
    PLATINUM: { min: 100, max: 124, maxAmount: 5000, maxLoans: 10 },
    DIAMOND: { min: 125, max: 150, maxAmount: 10000, maxLoans: 15 }
} as const;

export const REMINDER_DAYS = {
    WEEK_BEFORE: 7,
    DAY_BEFORE: 1,
    HALF_DAY: 0.5
} as const;

export const CURRENCIES = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
] as const;

export const DEFAULT_CURRENCY = 'INR';
