import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-rose-600 text-white shadow-lg shadow-rose-900/30 hover:bg-rose-500 hover:shadow-rose-700/40 border border-rose-400/20",
        destructive:
          "bg-red-900/70 text-red-200 hover:bg-red-800 border border-red-700/50",
        outline:
          "border border-emerald-700/40 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-100 hover:border-emerald-600/50",
        secondary:
          "bg-emerald-900/50 text-emerald-100 border border-emerald-700/30 hover:bg-emerald-800/60 shadow-sm",
        ghost:
          "hover:bg-emerald-900/30 text-emerald-200 hover:text-white",
        link:
          "text-primary underline-offset-4 hover:underline",
        gold:
          "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-bold shadow-lg shadow-amber-900/40 hover:from-amber-400 hover:to-yellow-400 border border-amber-300/30",
        frost:
          "bg-cyan-950/60 text-cyan-200 border border-cyan-500/40 hover:bg-cyan-900/60 shadow-md shadow-cyan-950/50",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-13 rounded-xl px-7 text-base font-bold",
        icon: "h-10 w-10",
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
