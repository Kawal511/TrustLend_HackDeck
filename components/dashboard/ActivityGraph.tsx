"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";

// Mock data for the graph - in a real app this would come from the API
const data = [
    { name: 'Nov 20', value: 40000 },
    { name: 'Dec 20', value: 30000 },
    { name: 'Jan 21', value: 65000 },
    { name: 'Feb 21', value: 45000 },
    { name: 'Mar 21', value: 80000 },
    { name: 'Apr 21', value: 55000 },
];

interface ActivityGraphProps {
    inflowToday: number;
    outflowToday: number;
}

export function ActivityGraph({ inflowToday, outflowToday }: ActivityGraphProps) {
    return (
        <div className="bg-black rounded-[2rem] p-8 text-white shadow-xl h-full flex flex-col justify-between relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start z-10">
                <div>
                    <p className="text-[#9eff69] font-medium mb-1">+12%</p>
                    <h3 className="text-5xl font-bold mb-1">192</h3>
                    <p className="text-gray-400 text-sm">Inflow Today</p>
                </div>
                <div className="text-right">
                    <h3 className="text-2xl font-bold">{formatCurrency(8000)}</h3>
                    <p className="text-gray-400 text-xs">Target</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-48 mt-8 w-full z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#9eff69" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#9eff69" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#9ca3af' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#9eff69"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Stats */}
            <div className="flex gap-12 mt-6 z-10">
                <div>
                    {/* Fake bar chart icon */}
                    <div className="flex items-end gap-1 h-6 mb-2">
                        <div className="w-1 h-2 bg-gray-600 rounded-sm"></div>
                        <div className="w-1 h-4 bg-gray-600 rounded-sm"></div>
                        <div className="w-1 h-3 bg-gray-600 rounded-sm"></div>
                        <div className="w-1 h-6 bg-[#9eff69] rounded-sm"></div>
                        <div className="w-1 h-4 bg-gray-600 rounded-sm"></div>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(inflowToday)}</div>
                    <p className="text-gray-400 text-xs">Inflow</p>
                </div>
                <div>
                    {/* Fake bar chart icon */}
                    <div className="flex items-end gap-1 h-6 mb-2">
                        <div className="w-1 h-3 bg-gray-600 rounded-sm"></div>
                        <div className="w-1 h-5 bg-[#a5b4fc] rounded-sm"></div>
                        <div className="w-1 h-2 bg-gray-600 rounded-sm"></div>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(outflowToday)}</div>
                    <p className="text-gray-400 text-xs">Outflow</p>
                </div>
            </div>

            {/* Background dates (absolute) */}
            <div className="absolute bottom-6 right-8 flex gap-6 text-[10px] text-gray-600">
                <span>Nov 20</span>
                <span>Dec 20</span>
                <span>Jan 21</span>
                <span>Feb 21</span>
                <span>Mar 21</span>
            </div>
        </div>
    );
}
