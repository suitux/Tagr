'use client'

import { SlidersHorizontalIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface FieldVisibilityMenuProps<T extends string> {
  fields: readonly T[]
  isVisible: (field: T) => boolean
  onToggle: (field: T, visible: boolean) => void
  label: (field: T) => string
  /** Text on the trigger button, also used as the menu heading. */
  triggerLabel: string
  /** Rendered under the checkbox list — e.g. an input that adds a new field. */
  footer?: ReactNode
  className?: string
}

/** Picks which fields a form shows. A hidden field takes no part in the form's result. */
export function FieldVisibilityMenu<T extends string>({
  fields,
  isVisible,
  onToggle,
  label,
  triggerLabel,
  footer,
  className
}: FieldVisibilityMenuProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type='button' variant='outline' size='sm' className={cn('gap-1.5', className)}>
          <SlidersHorizontalIcon className='h-4 w-4' />
          {triggerLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-56'>
        <DropdownMenuLabel>{triggerLabel}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className='max-h-72 overflow-y-auto'>
          {fields.map(field => (
            <DropdownMenuCheckboxItem
              key={field}
              checked={isVisible(field)}
              // Without this the menu closes on every pick, so choosing several fields means
              // reopening it each time.
              onSelect={e => e.preventDefault()}
              onCheckedChange={checked => onToggle(field, checked)}>
              {label(field)}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
        {footer && (
          <>
            <DropdownMenuSeparator />
            {footer}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
