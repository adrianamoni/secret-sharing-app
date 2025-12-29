import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "relative w-12 h-7 rounded-full transition-all duration-300",
            "bg-white/[0.08] peer-checked:bg-gradient-to-r peer-checked:from-[#E07A5F] peer-checked:to-[#C65D40]",
            "after:content-[''] after:absolute after:top-1 after:start-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:shadow-sm",
            "peer-checked:after:translate-x-5",
            "peer-focus:ring-2 peer-focus:ring-[#E07A5F]/30",
            className
          )}
        />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
