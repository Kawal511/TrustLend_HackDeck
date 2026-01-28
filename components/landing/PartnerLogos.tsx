
import React from 'react';

export const PartnerLogos: React.FC = () => {
  return (
    <section className="py-20 text-center">
      <div className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-12">
        Meet Our Esteemed Partners & Affiliates
      </div>
      <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        <span className="text-2xl font-bold tracking-tighter">stripe</span>
        <div className="flex items-center gap-1">
           <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
           <div className="w-4 h-4 bg-red-400 rounded-full -ml-2"></div>
           <span className="text-2xl font-bold tracking-tighter">mastercard</span>
        </div>
        <span className="text-2xl font-bold tracking-tighter">PayPal</span>
        <span className="text-2xl font-bold tracking-tighter">G Pay</span>
        <span className="text-2xl font-bold tracking-tighter">Skrill</span>
        <span className="text-2xl font-bold tracking-tighter">Payoneer</span>
      </div>
    </section>
  );
};
