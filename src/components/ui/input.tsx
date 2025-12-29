import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-base text-foreground shadow-sm transition-all duration-200",
          "placeholder:text-muted-foreground/60",
          "focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/30 focus:border-[#E07A5F]/50 focus:bg-white/[0.05]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
