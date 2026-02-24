'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

interface InputProps extends React.ComponentProps<'input'> {
  debounceMs?: number
}

function Input({ className, type, debounceMs, onChange, value, defaultValue, ...props }: InputProps) {
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [localValue, setLocalValue] = React.useState(
    debounceMs !== undefined ? String(value ?? defaultValue ?? '') : undefined
  )

  React.useEffect(() => {
    if (debounceMs !== undefined && value !== undefined) {
      setLocalValue(String(value))
    }
  }, [debounceMs, value])

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (debounceMs === undefined) {
      onChange?.(e)
      return
    }
    setLocalValue(e.target.value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange?.(e), debounceMs)
  }

  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-8 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors file:h-6 file:text-sm file:font-medium focus-visible:ring-3 aria-invalid:ring-3 md:text-sm file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      value={debounceMs !== undefined ? localValue : value}
      defaultValue={debounceMs !== undefined ? undefined : defaultValue}
      onChange={handleChange}
      {...props}
    />
  )
}

export { Input }
