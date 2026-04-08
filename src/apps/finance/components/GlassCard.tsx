import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  hoverEffect?: boolean;
}

export const GlassCard = ({ children, className = '', noPadding, hoverEffect }: GlassCardProps) => (
  <div className={`bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-xl transition-all duration-300
    ${noPadding ? '' : 'p-6'} 
    ${hoverEffect ? 'hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-1 hover:shadow-2xl' : ''} 
    ${className}`}>
    {children}
  </div>
);
