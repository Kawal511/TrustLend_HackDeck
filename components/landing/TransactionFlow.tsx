
import React from 'react';

export const TransactionFlow: React.FC = () => {
  return (
    <div className="relative h-full w-full flex-1 flex flex-col justify-between">
      {/* Top Section: David's Payment */}
      <div className="relative h-32">
        <div className="absolute top-0 right-4 md:right-12 flex flex-col items-end">
          <span className="bg-[#E2DBFF] text-[10px] font-bold px-3 py-1 rounded-full mb-2">David</span>
          <div className="bg-white shadow-xl rounded-2xl px-6 py-4 text-sm font-medium whitespace-nowrap">
            Received Payment 🥳
          </div>
          {/* Subtle star near David */}
          <div className="absolute -top-10 -left-6">
            <svg className="w-8 h-8 text-black opacity-20" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Middle/Lower Section: Adrian's Sent Status */}
      <div className="flex items-center justify-center gap-4 mb-20">
        <div className="relative flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-2xl">
             <img src="https://picsum.photos/seed/adrian/200" alt="Adrian" className="w-full h-full object-cover" />
          </div>
          <div className="relative">
             <div className="absolute -top-8 left-0 font-bold text-xs">Adrian</div>
             <div className="bg-white shadow-xl rounded-full px-8 py-5 text-sm font-medium">
                Upfront sent — ✌️
             </div>
          </div>
        </div>
      </div>

      {/* Progress Bar (Restored) */}
      <div className="w-full mt-auto">
        <div className="w-full h-5 bg-white/40 rounded-full border border-black/5 overflow-hidden relative">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent h-full w-[200%] animate-slide"></div>
           <div className="h-full w-2/3 bg-black rounded-full transition-all duration-1000"></div>
        </div>
      </div>

      <style>{`
        @keyframes slide {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .animate-slide {
          animation: slide 4s linear infinite;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 15px,
            rgba(255,255,255,0.3) 15px,
            rgba(255,255,255,0.3) 30px
          );
        }
      `}</style>
    </div>
  );
};
