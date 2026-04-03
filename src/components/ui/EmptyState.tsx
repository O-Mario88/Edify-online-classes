import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { FileQuestion, LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileQuestion,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <Card className={`border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
           <Icon className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-2">{title}</h3>
        <p className="text-sm font-medium text-slate-500 max-w-md mb-6 leading-relaxed">
          {description}
        </p>
        
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="outline" className="font-semibold shadow-sm border-slate-300">
             {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
