import React from 'react';
import logo from '../assets/logo.png';

interface NavbarProps {
  dark?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ dark }) => {
  return (
    <nav className={`px-6 md:px-12 py-8 flex items-center justify-between transition-colors ${dark ? 'text-white' : 'text-black'}`}>
      <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
        <img src={logo} alt="TrustLend" className="w-24 h-24 object-contain" />
        <span>TrustLend</span>
      </div>

      <div className="hidden lg:flex items-center gap-10 text-sm font-medium">
        <a href="#" className="hover:text-lime-400 transition-colors">Home</a>
        <a href="#" className="hover:text-lime-400 transition-colors">Features</a>
        <a href="#" className="hover:text-lime-400 transition-colors">My Cards</a>
        <a href="#" className="hover:text-lime-400 transition-colors">About Us</a>
        <a href="#" className="hover:text-lime-400 transition-colors">Contact</a>
      </div>

      <div className="flex items-center gap-4">
        <button className="bg-lime-400 hover:bg-lime-500 text-black px-8 py-3 rounded-full font-bold text-sm transition-all">
          Sign up
        </button>
      </div>
    </nav>
  );
};