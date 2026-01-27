// components/loans/RepaymentScheduleBuilder.tsx - Interactive repayment plan builder

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generateRepaymentPlans, getRecommendedPlan, RepaymentPlan } from "@/lib/ai/repayment-optimizer";
import { Check, Clock, Zap, Shield, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface RepaymentScheduleBuilderProps {
    loanAmount: number;
    trustScore: number;
    onSelectPlan?: (plan: RepaymentPlan) => void;
}

export function RepaymentScheduleBuilder({
    loanAmount,
    trustScore,
    onSelectPlan
}: RepaymentScheduleBuilderProps) {
    const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "monthly">("monthly");
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [showTimeline, setShowTimeline] = useState(false);

    // Generate plans based on inputs
    const plans = useMemo(() => {
        return generateRepaymentPlans({
            loanAmount,
            trustScore,
            preferredFrequency: frequency
        });
    }, [loanAmount, trustScore, frequency]);

    const recommendedType = getRecommendedPlan(trustScore);

    const planIcons = {
        aggressive: <Zap className="h-5 w-5" />,
        balanced: <Shield className="h-5 w-5" />,
        conservative: <Clock className="h-5 w-5" />
    };

    const planColors = {
        aggressive: "border-orange-500 bg-orange-50",
        balanced: "border-purple-500 bg-purple-50",
        conservative: "border-blue-500 bg-blue-50"
    };

    const planDescriptions = {
        aggressive: "Pay off faster with higher payments",
        balanced: "Optimal balance of speed and affordability",
        conservative: "Lower payments over longer duration"
    };

    function handleSelectPlan(plan: RepaymentPlan) {
        setSelectedPlan(plan.type);
        onSelectPlan?.(plan);
    }

    const currentPlan = plans.find(p => p.type === selectedPlan);

    return (
        <div className="space-y-6">
            {/* Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        AI Repayment Optimizer
                    </CardTitle>
                    <CardDescription>
                        Get personalized payment plans based on your trust score
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Label>Payment Frequency</Label>
                            <Select value={frequency} onValueChange={(v) => setFrequency(v as typeof frequency)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <Label>Loan Amount</Label>
                            <div className="mt-1 text-2xl font-bold text-gray-900">
                                {formatCurrency(loanAmount)}
                            </div>
                        </div>
                        <div className="flex-1">
                            <Label>Your Trust Score</Label>
                            <div className="mt-1 text-2xl font-bold text-purple-600">
                                {trustScore}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Plan Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                    <Card
                        key={plan.type}
                        className={cn(
                            "relative cursor-pointer transition-all hover:shadow-lg",
                            selectedPlan === plan.type && "ring-2 ring-purple-600",
                            plan.type === recommendedType && planColors[plan.type]
                        )}
                        onClick={() => handleSelectPlan(plan)}
                    >
                        {plan.type === recommendedType && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <Badge className="bg-purple-600">Recommended</Badge>
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 capitalize">
                                {planIcons[plan.type]}
                                {plan.type}
                            </CardTitle>
                            <CardDescription>{planDescriptions[plan.type]}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Payment Amount */}
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">
                                    {formatCurrency(plan.paymentAmount)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    per {frequency === "biweekly" ? "2 weeks" : frequency.replace("ly", "")}
                                </div>
                            </div>

                            <Separator />

                            {/* Details */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total Payments</span>
                                    <span className="font-medium">{plan.totalPayments}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Duration</span>
                                    <span className="font-medium">{plan.durationWeeks} weeks</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Interest Rate</span>
                                    <span className="font-medium">{(plan.interestRate * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total Interest</span>
                                    <span className="font-medium text-orange-600">
                                        {formatCurrency(plan.totalInterest)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Completion</span>
                                    <span className="font-medium">{formatDate(plan.completionDate)}</span>
                                </div>
                            </div>

                            {/* Select Button */}
                            <Button
                                className="w-full"
                                variant={selectedPlan === plan.type ? "default" : "outline"}
                            >
                                {selectedPlan === plan.type ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Selected
                                    </>
                                ) : (
                                    "Select Plan"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Timeline */}
            {currentPlan && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Payment Timeline
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowTimeline(!showTimeline)}
                            >
                                {showTimeline ? "Hide" : "Show"} All Payments
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {(showTimeline ? currentPlan.schedule : currentPlan.schedule.slice(0, 5)).map((item, index) => (
                                <div
                                    key={item.paymentNumber}
                                    className="flex items-center gap-4"
                                >
                                    {/* Timeline indicator */}
                                    <div className="flex flex-col items-center">
                                        <div className={cn(
                                            "w-3 h-3 rounded-full",
                                            index === 0 ? "bg-purple-600" : "bg-gray-300"
                                        )} />
                                        {index < (showTimeline ? currentPlan.schedule.length : 5) - 1 && (
                                            <div className="w-0.5 h-8 bg-gray-200" />
                                        )}
                                    </div>

                                    {/* Payment info */}
                                    <div className="flex-1 flex items-center justify-between py-2">
                                        <div>
                                            <div className="font-medium">
                                                Payment #{item.paymentNumber}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {formatDate(item.dueDate)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">
                                                {formatCurrency(item.amount)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formatCurrency(item.principal)} principal + {formatCurrency(item.interest)} interest
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {!showTimeline && currentPlan.schedule.length > 5 && (
                                <div className="text-center text-sm text-gray-500 pt-2">
                                    + {currentPlan.schedule.length - 5} more payments
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
