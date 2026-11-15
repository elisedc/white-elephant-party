import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-rose-600/90 text-white shadow hover:bg-rose-600",
        secondary:
          "border-emerald-700/50 bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/80",
        destructive:
          "border-transparent bg-red-600 text-white shadow hover:bg-red-500",
        outline:
          "border-emerald-600/40 text-emerald-300",
        gold:
          "border-amber-400/50 bg-amber-500/20 text-amber-300 shadow-sm",
        frozen:
          "border-cyan-400/60 bg-cyan-950/70 text-cyan-200 shadow-sm shadow-cyan-900/40 animate-pulse",
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
