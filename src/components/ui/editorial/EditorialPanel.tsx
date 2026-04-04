import React from 'react';
import { cn } from '@/lib/utils';

interface EditorialPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'flat' | 'frosted-rose';
  elevation?: 'none' | 'soft' | 'medium';
  radius?: 'default' | 'large' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function EditorialPanel({
  className,
  variant = 'default',
  elevation = 'none',
  radius = 'large',
  padding = 'lg',
  children,
  ...props
}: EditorialPanelProps) {
  const baseStyles = "relative overflow-hidden transition-all duration-300";
  
  const variants = {
    default: "bg-white/80 backdrop-blur-3xl border border-white/40", // Very soft, creamy background
    flat: "bg-slate-50",
    elevated: "bg-white",
    glass: "bg-white/60 backdrop-blur-2xl border border-white/50",
    'frosted-rose': "bg-[#f5eef1]/80 backdrop-blur-2xl border border-[#ffffff]/60" // Matches reference image pink/rose tone
  };

  const elevations = {
    none: "",
    soft: "shadow-[0_8px_30px_rgb(0,0,0,0.04)]", // Extremely soft shadow
    medium: "shadow-[0_20px_50px_rgb(0,0,0,0.06)]"
  };

  const radiuses = {
    default: "rounded-2xl",
    large: "rounded-3xl",
    xl: "rounded-[2rem]" // Extra large, like the reference image
  };

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6 sm:p-8",
    lg: "p-8 sm:p-12 text-center",
    xl: "p-12 sm:p-16"
  };

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        elevations[elevation],
        radiuses[radius],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
