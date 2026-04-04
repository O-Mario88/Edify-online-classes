import React from 'react';
import { Button } from './button';
import { LucideIcon } from 'lucide-react';

interface PremiumEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const PremiumEmptyState: React.FC<PremiumEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`w-full flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 ${className}`}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full scale-150" />
        <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <Icon className="w-8 h-8 text-primary/70" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="shadow-sm font-semibold px-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
