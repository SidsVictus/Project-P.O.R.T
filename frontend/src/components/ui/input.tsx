import * as React from 'react'
import { cn } from '../../lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn('flex h-10 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50', className)}
    ref={ref}
    {...props}
  />
))
Input.displayName = 'Input'
export { Input }
