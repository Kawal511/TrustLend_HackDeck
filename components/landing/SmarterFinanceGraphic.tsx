
import React from 'react';

export const SmarterFinanceGraphic: React.FC = () => {
  return (
    <div className="relative w-full h-[450px] flex items-center justify-center scale-90 md:scale-100">
      {/* Module 1: Available Cards */}
      <div className="absolute left-[8%] bottom-[15%] w-72 h-44 bg-white/60 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl border border-white/40 transform -rotate-2 z-10 hover:z-30 hover:scale-105 transition-all duration-300">
        <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4">Available cards</div>
        <div className="bg-white/80 rounded-2xl p-4 flex items-center justify-between border border-black/5 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              <div className="w-5 h-5 bg-orange-400 rounded-full border-2 border-white shadow-sm"></div>
              <div className="w-5 h-5 bg-red-400 rounded-full opacity-80 border-2 border-white shadow-sm"></div>
            </div>
            <div className="font-black text-sm text-[#0A1A3F]">₹98,500 <span className="text-[10px] text-gray-400 font-bold">INR</span></div>
          </div>
          <div className="text-[10px] text-gray-400 font-black">...4141</div>
        </div>
      </div>

      {/* Module 2: Spending Dashboard */}
      <div className="absolute right-[8%] top-[10%] w-80 h-72 bg-white rounded-[40px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] z-20 border border-black/5 transform rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-500">
        <div className="flex justify-between items-start mb-6">
          <div className="text-sm text-gray-500 font-black tracking-tight">Spent this day</div>
          <div className="flex items-center gap-2 bg-gray-50 border border-black/5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
            Week
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="text-5xl font-black text-[#0A1A3F] mb-6">₹259.75</div>

        <div className="relative h-28 w-full">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
            <path
              d="M 0 35 Q 15 35, 25 25 T 45 25 T 65 15 T 85 25 L 100 15"
              fill="none"
              stroke="#0A1A3F"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="65" cy="15" r="4.5" fill="white" stroke="#0A1A3F" strokeWidth="3" />
            <g transform="translate(60, -14)">
              <rect x="0" y="0" width="40" height="16" rx="6" fill="#D0F1C9" />
              <text x="20" y="11" textAnchor="middle" fontSize="6" fontWeight="900" fill="black">₹259.75</text>
            </g>
          </svg>

          <div className="flex justify-between mt-8 text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] px-1">
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>
        </div>
      </div>
    </div>
  );
};
