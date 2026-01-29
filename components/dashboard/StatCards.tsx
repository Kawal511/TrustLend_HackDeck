"use client";

import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatCardsProps {
    totalLent: number;
    totalBorrowed: number;
}

export function StatCards({ totalLent, totalBorrowed }: StatCardsProps) {
    const net = totalLent - totalBorrowed;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Cash flow</h2>
                    <p className="text-gray-500 mt-1">Cash coming in and going out of your business</p>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-chart-1"></div>
                        <span>Inflow</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-black"></div>
                        <span>Outflow</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Inflow Card (Lent) */}
                <div className="bg-[#9eff69] rounded-[2rem] p-8 aspect-square flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transition-transform hover:-translate-y-1">
                    <div className="mb-4">
                        <ArrowDownLeft className="h-8 w-8 text-black" />
                    </div>
                    <p className="font-medium text-black mb-1">Inflow</p>
                    <h3 className="text-4xl font-black text-black tracking-tight">{formatCurrency(totalLent)}</h3>
                </div>

                {/* Outflow Card (Borrowed) */}
                <div className="bg-[#a5b4fc] rounded-[2rem] p-8 aspect-square flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transition-transform hover:-translate-y-1">
                    <div className="mb-4">
                        <ArrowUpRight className="h-8 w-8 text-black" />
                    </div>
                    <p className="font-medium text-black mb-1">Outflow</p>
                    <h3 className="text-4xl font-black text-black tracking-tight">{formatCurrency(totalBorrowed)}</h3>
                </div>

                {/* Net Changes Card */}
                <div className="bg-black rounded-[2rem] p-8 aspect-square flex flex-col items-center justify-center text-center shadow-xl border-2 border-black transition-transform hover:-translate-y-1">
                    <div className="mb-4">
                        <ArrowLeftRight className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-medium text-white mb-1">Net Changes</p>
                    <h3 className={cn(
                        "text-4xl font-black tracking-tight",
                        net >= 0 ? "text-white" : "text-red-400"
                    )}>
                        {formatCurrency(net)}
                    </h3>
                </div>
            </div>
        </div>
    );
}
