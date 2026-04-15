import React from 'react';

interface DashboardSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ title, description, children, className = '', action }) => {
  return (
    <section className={`mb-10 ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-end mb-5">
          <div>
            {title && <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>}
            {description && <p className="text-sm font-medium text-slate-700 mt-0.5">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
};
