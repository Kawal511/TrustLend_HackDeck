import React from 'react';
import Link from 'next/link';

interface NavbarProps {
  dark?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ dark }) => {
  return (
    <nav className={`px-6 md:px-12 py-8 flex items-center justify-between transition-colors ${dark ? 'text-white' : 'text-black'}`}>
      <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight">
        <img src="/landing/logo.png" alt="TrustLend" className="w-24 h-24 object-contain" />
        <span>TrustLend</span>
      </Link>

      <div className="hidden lg:flex items-center gap-10 text-sm font-medium">
        <Link href="#" className="hover:text-lime-400 transition-colors">Home</Link>
        <Link href="#features" className="hover:text-lime-400 transition-colors">Features</Link>
        <Link href="#cards" className="hover:text-lime-400 transition-colors">My Cards</Link>
        <Link href="#about" className="hover:text-lime-400 transition-colors">About Us</Link>
        <Link href="#contact" className="hover:text-lime-400 transition-colors">Contact</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/" className="bg-lime-400 hover:bg-lime-500 text-black px-8 py-3 rounded-full font-bold text-sm transition-all">
          Sign up
        </Link>
      </div>
    </nav>
  );
};