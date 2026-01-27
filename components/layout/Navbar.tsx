// components/layout/Navbar.tsx - Top navigation bar

"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center px-4 lg:px-6">
                {/* Mobile menu button */}
                <Button variant="ghost" size="icon" className="lg:hidden mr-2">
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                        T
                    </div>
                    <span className="hidden sm:inline-block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        TrustLend
                    </span>
                </Link>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                            2
                        </span>
                    </Button>

                    {/* User Menu */}
                    <UserButton
                        afterSignOutUrl="/sign-in"
                        appearance={{
                            elements: {
                                avatarBox: "h-9 w-9"
                            }
                        }}
                    />
                </div>
            </div>
        </header>
    );
}
