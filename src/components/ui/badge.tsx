import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-[#E07A5F] to-[#C65D40] text-white shadow-sm",
        secondary:
          "border-white/[0.08] bg-white/[0.05] text-foreground/80",
        destructive:
          "border-transparent bg-red-500/20 text-red-400",
        outline:
          "border-white/[0.1] text-foreground/70",
        success:
          "border-transparent bg-emerald-500/20 text-emerald-400",
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
