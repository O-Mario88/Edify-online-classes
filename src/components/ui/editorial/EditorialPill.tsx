import React from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

export interface EditorialPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark' | 'glass';
  size?: 'sm' | 'default' | 'lg' | 'xl';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const EditorialPill = React.forwardRef<HTMLButtonElement, EditorialPillProps>(
  ({ className, variant = 'primary', size = 'default', asChild = false, iconLeft, iconRight, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary: "bg-[#2A2B2A] text-white hover:bg-black shadow-lg shadow-black/10", // Strong dark contrast like reference
      secondary: "bg-[#f4efe2] text-[#2A2B2A] hover:bg-[#ebe1cf]", // Warm creamy pastel
      outline: "border-[1.5px] border-[#2A2B2A]/20 bg-transparent text-[#2A2B2A] hover:border-[#2A2B2A]",
      ghost: "hover:bg-slate-100 text-[#2A2B2A]",
      dark: "bg-slate-900 text-white hover:bg-slate-800",
      glass: "bg-white/40 backdrop-blur-md border border-white/60 text-[#2A2B2A] hover:bg-white/60"
    };

    const sizes = {
      sm: "h-8 px-4 text-xs",
      default: "h-10 px-6 text-sm",
      lg: "h-12 px-8 text-base",
      xl: "h-14 px-10 text-lg"
    };

    return (
      <Comp
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {iconLeft && <span className="mr-2">{iconLeft}</span>}
        {children}
        {iconRight && <span className="ml-2">{iconRight}</span>}
      </Comp>
    );
  }
);
EditorialPill.displayName = "EditorialPill";
