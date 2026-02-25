'use client'

import { CalendarIcon, Check, X } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useHome } from '@/contexts/home-context'
import type { SongSortField } from '@/features/songs/domain'

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseRange(value: string | undefined): DateRange | undefined {
  if (!value) return undefined
  const [fromStr, toStr] = value.split('..')
  return {
    from: fromStr ? new Date(fromStr + 'T00:00:00') : undefined,
    to: toStr ? new Date(toStr + 'T00:00:00') : undefined
  }
}

export function DateFilterInput({ field }: { field: SongSortField }) {
  const { columnFilters, setColumnFilter } = useHome()
  const t = useTranslations('files')
  const [open, setOpen] = useState(false)
  const [clicks, setClicks] = useState(0)
  const [localRange, setLocalRange] = useState<DateRange | undefined>(undefined)

  const currentValue = columnFilters[field]
  const isActive = !!currentValue

  function handleOpen(isOpen: boolean) {
    if (isOpen) {
      setLocalRange(parseRange(currentValue))
      setClicks(0)
    }
    setOpen(isOpen)
  }

  function handleSelect(newRange: DateRange | undefined) {
    const nextClicks = clicks + 1
    setClicks(nextClicks)

    if (nextClicks === 1) {
      // First click — store from locally
      setLocalRange({ from: newRange?.from })
    } else {
      // Second click — commit full range and close
      setLocalRange(newRange)
      if (newRange?.from && newRange?.to) {
        setColumnFilter(field, `${formatDate(newRange.from)}..${formatDate(newRange.to)}`)
      }
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='h-6 w-6 relative' onClick={e => e.stopPropagation()}>
          <CalendarIcon className='h-3.5 w-3.5' />
          {isActive && <span className='absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-primary' />}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-3'
        align='start'
        onClick={e => e.stopPropagation()}
        onPointerDownOutside={e => e.preventDefault()}
        onFocusOutside={e => e.preventDefault()}>
        <div className='flex flex-col gap-3'>
          <Calendar mode='range' selected={localRange} onSelect={handleSelect} numberOfMonths={2} />
          <div className='flex gap-2'>
            {isActive && (
              <Button
                variant='ghost'
                size='sm'
                className='flex-1'
                onClick={() => {
                  setLocalRange(undefined)
                  setColumnFilter(field, '')
                  setOpen(false)
                }}>
                <X className='h-3 w-3 mr-1' />
                {t('clearDateFilter')}
              </Button>
            )}
            {localRange?.from && (
              <Button
                variant='default'
                size='sm'
                className='flex-1'
                onClick={() => {
                  const from = localRange.from!
                  const to = localRange.to ?? from
                  setColumnFilter(field, `${formatDate(from)}..${formatDate(to)}`)
                  setOpen(false)
                }}>
                <Check className='h-3 w-3 mr-1' />
                {t('applyDateFilter')}
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
