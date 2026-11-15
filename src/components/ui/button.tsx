import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-rose-600 text-white hover:bg-rose-700 border border-transparent shadow-none",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 border border-transparent shadow-none",
        outline:
          "border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 shadow-none",
        secondary:
          "bg-stone-100 text-stone-800 border border-stone-200 hover:bg-stone-200 shadow-none",
        ghost:
          "hover:bg-stone-100 text-stone-600 hover:text-stone-900 shadow-none",
        link:
          "text-stone-900 underline-offset-4 hover:underline",
        gold:
          "bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-none",
        frost:
          "bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100 shadow-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base font-bold",
        icon: "h-9 w-9",
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
