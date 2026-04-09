import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  mdColSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  lgColSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  variant?: 'default' | 'transparent' | 'glass';
  /** If set, passes a hint string out in className so children can inspect or utilize the orientation strategy natively via peer/group CSS */
  orientation?: 'auto' | 'vertical' | 'horizontal';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ 
  children, 
  className = '',
  colSpan,
  mdColSpan,
  lgColSpan,
  variant = 'glass',
  orientation = 'auto'
}) => {
  
  const spanMap: Record<number, string> = {
    1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4', 
    5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
    9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12'
  };

  const mdSpanMap: Record<number, string> = {
    1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 
    4: 'md:col-span-4', 5: 'md:col-span-5', 6: 'md:col-span-6', 12: 'md:col-span-12'
  };

  const lgSpanMap: Record<number, string> = {
    1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4', 
    5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 8: 'lg:col-span-8',
    9: 'lg:col-span-9', 10: 'lg:col-span-10', 11: 'lg:col-span-11', 12: 'lg:col-span-12'
  };

  // If no colSpan passed, default to col-span-1. Let md/lg override it gracefully.
  const cssSpans = [
    spanMap[colSpan || 1],
    mdColSpan ? mdSpanMap[mdColSpan] : '',
    lgColSpan ? lgSpanMap[lgColSpan] : ''
  ].filter(Boolean).join(' ');

  let baseVariant = '';
  if (variant === 'default') {
    baseVariant = 'bg-white rounded-[1.8rem] shadow-[0_4px_24px_-4px_rgba(30,60,110,0.04)] ring-1 ring-slate-100 overflow-hidden relative group';
  } else if (variant === 'glass') {
    baseVariant = 'bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[1.8rem] overflow-hidden relative group';
  }

  // The is-horizontal marker class enables deep nesting css (e.g. w-[40%] instead of w-full inside content)
  const orientationMarker = orientation === 'horizontal' ? 'is-horizontal flex flex-col md:flex-row' : 'flex flex-col';

  return (
    <div className={`dashboard-card ${cssSpans} ${baseVariant} ${orientationMarker} ${className}`}>
      {children}
    </div>
  );
};
