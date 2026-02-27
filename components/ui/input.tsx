'use client';

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-[#0f3460] focus-visible:border-[#00b4d8]",
        destructive: "border-destructive focus-visible:ring-destructive",
        ghost: "border-transparent bg-transparent shadow-none",
      },
      size: {
        default: "h-10",
        sm: "h-8 rounded-md px-2 text-xs",
        lg: "h-12 rounded-md px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  asChild?: boolean
  error?: string
  label?: string
  helperText?: string
}

const Input = React.memo(
  React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, size, error, label, helperText, type, ...props }, ref) => {
      const id = React.useId()
      const [isFocused, setIsFocused] = React.useState(false)

      return (
        <div className="w-full space-y-2">
          {label && (
            <label
              htmlFor={id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#e0e0e0]"
            >
              {label}
            </label>
          )}
          <div className="relative">
            <input
              type={type}
              id={id}
              className={cn(
                inputVariants({ variant, size, className }),
                isFocused && "shadow-[0_0_0_2px_rgba(0,180,216,0.1)]",
                error && "border-destructive focus-visible:ring-destructive"
              )}
              ref={ref}
              onFocus={(e) => {
                setIsFocused(true)
                props.onFocus?.(e)
              }}
              onBlur={(e) => {
                setIsFocused(false)
                props.onBlur?.(e)
              }}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${id}-error` : helperText ? `${id}-helper` : undefined
              }
              {...props}
            />
            {error && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  className="h-4 w-4 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            )}
          </div>
          {(error || helperText) && (
            <p
              id={error ? `${id}-error` : `${id}-helper`}
              className={cn(
                "text-xs",
                error ? "text-destructive" : "text-muted-foreground"
              )}
              role={error ? "alert" : undefined}
            >
              {error || helperText}
            </p>
          )}
        </div>
      )
    }
  )
)

Input.displayName = "Input"

export { Input, inputVariants }