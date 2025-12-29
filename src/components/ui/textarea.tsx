import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[140px] w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-base text-foreground shadow-sm transition-all duration-200 resize-none",
        "placeholder:text-muted-foreground/60",
        "focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/30 focus:border-[#E07A5F]/50 focus:bg-white/[0.05]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
