// components/admin/FraudAlerts.tsx - Admin fraud dashboard with alerts and charts

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import type { FraudAlert, FraudType } from "@/lib/ai/fraud-detection";
import { getSeverityColor, getAlertTypeLabel } from "@/lib/ai/fraud-detection";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { AlertTriangle, Shield, Eye, Ban, X, TrendingUp, Users, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface FraudAlertsProps {
    alerts: FraudAlert[];
    onAction?: (alertId: string, action: "reviewed" | "blocked" | "dismissed") => void;
}

export function FraudAlerts({ alerts, onAction }: FraudAlertsProps) {
    const [severityFilter, setSeverityFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"score" | "date">("score");

    // Filter and sort alerts
    const filteredAlerts = alerts
        .filter(a => severityFilter === "all" || a.severity === severityFilter)
        .filter(a => typeFilter === "all" || a.alertType === typeFilter)
        .sort((a, b) => {
            if (sortBy === "score") return b.suspicionScore - a.suspicionScore;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    // Calculate stats
    const stats = {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === "critical").length,
        high: alerts.filter(a => a.severity === "high").length,
        pending: alerts.filter(a => !a.actionTaken).length,
        avgScore: alerts.length > 0
            ? Math.round(alerts.reduce((sum, a) => sum + a.suspicionScore, 0) / alerts.length)
            : 0
    };

    // Chart data - alerts by type
    const typeData = Object.entries(
        alerts.reduce((acc, alert) => {
            acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([type, count]) => ({
        name: getAlertTypeLabel(type as FraudType),
        value: count
    }));

    // Chart data - severity distribution
    const severityData = [
        { name: "Critical", value: stats.critical, color: "#dc2626" },
        { name: "High", value: stats.high, color: "#f97316" },
        { name: "Medium", value: alerts.filter(a => a.severity === "medium").length, color: "#eab308" },
        { name: "Low", value: alerts.filter(a => a.severity === "low").length, color: "#3b82f6" }
    ].filter(d => d.value > 0);

    // Chart data - trend (mock data for demo)
    const trendData = [
        { day: "Mon", alerts: 3, score: 45 },
        { day: "Tue", alerts: 5, score: 62 },
        { day: "Wed", alerts: 2, score: 38 },
        { day: "Thu", alerts: 7, score: 71 },
        { day: "Fri", alerts: 4, score: 55 },
        { day: "Sat", alerts: 1, score: 28 },
        { day: "Sun", alerts: 3, score: 42 }
    ];

    const COLORS = ["#dc2626", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">Total Alerts</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-red-600 mb-1">
                            <Shield className="h-4 w-4" />
                            <span className="text-sm">Critical/High</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">
                            {stats.critical + stats.high}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-orange-600 mb-1">
                            <Activity className="h-4 w-4" />
                            <span className="text-sm">Pending Review</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-purple-600 mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm">Avg Score</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">{stats.avgScore}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Alert Trend (7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="alerts"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        name="Alerts"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#f97316"
                                        strokeWidth={2}
                                        name="Avg Score"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Severity Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Severity Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={severityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {severityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alert Types Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Alerts by Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={typeData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={120} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Alerts List */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Fraud Alerts</CardTitle>
                            <CardDescription>
                                Review and take action on suspicious activities
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="velocity_abuse">Velocity</SelectItem>
                                    <SelectItem value="amount_anomaly">Amount</SelectItem>
                                    <SelectItem value="new_account_abuse">New Account</SelectItem>
                                    <SelectItem value="dispute_pattern">Disputes</SelectItem>
                                    <SelectItem value="circular_lending">Circular</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredAlerts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Shield className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                <p>No alerts matching your filters</p>
                            </div>
                        ) : (
                            filteredAlerts.map(alert => (
                                <div
                                    key={alert.id}
                                    className={cn(
                                        "border rounded-lg p-4",
                                        alert.actionTaken && "opacity-60"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Severity indicator */}
                                        <div className={cn(
                                            "w-2 h-full min-h-[80px] rounded-full",
                                            getSeverityColor(alert.severity)
                                        )} />

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium">{alert.userName}</span>
                                                <span className="text-gray-500 text-sm">
                                                    {alert.userEmail}
                                                </span>
                                                <Badge variant="outline" className="ml-auto">
                                                    Score: {alert.suspicionScore}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <Badge className={getSeverityColor(alert.severity)}>
                                                    {alert.severity.toUpperCase()}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {getAlertTypeLabel(alert.alertType)}
                                                </Badge>
                                                {alert.actionTaken && (
                                                    <Badge variant="secondary">
                                                        {alert.actionTaken}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Red flags */}
                                            <div className="space-y-1 text-sm">
                                                {alert.redFlags.slice(0, 3).map((flag, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-gray-600">
                                                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                                                        {flag.description}
                                                    </div>
                                                ))}
                                                {alert.redFlags.length > 3 && (
                                                    <span className="text-gray-500">
                                                        +{alert.redFlags.length - 3} more flags
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-xs text-gray-400 mt-2">
                                                {formatDate(alert.createdAt)}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {!alert.actionTaken && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onAction?.(alert.id, "reviewed")}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => onAction?.(alert.id, "blocked")}
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => onAction?.(alert.id, "dismissed")}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
