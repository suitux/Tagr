'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import type { ComponentProps } from 'react'
import type { Button } from '@/components/ui/button'

type ButtonVariant = ComponentProps<typeof Button>['variant']

interface AlertDialogButtonProps {
  label: string
  variant?: ButtonVariant
  onClick?: () => void
}

interface AlertDialogOptions {
  title: string
  description: string
  cancel?: AlertDialogButtonProps
  action?: AlertDialogButtonProps
}

interface AlertDialogContextValue {
  confirm: (options: AlertDialogOptions) => void
}

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null)

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<AlertDialogOptions | null>(null)

  const confirm = useCallback((opts: AlertDialogOptions) => {
    setOptions(opts)
    setOpen(true)
  }, [])

  return (
    <AlertDialogContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{options.title}</AlertDialogTitle>
              <AlertDialogDescription>{options.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {options.cancel && (
                <AlertDialogCancel variant={options.cancel.variant} onClick={options.cancel.onClick}>
                  {options.cancel.label}
                </AlertDialogCancel>
              )}
              {options.action && (
                <AlertDialogAction variant={options.action.variant} onClick={options.action.onClick}>
                  {options.action.label}
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AlertDialogContext.Provider>
  )
}

export function useAlertDialog() {
  const context = useContext(AlertDialogContext)
  if (!context) {
    throw new Error('useAlertDialog must be used within an AlertDialogProvider')
  }
  return context
}
