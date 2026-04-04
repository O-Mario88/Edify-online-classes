import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-wider font-bold whitespace-nowrap transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-primary/10 text-primary hover:bg-primary/20",
        secondary:
          "border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
        outline: "border border-slate-200 text-slate-600 bg-white shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
