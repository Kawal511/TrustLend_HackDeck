// lib/ai/repayment-optimizer.ts - AI-powered repayment schedule generator

import { TRUST_TIERS } from "@/lib/constants";

export interface RepaymentPlan {
    type: "aggressive" | "balanced" | "conservative";
    frequency: "weekly" | "biweekly" | "monthly";
    paymentAmount: number;
    totalPayments: number;
    completionDate: Date;
    durationWeeks: number;
    totalInterest: number;
    interestRate: number;
    schedule: PaymentScheduleItem[];
}

export interface PaymentScheduleItem {
    paymentNumber: number;
    dueDate: Date;
    amount: number;
    principal: number;
    interest: number;
    remainingBalance: number;
}

interface OptimizerInput {
    loanAmount: number;
    trustScore: number;
    desiredDurationMonths?: number;
    preferredFrequency?: "weekly" | "biweekly" | "monthly";
}

// Get trust tier from score
function getTrustTier(score: number): typeof TRUST_TIERS[keyof typeof TRUST_TIERS] {
    if (score >= 140) return TRUST_TIERS.DIAMOND;
    if (score >= 110) return TRUST_TIERS.PLATINUM;
    if (score >= 80) return TRUST_TIERS.GOLD;
    if (score >= 50) return TRUST_TIERS.SILVER;
    return TRUST_TIERS.BRONZE;
}

// Calculate interest rate based on trust tier (lower tier = higher rate)
function getInterestRate(trustScore: number): number {
    const tier = getTrustTier(trustScore);
    const tierRates: Record<string, number> = {
        DIAMOND: 0.02,   // 2%
        PLATINUM: 0.035, // 3.5%
        GOLD: 0.05,      // 5%
        SILVER: 0.075,   // 7.5%
        BRONZE: 0.10     // 10%
    };
    return tierRates[tier.name] || 0.05;
}

// Calculate payment amount for a given schedule
function calculatePayment(
    principal: number,
    annualRate: number,
    totalPayments: number,
    frequency: "weekly" | "biweekly" | "monthly"
): number {
    // Convert annual rate to period rate
    const periodsPerYear = frequency === "weekly" ? 52 : frequency === "biweekly" ? 26 : 12;
    const periodRate = annualRate / periodsPerYear;

    if (periodRate === 0) {
        return principal / totalPayments;
    }

    // Amortization formula
    const payment = (principal * periodRate * Math.pow(1 + periodRate, totalPayments)) /
        (Math.pow(1 + periodRate, totalPayments) - 1);

    return Math.round(payment * 100) / 100;
}

// Generate payment schedule
function generateSchedule(
    principal: number,
    paymentAmount: number,
    annualRate: number,
    totalPayments: number,
    frequency: "weekly" | "biweekly" | "monthly",
    startDate: Date
): PaymentScheduleItem[] {
    const schedule: PaymentScheduleItem[] = [];
    const periodsPerYear = frequency === "weekly" ? 52 : frequency === "biweekly" ? 26 : 12;
    const periodRate = annualRate / periodsPerYear;
    const daysPerPeriod = frequency === "weekly" ? 7 : frequency === "biweekly" ? 14 : 30;

    let remainingBalance = principal;

    for (let i = 1; i <= totalPayments; i++) {
        const interest = Math.round(remainingBalance * periodRate * 100) / 100;
        const principalPayment = Math.min(paymentAmount - interest, remainingBalance);
        remainingBalance = Math.max(0, remainingBalance - principalPayment);

        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + (i * daysPerPeriod));

        schedule.push({
            paymentNumber: i,
            dueDate,
            amount: i === totalPayments ? principalPayment + interest : paymentAmount,
            principal: Math.round(principalPayment * 100) / 100,
            interest,
            remainingBalance: Math.round(remainingBalance * 100) / 100
        });

        if (remainingBalance <= 0) break;
    }

    return schedule;
}

// Generate a single repayment plan
function generatePlan(
    type: "aggressive" | "balanced" | "conservative",
    loanAmount: number,
    trustScore: number,
    frequency: "weekly" | "biweekly" | "monthly"
): RepaymentPlan {
    const interestRate = getInterestRate(trustScore);

    // Duration multipliers based on plan type
    const durationMultipliers = {
        aggressive: 0.6,   // 40% faster
        balanced: 1.0,     // Standard
        conservative: 1.5  // 50% longer
    };

    // Base duration in months based on loan amount
    let baseDurationMonths: number;
    if (loanAmount < 500) baseDurationMonths = 3;
    else if (loanAmount < 1500) baseDurationMonths = 6;
    else if (loanAmount < 3000) baseDurationMonths = 9;
    else if (loanAmount < 6000) baseDurationMonths = 12;
    else baseDurationMonths = 18;

    const adjustedDuration = Math.ceil(baseDurationMonths * durationMultipliers[type]);

    // Calculate total payments
    const paymentsPerMonth = frequency === "weekly" ? 4 : frequency === "biweekly" ? 2 : 1;
    const totalPayments = adjustedDuration * paymentsPerMonth;

    // Calculate payment amount
    const paymentAmount = calculatePayment(loanAmount, interestRate, totalPayments, frequency);

    // Generate schedule
    const startDate = new Date();
    const schedule = generateSchedule(loanAmount, paymentAmount, interestRate, totalPayments, frequency, startDate);

    // Calculate completion date and total interest
    const completionDate = schedule[schedule.length - 1]?.dueDate || new Date();
    const totalInterest = schedule.reduce((sum, item) => sum + item.interest, 0);
    const durationWeeks = Math.ceil((completionDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

    return {
        type,
        frequency,
        paymentAmount,
        totalPayments: schedule.length,
        completionDate,
        durationWeeks,
        totalInterest: Math.round(totalInterest * 100) / 100,
        interestRate,
        schedule
    };
}

// Main export: Generate 3 repayment plan options
export function generateRepaymentPlans(input: OptimizerInput): RepaymentPlan[] {
    const { loanAmount, trustScore, preferredFrequency = "monthly" } = input;

    const plans: RepaymentPlan[] = [
        generatePlan("aggressive", loanAmount, trustScore, preferredFrequency),
        generatePlan("balanced", loanAmount, trustScore, preferredFrequency),
        generatePlan("conservative", loanAmount, trustScore, preferredFrequency)
    ];

    return plans;
}

// Get recommendation based on trust score
export function getRecommendedPlan(trustScore: number): "aggressive" | "balanced" | "conservative" {
    if (trustScore >= 110) return "aggressive";
    if (trustScore >= 80) return "balanced";
    return "conservative";
}
