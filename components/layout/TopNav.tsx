"use client";

import React from "react";
import { Search, Calendar, Bell, MessageSquare } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ExportDataButton } from "@/components/landing/ExportDataButton";

const tabs = [
    { name: "Overview", href: "/dashboard" },
    { name: "Loans", href: "/loans" },
    { name: "Requests", href: "/borrow" },
    { name: "My Network", href: "/network" },
];

export function TopNav() {
    const pathname = usePathname();

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    return (
        <header className="bg-background px-8 pt-8 pb-4">
            <div className="flex flex-col gap-6">
                {/* Top Row: Title & Actions */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <h1 className="text-3xl font-bold tracking-tight">TrustLend</h1>
                    </Link>

                    <div className="flex items-center gap-4">
                        {mounted && <ExportDataButton />}
                        <div className="relative w-64 hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search loans or people"
                                className="pl-10 h-10 rounded-full border-2 border-gray-200 bg-white focus-visible:ring-0 focus-visible:border-black transition-colors"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="rounded-full border-2 w-10 h-10" asChild>
                                <Link href="/calendar">
                                    <Calendar className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-full border-2 w-10 h-10 relative" asChild>
                                <Link href="/notifications">
                                    <Bell className="h-4 w-4" />
                                    <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-full border-2 w-10 h-10" asChild>
                                <Link href="/messages">
                                    <MessageSquare className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="ml-2">
                            <UserButton afterSignOutUrl="/sign-in" appearance={{
                                elements: {
                                    avatarBox: "h-10 w-10"
                                }
                            }} />
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Tabs */}
                <div className="flex items-center gap-8 border-b border-gray-200 overflow-x-auto">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative whitespace-nowrap",
                                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.name}
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-chart-1 rounded-t-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </header>
    );
}
