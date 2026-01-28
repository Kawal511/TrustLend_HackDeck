"use client";

import React, { useState } from 'react';

const reviews = [
  {
    name: 'Lavina Shah',
    role: 'Senior Financial Advisor',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800',
    text: '"TrustLend has been a game-changer for my personal savings. The AI insights helped me identify where I was overspending and helped me save ₹40,000 in just the first month!"'
  },
  {
    name: 'Ariana James',
    role: 'Founder at Craftify',
    image: 'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?auto=format&fit=crop&q=80&w=800',
    text: '"Managing business expenses used to be a nightmare. Now with TrustLend\'s seamless wallet sync, our quarterly audits take half the time they used to."'
  },
  {
    name: 'Michael Chen',
    role: 'Independent Designer',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800',
    text: '"The speed of transactions and the beautiful interface make it a joy to use daily. Finally, a finance app that looks as good as it works for professionals like me."'
  }
];

export const Testimonial: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);

  const handleNext = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
      setFade(false);
    }, 300);
  };

  const handlePrev = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
      setFade(false);
    }, 300);
  };

  const currentReview = reviews[currentIndex];

  return (
    <section className="bg-white rounded-[48px] p-12 md:p-20 mb-20 border border-black/5 relative overflow-hidden">
      <div className="text-center mb-12">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-lime-600 mb-3">Testimonials</h3>
        <h2 className="text-4xl font-black text-[#0A1A3F] tracking-tight">Customer Reviews</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className={`w-full aspect-[4/5] max-w-sm mx-auto lg:mx-0 rounded-[32px] overflow-hidden bg-gray-100 transition-opacity duration-300 ${fade ? 'opacity-0' : 'opacity-100'}`}>
            <img
              src={currentReview.image}
              alt={currentReview.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className={`transition-all duration-300 ${fade ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
            Join 16M+ Users Managing Money Smarter with Us
          </h2>
          <div className="bg-[#F8F9F8] rounded-[32px] p-8 mb-10 border border-black/5">
            <p className="text-gray-500 text-lg italic leading-relaxed mb-6">
              {currentReview.text}
            </p>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-xl">{currentReview.name}</div>
                <div className="text-sm text-gray-400">{currentReview.role}</div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePrev}
                  className="w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center text-black hover:bg-lime-400 active:bg-lime-500 active:scale-90 transition-all shadow-sm group"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center text-black hover:bg-[#E2DBFF] active:bg-indigo-300 active:scale-90 transition-all shadow-sm group"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
