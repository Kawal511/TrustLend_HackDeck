// components/layout/Sidebar.tsx - Side navigation

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
    LayoutDashboard,
    Wallet,
    PlusCircle,
    TrendingUp,
    Settings,
    FileText,
    Network,
    Shield,
    Sparkles,
    Users,
    HandCoins
} from "lucide-react";

const mainNavItems = [
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
        title: "Request Loan",
        href: "/borrow",
        icon: HandCoins
    },
    {
        title: "Borrowers",
        href: "/borrowers",
        icon: Users
    },
    {
        title: "Trust Score",
        href: "/profile",
        icon: TrendingUp
    },
    {
        title: "Verification",
        href: "/verification",
        icon: Shield
    }
];

const aiFeatures = [
    {
        title: "AI Contracts",
        href: "/contracts/new",
        icon: FileText
    },
    {
        title: "Trust Network",
        href: "/network",
        icon: Network
    }
];

const adminItems = [
    {
        title: "Fraud Detection",
        href: "/admin/fraud",
        icon: Shield
    }
];

const settingsItems = [
    {
        title: "Settings",
        href: "/settings",
        icon: Settings
    }
];

export function Sidebar() {
    const pathname = usePathname();

    const renderNavItem = (item: typeof mainNavItems[0] & { badge?: string }) => {
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
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                    <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                        item.badge === "AI" && "bg-purple-100 text-purple-700",
                        item.badge === "NEW" && "bg-green-100 text-green-700",
                        item.badge === "ADMIN" && "bg-red-100 text-red-700"
                    )}>
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r bg-white lg:block">
            <div className="flex h-full flex-col gap-2 p-4">
                {/* Main Navigation */}
                <nav className="flex flex-col gap-1">
                    {mainNavItems.map(renderNavItem)}
                </nav>

                <Separator className="my-2" />

                {/* AI Features */}
                <div>
                    <h3 className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI Features
                    </h3>
                    <nav className="flex flex-col gap-1 mt-1">
                        {aiFeatures.map(renderNavItem)}
                    </nav>
                </div>

                <Separator className="my-2" />

                {/* Admin */}
                <div>
                    <h3 className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">
                        Admin
                    </h3>
                    <nav className="flex flex-col gap-1 mt-1">
                        {adminItems.map(renderNavItem)}
                    </nav>
                </div>

                <Separator className="my-2" />

                {/* Settings */}
                <nav className="flex flex-col gap-1">
                    {settingsItems.map(renderNavItem)}
                </nav>

                {/* Quick Stats Card */}
                <div className="mt-auto rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 p-4 text-white">
                    <h4 className="font-semibold flex items-center gap-1">
                        <Sparkles className="h-4 w-4" /> AI-Powered
                    </h4>
                    <p className="text-sm text-white/80 mt-1">
                        Generate contracts, visualize networks, and detect fraud with AI.
                    </p>
                </div>
            </div>
        </aside>
    );
}

