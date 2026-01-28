
import React, { useState, useEffect, useRef } from 'react';

interface CountUpProps {
  end: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const CountUp: React.FC<CountUpProps> = ({ end, decimals = 0, duration = 2, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const currentCount = progress * end;
      setCount(currentCount);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  const formattedCount = count.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div ref={elementRef} className="inline-block">
      {prefix}{formattedCount}{suffix}
    </div>
  );
};

const statItems = [
  {
    id: 1,
    value: 1260,
    decimals: 0,
    prefix: '₹',
    suffix: 'Cr',
    label: 'Asset Under Management',
    icon: (
      <svg className="w-12 h-12 text-[#009BD6]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21,18H3V6H21V18M21,4H3C1.89,4 1,4.89 1,6V18C1,19.1 1.89,20 3,20H21C22.1,20 23,19.1 23,18V6C23,4.89 22.1,4 21,4M19,10H16V14H19V10Z" />
      </svg>
    )
  },
  {
    id: 2,
    value: 17818,
    decimals: 0,
    prefix: '₹',
    suffix: 'Cr',
    label: 'Total Amount Disbursed',
    icon: (
      <svg className="w-12 h-12 text-[#009BD6]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11,2V22C5.9,21.5 2,17.2 2,12C2,6.8 5.9,2.5 11,2M13,2C15.6,2 17.9,3 19.8,4.7L12,12.5V2M19.8,19.3C17.9,21 15.6,22 13,22V12.5L20.8,4.7C22.4,6.7 23.4,9.2 23.4,12C23.4,14.8 22.4,17.3 19.8,19.3Z" />
      </svg>
    )
  },
  {
    id: 3,
    value: 3.73,
    decimals: 2,
    prefix: '',
    suffix: 'Cr',
    label: 'Registered Users',
    icon: (
      <svg className="w-12 h-12 text-[#009BD6]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 13c-.22 0-.44 0-.65.05 1.02-.84 1.65-2.11 1.65-3.55 0-2.48-2.02-4.5-4.5-4.5S8 7.02 8 9.5c0 1.44.63 2.71 1.65 3.55-.21-.05-.43-.05-.65-.05C6.01 13 3 16.01 3 19v2h18v-2c0-2.99-3.01-6-5.99-6zm-7-3.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5zm10.5 10.5h-15v-1c0-1.65 2.33-4.5 4-4.5.61 0 1.29.39 2 1 .71-.61 1.39-1 2-1 1.67 0 4 2.85 4 4.5v1z" />
      </svg>
    )
  },
  {
    id: 4,
    value: 3.09,
    decimals: 2,
    prefix: '',
    suffix: 'Cr',
    label: 'No of Loans Disbursed',
    icon: (
      <svg className="w-12 h-12 text-[#009BD6]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" />
      </svg>
    )
  }
];

export const Stats: React.FC = () => {
  return (
    <section className="mb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#F8F9F8] rounded-[32px] p-8 md:p-10 flex items-center gap-8 border border-black/5 hover:bg-white hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex-shrink-0 p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </div>
            <div className="flex flex-col">
              <div className="text-4xl md:text-5xl font-black text-[#0A1A3F] leading-none mb-2">
                <CountUp
                  end={item.value}
                  decimals={item.decimals}
                  duration={2}
                  prefix={item.prefix}
                  suffix={item.suffix}
                />
              </div>
              <div className="text-gray-500 font-bold text-sm uppercase tracking-wider opacity-60">
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
