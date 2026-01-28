import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Stats } from '@/components/landing/Stats';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { FeatureSection } from '@/components/landing/FeatureSection';
import { Testimonial } from '@/components/landing/Testimonial';
import { LargeTextSection } from '@/components/landing/LargeTextSection';
import './landing.css';

const LandingPage = () => {
    return (
        <div className="min-h-screen selection:bg-lime-300 site-ombre overflow-hidden font-sans text-slate-900">
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

            <footer className="py-20 border-t border-white/5 mt-24 text-white/90 bg-[#1C1E1C]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 font-bold text-lg">
                        <img src="/landing/logo.png" alt="TrustLend" className="w-20 h-20 object-contain" />
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

export default LandingPage;
