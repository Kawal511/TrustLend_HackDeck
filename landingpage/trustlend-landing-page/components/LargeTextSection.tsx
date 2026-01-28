
import React from 'react';

export const LargeTextSection: React.FC = () => {
  return (
    <section className="w-screen relative left-1/2 -ml-[50vw] bg-white border-y border-black/5 py-24 md:py-32 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-large font-bold tracking-tight text-[#0A1A3F] inline-block align-middle">
          Now we've made <span className="text-gray-400 mx-2">—</span> capital accessible
          to even more companies directly through
        </h2>
        <div className="mt-8">
          <h2 className="text-large font-bold tracking-tight">
            <span className="text-lime-600">automated</span> global infrastructure.
          </h2>
        </div>

        <div className="mt-16 flex justify-center">
          <div className="h-1.5 w-32 bg-gradient-to-r from-transparent via-lime-400/20 to-transparent rounded-full font-bold uppercase text-[10px] tracking-[0.3em] flex items-center justify-center text-lime-700">
            TrustLend Engine
          </div>
        </div>
      </div>
    </section>
  );
};
