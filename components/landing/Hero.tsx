
import React from 'react';
import Link from 'next/link';

export const Hero: React.FC = () => {
  return (
    <section className="px-6 md:px-12 pt-12 pb-48 flex flex-col lg:flex-row items-center justify-between gap-16 relative overflow-hidden">
      <div className="max-w-3xl z-10">
        <h1 className="text-huge font-bold leading-none mb-6">
          Effortless Finance<br />
          <span className="text-gray-400">for a Smarter Future</span>
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-xl">
          Track expenses, optimize budgets, and grow wealth with AI-driven insights—secure and seamless finance solutions in one platform.
        </p>

        <div className="flex flex-wrap items-center gap-8">
          <Link href="/" className="bg-lime-400 hover:bg-lime-500 text-black px-8 py-4 rounded-full font-bold flex items-center gap-3 transition-all group">
            Start for free
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1C1E1C] overflow-hidden bg-gray-800">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                </div>
              ))}
            </div>
            <div>
              <div className="font-bold text-xl">10 Million+</div>
              <div className="text-xs text-gray-500">Global users trust us</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-lg lg:max-w-none flex-1 flex justify-center lg:justify-end min-h-[400px]">
        {/* Card 1: Emerald Green (Back Layer) */}
        <div className="absolute top-[10%] right-[30%] animate-float transition-all duration-500 opacity-60 scale-90" style={{ animationDelay: '2s' }}>
          <div className="w-80 h-48 bg-gradient-to-br from-emerald-600 via-emerald-800 to-emerald-950 rounded-[32px] p-7 text-white shadow-2xl relative overflow-hidden border border-white/10 group rotate-[-12deg]">
            <div className="flex justify-between items-start mb-10 relative z-10">
              <span className="text-lg font-bold tracking-tight italic">TrustLend</span>
              <div className="w-10 h-7 bg-white/20 rounded-md backdrop-blur-md border border-white/10"></div>
            </div>
            <div className="text-xl font-mono tracking-[0.2em] mb-5 select-none relative z-10">2945 •••• •••• 1102</div>
            <div className="shimmer-overlay"></div>
          </div>
        </div>

        {/* Card 2: Royal Purple (Middle Layer) */}
        <div className="absolute bottom-[10%] right-[10%] animate-float transition-all duration-500 opacity-80 scale-95" style={{ animationDelay: '1s' }}>
          <div className="w-80 h-48 bg-gradient-to-br from-indigo-600 via-purple-800 to-fuchsia-950 rounded-[32px] p-7 text-white shadow-2xl relative overflow-hidden border border-white/10 group rotate-[12deg]">
            <div className="flex justify-between items-start mb-10 relative z-10">
              <span className="text-lg font-bold tracking-tight italic">TrustLend</span>
              <div className="w-10 h-7 bg-white/20 rounded-md backdrop-blur-md border border-white/10"></div>
            </div>
            <div className="text-xl font-mono tracking-[0.2em] mb-5 select-none relative z-10">8812 •••• •••• 9943</div>
            <div className="shimmer-overlay"></div>
          </div>
        </div>

        {/* Card 3: Onyx Black (Front & Main) */}
        <div className="relative animate-float z-20">
          <div className="w-80 h-48 bg-gradient-to-br from-[#1B1E3F] via-[#101229] to-[#0A0C1A] rounded-[32px] p-7 text-white shadow-2xl relative overflow-hidden border border-white/20 group scale-110">
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight italic">TrustLend</span>
                <span className="text-[7px] font-extrabold tracking-[0.2em] opacity-40">PREMIUM MEMBER</span>
              </div>
              <div className="w-10 h-7 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-md opacity-90 shadow-inner"></div>
            </div>
            <div className="text-xl font-mono tracking-[0.2em] mb-5 select-none relative z-10">5789 •••• •••• 2847</div>
            <div className="flex justify-between items-end relative z-10">
              <div>
                <div className="text-[7px] opacity-30 uppercase tracking-widest font-bold mb-1">Card holder</div>
                <div className="text-xs font-semibold tracking-wide">Sanzida A.</div>
              </div>
              <div className="text-right">
                <div className="text-[7px] opacity-30 uppercase tracking-widest font-bold mb-1">Expire Date</div>
                <div className="text-xs font-semibold tracking-wide">04/25</div>
              </div>
            </div>
            {/* Shimmer Effect Layer */}
            <div className="shimmer-overlay"></div>
            {/* Subtle Texture Layer */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
          </div>
        </div>

        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-lime-400/5 rounded-full blur-3xl"></div>
      </div>

    </section>
  );
};
