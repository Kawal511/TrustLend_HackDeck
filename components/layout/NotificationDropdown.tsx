// components/layout/NotificationDropdown.tsx - Notification bell with dropdown

"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Wallet, ArrowUpRight, ArrowDownLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    type: "loan_request" | "repayment" | "confirmation" | "overdue" | "system";
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    link?: string;
}

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            // Fetch notifications
            fetchNotifications();
        }
    }, [mounted]);

    async function fetchNotifications() {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(id: string) {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        // Optionally call API to persist
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, read: true })
            });
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    }

    async function markAllAsRead() {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllRead: true })
            });
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "loan_request":
                return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
            case "repayment":
                return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
            case "confirmation":
                return <Check className="h-4 w-4 text-green-600" />;
            case "overdue":
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    // Prevent hydration mismatch - show static icon until mounted
    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto py-1 px-2 text-xs"
                            onClick={(e) => {
                                e.preventDefault();
                                markAllAsRead();
                            }}
                        >
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {loading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        Loading...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.slice(0, 10).map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex items-start gap-3 p-3 cursor-pointer",
                                    !notification.read && "bg-purple-50"
                                )}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="mt-0.5">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className={cn(
                                        "text-sm leading-tight",
                                        !notification.read && "font-medium"
                                    )}>
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {formatDate(notification.createdAt)}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <div className="w-2 h-2 rounded-full bg-purple-600 mt-1" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
