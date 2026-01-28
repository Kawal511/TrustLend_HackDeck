
import React from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const chartData = [
  { name: 'Mon', val: 100 },
  { name: 'Tue', val: 150 },
  { name: 'Wed', val: 300 },
  { name: 'Thu', val: 200 },
  { name: 'Fri', val: 400 },
  { name: 'Sat', val: 350 },
  { name: 'Sun', val: 500 }
];

export const FeaturesGrid: React.FC = () => {
  return (
    <div className="space-y-8 mb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature 1: Sync Bank (Compact) */}
        <div className="bg-white rounded-[40px] p-7 md:p-9 flex flex-col border border-black/5 h-full">
          <div className="max-w-sm mb-6">
            <h2 className="text-3xl font-bold mb-3 text-[#0A1A3F] tracking-tight leading-tight">Sync your bank & cards securely.</h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Create a custom card that reflects your unique style and personality.
            </p>
          </div>
          <div className="relative h-96 flex flex-col bg-[#F1F3F1] rounded-[32px] overflow-hidden mt-auto border border-black/5">
            <div className="p-5 border-b border-black/5 bg-white/70 backdrop-blur-md">
              <span className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Available Cards</span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {/* HDFC Card */}
              <div className="bg-white p-4 rounded-[24px] shadow-sm border border-black/5 flex items-center justify-between hover:scale-[1.03] transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">HDFC</div>
                  <div>
                    <div className="text-sm font-black text-[#0A1A3F]">₹45,200 <span className="text-[10px] text-gray-400 font-bold ml-1">INR</span></div>
                    <div className="text-[10px] text-gray-400 font-mono tracking-wider">•••• 8821</div>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-500 opacity-90 border-2 border-white"></div>
                  <div className="w-6 h-6 rounded-full bg-orange-400 opacity-90 border-2 border-white"></div>
                </div>
              </div>
              {/* Axis Card */}
              <div className="bg-white p-4 rounded-[24px] shadow-sm border border-black/5 flex items-center justify-between hover:scale-[1.03] transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-900 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-rose-900/20 group-hover:scale-110 transition-transform">AXIS</div>
                  <div>
                    <div className="text-sm font-black text-[#0A1A3F]">₹1,12,000 <span className="text-[10px] text-gray-400 font-bold ml-1">INR</span></div>
                    <div className="text-[10px] text-gray-400 font-mono tracking-wider">•••• 4141</div>
                  </div>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" className="h-3 opacity-80" alt="visa" />
              </div>
              {/* ICICI Card */}
              <div className="bg-white p-4 rounded-[24px] shadow-sm border border-black/5 flex items-center justify-between hover:scale-[1.03] transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">ICICI</div>
                  <div>
                    <div className="text-sm font-black text-[#0A1A3F]">₹24,500 <span className="text-[10px] text-gray-400 font-bold ml-1">INR</span></div>
                    <div className="text-[10px] text-gray-400 font-mono tracking-wider">•••• 5592</div>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-500 opacity-90 border-2 border-white"></div>
                  <div className="w-6 h-6 rounded-full bg-orange-400 opacity-90 border-2 border-white"></div>
                </div>
              </div>
              {/* SBI Card */}
              <div className="bg-white p-4 rounded-[24px] shadow-sm border border-black/5 flex items-center justify-between hover:scale-[1.03] transition-all cursor-pointer group opacity-90">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-700 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-sky-700/20 group-hover:scale-110 transition-transform">SBI</div>
                  <div>
                    <div className="text-sm font-black text-[#0A1A3F]">₹8,900 <span className="text-[10px] text-gray-400 font-bold ml-1">INR</span></div>
                    <div className="text-[10px] text-gray-400 font-mono tracking-wider">•••• 1023</div>
                  </div>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" className="h-3 opacity-80" alt="visa" />
              </div>
            </div>
            {/* Extended Fade overlay at bottom to suggest more */}
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#F1F3F1] to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Feature 2: AI Spending Insights (Small Graph) */}
        <div className="bg-white rounded-[40px] p-7 md:p-9 flex flex-col border border-black/5 shadow-sm h-full">
          <div className="max-w-sm mb-6 flex-grow">
            <h2 className="text-3xl font-bold mb-3 text-[#0A1A3F] tracking-tight leading-tight">AI-driven spending insights</h2>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              Track patterns and analyze finances to optimize your habits.
            </p>
          </div>

          {/* AI Chatbot Section */}
          <div className="bg-gray-50/50 rounded-[28px] p-6 mb-8 border border-black/5 flex flex-col gap-4">
            <div className="flex gap-3 items-end">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">KA</div>
              <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-black/5 max-w-[80%]">
                <p className="text-[11px] text-[#0A1A3F] font-medium leading-relaxed">
                  How much did I spend on dining out this week compared to last?
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-end flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center text-black flex-shrink-0 shadow-lg shadow-lime-400/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="bg-[#1C1E1C] p-4 rounded-3xl rounded-br-none shadow-xl max-w-[85%] border border-white/5">
                <p className="text-[11px] text-white/90 leading-relaxed">
                  You spent <span className="text-lime-400 font-bold">$142.50</span> this week, which is <span className="text-emerald-400 font-bold">12% less</span> than last week. Great job staying on budget! 🚀
                </p>
              </div>
            </div>

            <div className="flex justify-center mt-1">
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-black/10"></div>
                <div className="w-1 h-1 rounded-full bg-black/10"></div>
                <div className="w-1 h-1 rounded-full bg-black/10"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-auto">
            <div className="bg-[#D0F1C9] rounded-[24px] p-3 flex flex-col items-center text-center h-40 justify-center hover:scale-[1.03] hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group cursor-pointer border border-transparent hover:border-emerald-200">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-[9px] font-extrabold text-black/40 uppercase tracking-widest leading-none mb-2">Freelance</div>
              <div className="text-base font-bold text-[#0A1A3F]">$1,500</div>
            </div>
            <div className="bg-[#E2DBFF] rounded-[24px] p-3 flex flex-col items-center text-center h-40 justify-center hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group cursor-pointer border border-transparent hover:border-indigo-200">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-[9px] font-extrabold text-black/40 uppercase tracking-widest leading-none mb-2">Salary</div>
              <div className="text-base font-bold text-[#0A1A3F]">$4,000</div>
            </div>
            <div className="bg-[#FFE2E2] rounded-[24px] p-3 flex flex-col items-center text-center h-40 justify-center hover:scale-[1.03] hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 group cursor-pointer border border-transparent hover:border-rose-200">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-[9px] font-extrabold text-black/40 uppercase tracking-widest leading-none mb-2">Grocery</div>
              <div className="text-base font-bold text-[#0A1A3F]">$4,000</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 3: Create account Section */}
      <div className="bg-white rounded-[40px] border border-black/5 overflow-hidden flex flex-col lg:flex-row min-h-[550px] relative shadow-sm">
        {/* Wireframe World Map Background */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 1000 480" className="w-[110%] h-[110%] object-contain text-gray-200" fill="none" stroke="currentColor" strokeWidth="0.8">
            <path d="M120,60 L140,40 L160,30 L180,45 L200,40 L240,60 L280,80 L290,120 L270,160 L240,200 L210,240 L180,245 L150,230 L120,200 L100,150 L110,100 Z" strokeOpacity="0.4" />
            <path d="M150,50 L150,150 M180,45 L180,245 M120,100 L240,100 M110,150 L270,150" strokeOpacity="0.1" />
            <path d="M220,245 L260,260 L280,300 L290,360 L270,420 L240,460 L210,440 L190,380 L200,300 Z" strokeOpacity="0.4" />
            <path d="M430,160 L480,140 L540,150 L580,200 L590,280 L560,340 L500,400 L460,380 L440,320 L420,240 Z" strokeOpacity="0.4" />
            <path d="M420,160 L450,120 L510,80 L590,60 L690,60 L810,80 L910,100 L960,160 L940,240 L870,280 L790,280 L710,260 L610,240 L510,220 L410,200 Z" strokeOpacity="0.4" />
            <path d="M810,340 L890,330 L930,370 L910,430 L840,440 L800,390 Z" strokeOpacity="0.4" />
          </svg>
        </div>

        {/* Left Side: Content */}
        <div className="w-full lg:w-[45%] p-10 lg:p-14 z-10 flex flex-col justify-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-5 text-[#0A1A3F] tracking-tight leading-tight">
            Create your account<br />in minutes
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-md leading-relaxed">
            Create a custom card that reflects your unique style and personality. Choose from colors and designs.
          </p>

          <div className="space-y-5">
            <div className="flex gap-4 items-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white shadow border border-black/5 flex items-center justify-center font-bold text-[#0A1A3F]">1</div>
              <div className="flex flex-col">
                <h4 className="font-bold text-black text-sm">Download the app</h4>
                <p className="text-gray-400 text-[11px]">Available on iOS and Android.</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white shadow border border-black/5 flex items-center justify-center font-bold text-[#0A1A3F]">2</div>
              <div className="flex flex-col">
                <h4 className="font-bold text-black text-sm">Verify your identity</h4>
                <p className="text-gray-400 text-[11px]">Quick KYC in under 2 minutes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Visuals */}
        <div className="flex-1 relative z-10 flex items-center justify-center min-h-[500px]">
          {/* Bubble 1: Top Left */}
          <div className="absolute top-[5%] left-[0%] z-40 animate-float-slow bg-white rounded-full p-2 pl-2 pr-6 flex items-center gap-3 shadow-xl border border-black/5">
            <img src="https://i.pravatar.cc/100?u=1" className="w-10 h-10 rounded-full object-cover border-2 border-[#D0F1C9]" alt="User" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 leading-none">New account</span>
              <span className="text-sm font-black text-emerald-600">₹12,46,008</span>
            </div>
          </div>

          {/* Bubble 2: Bottom Right */}
          <div className="absolute bottom-[10%] right-[0%] z-40 animate-float-slow bg-white rounded-full p-2 pl-2 pr-6 flex items-center gap-3 shadow-xl border border-black/5" style={{ animationDelay: '1.5s' }}>
            <img src="https://i.pravatar.cc/100?u=2" className="w-10 h-10 rounded-full object-cover border-2 border-[#E2DBFF]" alt="User" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 leading-none">New account</span>
              <span className="text-sm font-black text-emerald-600">₹8,06,085</span>
            </div>
          </div>

          {/* Bubble 3: Top Right */}
          <div className="absolute top-[20%] right-[-5%] z-40 animate-float-slow bg-white rounded-full p-2 pl-2 pr-6 flex items-center gap-3 shadow-xl border border-black/5" style={{ animationDelay: '3s' }}>
            <img src="https://i.pravatar.cc/100?u=3" className="w-10 h-10 rounded-full object-cover border-2 border-[#FFE2E2]" alt="User" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 leading-none">New account</span>
              <span className="text-sm font-black text-emerald-600">₹41,390</span>
            </div>
          </div>

          {/* Bubble 4: Middle Left */}
          <div className="absolute top-[50%] left-[-10%] z-40 animate-float-slow bg-white rounded-full p-2 pl-2 pr-6 flex items-center gap-3 shadow-xl border border-black/5" style={{ animationDelay: '0.5s' }}>
            <img src="https://i.pravatar.cc/100?u=4" className="w-10 h-10 rounded-full object-cover border-2 border-lime-200" alt="User" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 leading-none">New account</span>
              <span className="text-sm font-black text-emerald-600">₹2,37,374</span>
            </div>
          </div>

          {/* Bubble 5: Bottom Left */}
          <div className="absolute bottom-[5%] left-[10%] z-40 animate-float-slow bg-white rounded-full p-2 pl-2 pr-6 flex items-center gap-3 shadow-xl border border-black/5" style={{ animationDelay: '4s' }}>
            <img src="https://i.pravatar.cc/100?u=5" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200" alt="User" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 leading-none">New account</span>
              <span className="text-sm font-black text-emerald-600">₹5,12,000</span>
            </div>
          </div>

          <div className="relative z-30 w-full max-w-[460px] px-4 perspective-1000 transform scale-110 lg:scale-125">
            <div className="bg-gradient-to-br from-[#1B1E3F] via-[#101229] to-[#0A0C1A] w-full aspect-[1.58/1] rounded-[28px] p-8 text-white shadow-2xl transform rotate-[6deg] relative overflow-hidden border border-white/20 group">
              <div className="flex justify-between items-start mb-10 relative z-10">
                <span className="text-2xl font-black italic tracking-tight">TrustLend</span>
                <div className="w-12 h-8 bg-gradient-to-br from-[#F5D76E] via-[#E6B980] to-[#AF8231] rounded-md shadow-inner"></div>
              </div>
              <div className="text-2xl font-mono tracking-[0.25em] mb-12 relative z-10">4567 •••• 8901</div>
              <div className="flex justify-between items-end relative z-10">
                <div className="text-[9px] uppercase tracking-[0.25em] font-bold text-gray-400/80">Sanzida A.</div>
                <div className="text-[9px] uppercase tracking-[0.25em] font-bold text-gray-400/80">09/28</div>
              </div>
              {/* Shimmer Effect Layer */}
              <div className="shimmer-overlay"></div>
              {/* Card Texture Overlay */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
