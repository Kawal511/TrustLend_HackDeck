
import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { FeaturesGrid } from './components/FeaturesGrid';
import { FeatureSection } from './components/FeatureSection';
import { Testimonial } from './components/Testimonial';

import { LargeTextSection } from './components/LargeTextSection';
import logo from './assets/logo.png';

const App: React.FC = () => {
  return (
    <div className="min-h-screen selection:bg-lime-300 site-ombre overflow-hidden">
      <div className="text-white pb-32">
        <Navbar dark />
        <Hero />
      </div>

      <main className="max-w-[1440px] mx-auto px-6 md:px-12 -mt-24 space-y-16">
        <Stats />

        <div className="space-y-20">
          <FeaturesGrid />

          <div className="space-y-8">
            <FeatureSection />
          </div>

          <LargeTextSection />

          <Testimonial />


        </div>
      </main>

      <footer className="py-20 border-t border-white/5 mt-24 text-white/90">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 font-bold text-lg">
            <img src={logo} alt="TrustLend" className="w-20 h-20 object-contain" />
            <span>TrustLend</span>
          </div>
          <div className="flex gap-8 text-sm text-white/50 font-medium">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">My Cards</a>
            <a href="#" className="hover:text-white transition-colors">About Us</a>
          </div>
          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} TrustLend Inc.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
