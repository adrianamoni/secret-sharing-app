import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#E07A5F] to-[#C65D40] text-white shadow-lg shadow-[#E07A5F]/20 hover:shadow-xl hover:shadow-[#E07A5F]/30 hover:scale-[1.02] active:scale-[0.98] rounded-xl",
        destructive:
          "bg-destructive/90 text-destructive-foreground hover:bg-destructive rounded-xl",
        outline:
          "border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.08] hover:border-white/20 rounded-xl",
        secondary:
          "bg-white/[0.06] text-foreground hover:bg-white/[0.1] rounded-xl",
        ghost:
          "hover:bg-white/[0.06] rounded-xl",
        link:
          "text-[#E07A5F] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
