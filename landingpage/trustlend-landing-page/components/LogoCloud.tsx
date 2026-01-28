
import React from 'react';

const brands = [
  { name: 'Rakuten', logo: 'Rakuten' },
  { name: 'NCR', logo: 'NCR' },
  { name: 'monday.com', logo: 'monday.com' },
  { name: 'Disney', logo: 'Disney' },
  { name: 'Dropbox', logo: 'Dropbox' }
];

export const LogoCloud: React.FC = () => {
  return (
    <section className="py-20 flex flex-wrap justify-center md:justify-between items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
      {brands.map((brand) => (
        <div key={brand.name} className="text-2xl font-black tracking-tighter text-black flex items-center gap-2">
           {brand.name === 'NCR' && (
             <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
             </svg>
           )}
           {brand.name === 'Dropbox' && (
             <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
               <path d="M6 2L1 5.5L6 9L11 5.5L6 2ZM18 2L13 5.5L18 9L23 5.5L18 2ZM1 13L6 16.5L11 13L6 9.5L1 13ZM13 13L18 16.5L23 13L18 9.5L13 13ZM6 17.5L12 22L18 17.5L12 13L6 17.5Z" />
             </svg>
           )}
           <span>{brand.name}</span>
        </div>
      ))}
    </section>
  );
};
