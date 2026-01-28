
import React from 'react';
import { PhoneMockup } from './PhoneMockup';
import { SmarterFinanceGraphic } from './SmarterFinanceGraphic';

export const FeatureSection: React.FC = () => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
      {/* Left Column: Phone Mockup in Purple Space */}
      <div className="lg:col-span-5 bg-[#E2DBFF] rounded-[48px] p-10 overflow-hidden flex flex-col items-center justify-center relative min-h-[600px] border border-black/5">
        <PhoneMockup />
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Right Column: Smarter Finance in Green Space */}
      <div className="lg:col-span-7 bg-[#D0F1C9] rounded-[48px] p-12 overflow-hidden relative flex flex-col min-h-[600px] border border-black/5">
        <div className="flex flex-col h-full">
          <div className="mb-12">
            <h2 className="text-5xl font-bold tracking-tight text-black mb-10 leading-[1.1]">
              Smarter Finance<br />Better Decisions
            </h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2"></div>
                <p className="text-gray-700 font-medium text-lg leading-tight">
                  Get 3% Cash Back On Everyday Purchases, 2% On Everything Else
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2"></div>
                <p className="text-gray-700 font-medium text-lg leading-tight">
                  Extra Spending Power When You Have Rewards Checking Through Upgrade
                </p>
              </li>
            </ul>
          </div>
          
          <div className="mt-auto relative flex justify-end">
             <SmarterFinanceGraphic />
          </div>
        </div>
      </div>
    </section>
  );
};
