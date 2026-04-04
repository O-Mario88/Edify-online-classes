import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4 | 12;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ children, className = '', columns = 12 }) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    12: 'grid-cols-1 md:grid-cols-6 lg:grid-cols-12'
  };

  return (
    <div className={`grid ${colClasses[columns]} gap-6 items-start auto-rows-min ${className}`}>
      {children}
    </div>
  );
};
