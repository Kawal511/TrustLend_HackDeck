"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Landmark,
    PieChart,
    Wallet,
    FileText,
    Users,
    Mail,
    Hexagon
} from "lucide-react";

const navItems = [
    { icon: LayoutDashboard, href: "/", label: "Home" },
    { icon: Landmark, href: "/borrow", label: "Borrow" },
    { icon: Wallet, href: "/loans", label: "Loans" },
    { icon: PieChart, href: "/profile", label: "Stats" },
    { icon: FileText, href: "/contracts", label: "Contracts" },
    { icon: Users, href: "/network", label: "Network" },
    { icon: Mail, href: "/messages", label: "Messages" },
    { icon: Hexagon, href: "/settings", label: "Settings" },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-4 bg-black text-white px-2 py-2 rounded-2xl shadow-2xl shadow-black/20">
                <div className="pl-4 pr-2 font-bold text-lg hidden md:block">
                    TrustLend
                </div>

                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <div key={item.href} className="relative group">
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "p-3 rounded-xl transition-all hover:bg-white/10 text-white/70 hover:text-white block",
                                        isActive && "bg-chart-1/20 text-chart-1 hover:bg-chart-1/30 hover:text-chart-1"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5", isActive && "text-[#9eff69]")} />
                                </Link>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-[60]">
                                    <div className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
                                        {item.label}
                                    </div>
                                    {/* Arrow */}
                                    <div className="w-2 h-2 bg-black rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-white/10"></div>
                                </div>
                            </div>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
