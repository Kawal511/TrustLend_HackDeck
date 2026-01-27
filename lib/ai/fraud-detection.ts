// lib/ai/fraud-detection.ts - Anomaly detection system for suspicious activities

export interface FraudAlert {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    alertType: FraudType;
    severity: "low" | "medium" | "high" | "critical";
    suspicionScore: number;
    redFlags: RedFlag[];
    actionTaken?: "reviewed" | "blocked" | "dismissed";
    createdAt: Date;
    details: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type FraudType =
    | "velocity_abuse"
    | "amount_anomaly"
    | "new_account_abuse"
    | "dispute_pattern"
    | "circular_lending"
    | "suspicious_repayment";

export interface RedFlag {
    code: string;
    description: string;
    weight: number;
}

export interface UserActivity {
    userId: string;
    email: string;
    name: string;
    accountAge: number; // days
    trustScore: number;
    loansRequested: number;
    loansRequestedLast24h: number;
    loansRequestedLast7d: number;
    averageLoanAmount: number;
    maxLoanAmount: number;
    totalDisputes: number;
    totalConfirmations: number;
    repaymentsReceived: number;
    repaymentsConfirmed: number;
    loanPartners: string[]; // unique user IDs they've transacted with
}

interface FraudCheckResult {
    suspicionScore: number;
    redFlags: RedFlag[];
    alertType: FraudType | null;
}

// Detection thresholds
const THRESHOLDS = {
    VELOCITY_24H: 3,        // Max loans in 24 hours
    VELOCITY_7D: 10,        // Max loans in 7 days
    AMOUNT_ZSCORE: 2,       // Z-score threshold for amount anomaly
    NEW_ACCOUNT_DAYS: 7,    // Account age threshold
    DISPUTE_RATE: 0.5,      // 50% dispute rate is suspicious
    MIN_CONFIRMATIONS: 3    // Min repayments to check dispute pattern
};

// Calculate z-score for a value against historical average
function calculateZScore(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return value > mean ? 3 : 0;
    return (value - mean) / stdDev;
}

// Check for velocity abuse (too many loans in short time)
function checkVelocityAbuse(activity: UserActivity): FraudCheckResult {
    const redFlags: RedFlag[] = [];
    let score = 0;

    if (activity.loansRequestedLast24h > THRESHOLDS.VELOCITY_24H) {
        const excess = activity.loansRequestedLast24h - THRESHOLDS.VELOCITY_24H;
        score += 20 + (excess * 10);
        redFlags.push({
            code: "VEL_24H",
            description: `${activity.loansRequestedLast24h} loan requests in 24 hours (max: ${THRESHOLDS.VELOCITY_24H})`,
            weight: 25
        });
    }

    if (activity.loansRequestedLast7d > THRESHOLDS.VELOCITY_7D) {
        const excess = activity.loansRequestedLast7d - THRESHOLDS.VELOCITY_7D;
        score += 15 + (excess * 5);
        redFlags.push({
            code: "VEL_7D",
            description: `${activity.loansRequestedLast7d} loan requests in 7 days (max: ${THRESHOLDS.VELOCITY_7D})`,
            weight: 20
        });
    }

    return {
        suspicionScore: Math.min(score, 100),
        redFlags,
        alertType: score > 0 ? "velocity_abuse" : null
    };
}

// Check for unusual loan amounts
function checkAmountAnomaly(
    requestedAmount: number,
    activity: UserActivity
): FraudCheckResult {
    const redFlags: RedFlag[] = [];
    let score = 0;

    if (activity.loansRequested === 0) {
        // First loan, can't compare to history
        if (requestedAmount > 1000) {
            score += 15;
            redFlags.push({
                code: "AMT_FIRST_LARGE",
                description: `First loan request is large: $${requestedAmount}`,
                weight: 15
            });
        }
    } else {
        // Compare to historical pattern
        const ratio = requestedAmount / activity.averageLoanAmount;

        if (ratio > 3) {
            score += 30;
            redFlags.push({
                code: "AMT_3X_AVG",
                description: `Request is ${ratio.toFixed(1)}x average loan amount`,
                weight: 30
            });
        } else if (ratio > 2) {
            score += 15;
            redFlags.push({
                code: "AMT_2X_AVG",
                description: `Request is ${ratio.toFixed(1)}x average loan amount`,
                weight: 15
            });
        }

        if (requestedAmount > activity.maxLoanAmount * 1.5) {
            score += 20;
            redFlags.push({
                code: "AMT_EXCEEDS_MAX",
                description: `Request exceeds previous max by 50%+`,
                weight: 20
            });
        }
    }

    return {
        suspicionScore: Math.min(score, 100),
        redFlags,
        alertType: score > 0 ? "amount_anomaly" : null
    };
}

// Check for new account abuse
function checkNewAccountAbuse(
    requestedAmount: number,
    activity: UserActivity,
    maxAllowedAmount: number
): FraudCheckResult {
    const redFlags: RedFlag[] = [];
    let score = 0;

    if (activity.accountAge < THRESHOLDS.NEW_ACCOUNT_DAYS) {
        // New account
        if (requestedAmount >= maxAllowedAmount * 0.8) {
            score += 40;
            redFlags.push({
                code: "NEW_MAX_REQUEST",
                description: `New account (${activity.accountAge} days) requesting near-max amount`,
                weight: 40
            });
        }

        if (activity.loansRequestedLast24h > 1) {
            score += 25;
            redFlags.push({
                code: "NEW_VELOCITY",
                description: `New account with multiple requests in 24h`,
                weight: 25
            });
        }

        if (activity.trustScore < 80) {
            score += 10;
            redFlags.push({
                code: "NEW_LOW_TRUST",
                description: `New account with below-average trust score`,
                weight: 10
            });
        }
    }

    return {
        suspicionScore: Math.min(score, 100),
        redFlags,
        alertType: score > 0 ? "new_account_abuse" : null
    };
}

// Check for suspicious dispute patterns
function checkDisputePattern(activity: UserActivity): FraudCheckResult {
    const redFlags: RedFlag[] = [];
    let score = 0;

    if (activity.repaymentsReceived >= THRESHOLDS.MIN_CONFIRMATIONS) {
        const confirmationRate = activity.repaymentsConfirmed / activity.repaymentsReceived;

        if (confirmationRate < 0.3) {
            score += 50;
            redFlags.push({
                code: "DISPUTE_HIGH",
                description: `Only confirms ${(confirmationRate * 100).toFixed(0)}% of received payments`,
                weight: 50
            });
        } else if (confirmationRate < 0.5) {
            score += 25;
            redFlags.push({
                code: "DISPUTE_MODERATE",
                description: `Only confirms ${(confirmationRate * 100).toFixed(0)}% of received payments`,
                weight: 25
            });
        }
    }

    const disputeRatio = activity.totalConfirmations > 0
        ? activity.totalDisputes / (activity.totalDisputes + activity.totalConfirmations)
        : 0;

    if (disputeRatio > THRESHOLDS.DISPUTE_RATE) {
        score += 35;
        redFlags.push({
            code: "DISPUTE_RATIO",
            description: `${(disputeRatio * 100).toFixed(0)}% dispute rate across all transactions`,
            weight: 35
        });
    }

    return {
        suspicionScore: Math.min(score, 100),
        redFlags,
        alertType: score > 0 ? "dispute_pattern" : null
    };
}

// Check for circular lending patterns (A → B → C → A)
function checkCircularLending(
    activity: UserActivity,
    allUserActivities: Map<string, UserActivity>
): FraudCheckResult {
    const redFlags: RedFlag[] = [];
    let score = 0;

    // Look for circular patterns in loan partners
    const partners = activity.loanPartners;

    for (const partner of partners) {
        const partnerActivity = allUserActivities.get(partner);
        if (!partnerActivity) continue;

        // Check if partner's partners include any of our partners (triangle)
        const commonPartners = partnerActivity.loanPartners.filter(
            p => partners.includes(p) && p !== activity.userId
        );

        if (commonPartners.length > 0) {
            // Check if the transactions are suspicious (e.g., similar amounts)
            score += 15;
            redFlags.push({
                code: "CIRCULAR_DETECTED",
                description: `Triangular lending pattern detected with ${commonPartners.length} users`,
                weight: 15
            });
        }
    }

    // Check for back-and-forth lending
    const mutualPartners = partners.filter(partner => {
        const partnerActivity = allUserActivities.get(partner);
        return partnerActivity?.loanPartners.includes(activity.userId);
    });

    if (mutualPartners.length > 2) {
        score += 20;
        redFlags.push({
            code: "MUTUAL_LENDING",
            description: `Bi-directional lending with ${mutualPartners.length} users`,
            weight: 20
        });
    }

    return {
        suspicionScore: Math.min(score, 100),
        redFlags,
        alertType: score > 0 ? "circular_lending" : null
    };
}

// Main fraud detection function
export function detectFraud(
    activity: UserActivity,
    requestedAmount?: number,
    maxAllowedAmount?: number,
    allUserActivities?: Map<string, UserActivity>
): FraudAlert | null {
    const allRedFlags: RedFlag[] = [];
    let totalScore = 0;
    let primaryAlertType: FraudType | null = null;
    let maxTypeScore = 0;

    // Run all checks
    const checks: FraudCheckResult[] = [
        checkVelocityAbuse(activity),
        checkDisputePattern(activity)
    ];

    if (requestedAmount !== undefined) {
        checks.push(checkAmountAnomaly(requestedAmount, activity));

        if (maxAllowedAmount !== undefined) {
            checks.push(checkNewAccountAbuse(requestedAmount, activity, maxAllowedAmount));
        }
    }

    if (allUserActivities) {
        checks.push(checkCircularLending(activity, allUserActivities));
    }

    // Aggregate results
    for (const check of checks) {
        allRedFlags.push(...check.redFlags);
        totalScore += check.suspicionScore;

        if (check.alertType && check.suspicionScore > maxTypeScore) {
            primaryAlertType = check.alertType;
            maxTypeScore = check.suspicionScore;
        }
    }

    // Normalize total score
    totalScore = Math.min(totalScore, 100);

    // Only create alert if score is significant
    if (totalScore < 20) return null;

    // Determine severity
    let severity: FraudAlert["severity"];
    if (totalScore >= 80) severity = "critical";
    else if (totalScore >= 60) severity = "high";
    else if (totalScore >= 40) severity = "medium";
    else severity = "low";

    return {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: activity.userId,
        userEmail: activity.email,
        userName: activity.name,
        alertType: primaryAlertType || "suspicious_repayment",
        severity,
        suspicionScore: totalScore,
        redFlags: allRedFlags,
        createdAt: new Date(),
        details: {
            accountAge: activity.accountAge,
            trustScore: activity.trustScore,
            loansRequested: activity.loansRequested,
            requestedAmount
        }
    };
}

// Get severity color
export function getSeverityColor(severity: FraudAlert["severity"]): string {
    switch (severity) {
        case "critical": return "bg-red-600";
        case "high": return "bg-orange-500";
        case "medium": return "bg-yellow-500";
        case "low": return "bg-blue-500";
    }
}

// Get alert type label
export function getAlertTypeLabel(type: FraudType): string {
    const labels: Record<FraudType, string> = {
        velocity_abuse: "Velocity Abuse",
        amount_anomaly: "Amount Anomaly",
        new_account_abuse: "New Account Abuse",
        dispute_pattern: "Dispute Pattern",
        circular_lending: "Circular Lending",
        suspicious_repayment: "Suspicious Activity"
    };
    return labels[type];
}
