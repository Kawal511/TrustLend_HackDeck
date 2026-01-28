
import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const data = [
  { val: 100 }, { val: 200 }, { val: 150 }, { val: 300 },
  { val: 250 }, { val: 400 }, { val: 380 }, { val: 500 },
  { val: 450 }, { val: 600 }, { val: 550 }, { val: 700 }
];

export const PhoneMockup: React.FC = () => {
  return (
    <div className="w-[280px] h-[580px] bg-black rounded-[48px] p-3 shadow-2xl relative">
      {/* Notch */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-10 flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-white/10"></div>
        <div className="w-10 h-1 rounded-full bg-white/10"></div>
      </div>

      <div className="w-full h-full bg-white rounded-[38px] overflow-hidden p-5 flex flex-col font-sans">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pt-6">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center relative">
              <div className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></div>
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">KA</div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">Welcome back, Kawaljeet!</h2>
          <p className="text-[10px] text-gray-400">Here's your lending overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] font-medium text-gray-400 uppercase">Total Lent</span>
              <div className="p-1 bg-purple-50 rounded-lg">
                <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-sm font-bold">$100.00</div>
            <div className="text-[7px] text-gray-400">1 active loans</div>
          </div>
          <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] font-medium text-gray-400 uppercase">Balance</span>
              <div className="p-1 bg-emerald-50 rounded-lg">
                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="text-sm font-bold">$100.00</div>
            <div className="text-[7px] text-gray-400">Owed to you</div>
          </div>
        </div>

        {/* Trust Score Card */}
        <div className="bg-[#F9FAFB] border border-gray-100 p-4 rounded-3xl mb-6 flex flex-col items-center">
          <h3 className="text-[10px] font-bold text-gray-700 uppercase mb-4 tracking-wider">Your Trust Score</h3>
          <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#E5E7EB" strokeWidth="6" fill="transparent" />
              <circle cx="48" cy="48" r="40" stroke="#4F46E5" strokeWidth="6" strokeDasharray="251.2" strokeDashoffset="83.7" fill="transparent" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold leading-none">100</span>
              <span className="text-[8px] text-gray-400">/ 150</span>
            </div>
          </div>
          <div className="bg-indigo-600 text-white text-[8px] px-3 py-1 rounded-full font-bold mb-3 uppercase tracking-widest">Platinum Tier</div>
          <div className="grid grid-cols-2 w-full gap-2 border-t border-gray-100 pt-3">
            <div className="text-center">
              <div className="text-[9px] font-bold text-gray-900">$5,000.00</div>
              <div className="text-[7px] text-gray-400">Max Loan</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] font-bold text-gray-900">10</div>
              <div className="text-[7px] text-gray-400">Active Loans</div>
            </div>
          </div>
        </div>

        {/* Loans Given Part */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-bold text-gray-900">Recent Activity</h3>
            <span className="text-[8px] text-indigo-600 font-bold uppercase">View All</span>
          </div>
          <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs">TB</div>
              <div>
                <div className="text-[10px] font-bold text-gray-900">Test Borrower</div>
                <div className="text-[8px] text-amber-500 font-medium tracking-tight">Gold 85</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-gray-900">$100.00</div>
              <div className="text-[7px] text-emerald-500 font-bold">Active</div>
            </div>
          </div>
        </div>

        {/* Bottom Nav Mockup */}
        <div className="mt-auto pt-4 flex justify-around border-t border-gray-50 -mx-5 px-5">
          <div className="w-4 h-4 text-indigo-600">
            <svg fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
          </div>
          <div className="w-4 h-4 text-gray-300"><svg fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg></div>
          <div className="w-4 h-4 text-gray-300"><svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" /></svg></div>
          <div className="w-4 h-4 text-gray-300"><svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg></div>
        </div>
      </div>
    </div>
  );
};
