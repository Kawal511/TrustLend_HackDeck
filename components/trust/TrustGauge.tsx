// components/trust/TrustGauge.tsx - Circular gauge for trust score

"use client";

import { cn } from "@/lib/utils";
import { getTrustTier, calculateLoanLimit } from "@/lib/trust";
import { formatCurrency } from "@/lib/utils";

interface TrustGaugeProps {
    score: number;
    size?: "sm" | "md" | "lg";
    showDetails?: boolean;
}

export function TrustGauge({ score, size = "md", showDetails = true }: TrustGaugeProps) {
    const tier = getTrustTier(score);
    const limits = calculateLoanLimit(score);
    const percentage = (score / 150) * 100;

    const sizes = {
        sm: { dimension: 120, strokeWidth: 8, fontSize: "text-2xl" },
        md: { dimension: 160, strokeWidth: 10, fontSize: "text-3xl" },
        lg: { dimension: 200, strokeWidth: 12, fontSize: "text-4xl" }
    };

    const { dimension, strokeWidth, fontSize } = sizes[size];
    const radius = (dimension - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    const gradientColors = {
        Bronze: ["#ea580c", "#f97316"],
        Silver: ["#6b7280", "#9ca3af"],
        Gold: ["#ca8a04", "#eab308"],
        Platinum: ["#2563eb", "#3b82f6"],
        Diamond: ["#9333ea", "#a855f7"]
    };

    const colors = gradientColors[tier.name as keyof typeof gradientColors];

    return (
        <div className="flex flex-col items-center gap-4">
            {/* SVG Gauge */}
            <div className="relative" style={{ width: dimension, height: dimension }}>
                <svg width={dimension} height={dimension} className="-rotate-90">
                    <defs>
                        <linearGradient id={`gradient-${tier.name}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={colors[0]} />
                            <stop offset="100%" stopColor={colors[1]} />
                        </linearGradient>
                    </defs>
                    {/* Background circle */}
                    <circle
                        cx={dimension / 2}
                        cy={dimension / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle */}
                    <circle
                        cx={dimension / 2}
                        cy={dimension / 2}
                        r={radius}
                        fill="none"
                        stroke={`url(#gradient-${tier.name})`}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Score display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("font-bold", tier.color, fontSize)}>{score}</span>
                    <span className="text-xs text-gray-500">/ 150</span>
                </div>
            </div>

            {/* Tier badge */}
            <div className={cn(
                "px-4 py-1.5 rounded-full font-medium text-sm",
                tier.bgColor,
                tier.color
            )}>
                {tier.name} Tier
            </div>

            {/* Details */}
            {showDetails && (
                <div className="grid grid-cols-2 gap-4 text-center w-full max-w-xs">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(limits.maxAmount)}
                        </div>
                        <div className="text-xs text-gray-500">Max Loan</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-gray-900">
                            {limits.maxActiveLoans}
                        </div>
                        <div className="text-xs text-gray-500">Active Loans</div>
                    </div>
                </div>
            )}
        </div>
    );
}
