// components/layout/Sidebar.tsx - Side navigation

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Wallet,
    PlusCircle,
    User,
    Settings,
    TrendingUp
} from "lucide-react";

const navItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard
    },
    {
        title: "My Loans",
        href: "/loans",
        icon: Wallet
    },
    {
        title: "New Loan",
        href: "/loans/new",
        icon: PlusCircle
    },
    {
        title: "Trust Score",
        href: "/profile",
        icon: TrendingUp
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings
    }
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r bg-white lg:block">
            <div className="flex h-full flex-col gap-2 p-4">
                <nav className="flex flex-col gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100",
                                    isActive && "bg-purple-50 text-purple-700 font-medium"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5",
                                    isActive ? "text-purple-600" : "text-gray-500"
                                )} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* Quick Stats Card */}
                <div className="mt-auto rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 p-4 text-white">
                    <h4 className="font-semibold">Quick Tip</h4>
                    <p className="text-sm text-white/80 mt-1">
                        Repay loans on time to build your trust score and unlock higher limits.
                    </p>
                </div>
            </div>
        </aside>
    );
}
