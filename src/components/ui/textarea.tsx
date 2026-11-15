import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-emerald-800/40 bg-emerald-950/40 px-3.5 py-2.5 text-sm ring-offset-background placeholder:text-emerald-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/80 focus-visible:border-rose-500/50 disabled:cursor-not-allowed disabled:opacity-50 text-white transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
