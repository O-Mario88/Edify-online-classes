import React from 'react';
import { cn } from '@/lib/utils';

interface EditorialHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 'h1' | 'h2' | 'h3' | 'h4';
  weight?: 'light' | 'normal' | 'medium' | 'bold';
  align?: 'left' | 'center' | 'right';
}

export function EditorialHeader({
  className,
  level = 'h2',
  weight = 'normal',
  align = 'left',
  children,
  ...props
}: EditorialHeaderProps) {
  const Comp = level;
  
  const baseStyles = "text-slate-900 tracking-tight leading-tight";
  
  const levels = {
    h1: "text-5xl md:text-7xl lg:text-[5rem]", // Very large like the 'Jan 2025' in reference
    h2: "text-4xl md:text-5xl",
    h3: "text-2xl md:text-3xl",
    h4: "text-xl md:text-2xl"
  };

  const weights = {
    light: "font-light", // Key for the editorial look
    normal: "font-normal",
    medium: "font-medium",
    bold: "font-bold"
  };

  const aligns = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right"
  };

  return (
    <Comp
      className={cn(baseStyles, levels[level], weights[weight], aligns[align], className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
