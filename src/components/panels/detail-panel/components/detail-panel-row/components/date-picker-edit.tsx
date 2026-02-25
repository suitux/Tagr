'use client'

import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatDate, parseDate } from '@/lib/date'

interface DatePickerEditProps {
  value: string | number | null | undefined
  onSave: (value: string) => void
}

export function DatePickerEdit({ value, onSave }: DatePickerEditProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (date: Date | undefined) => {
    if (!date) return
    onSave(formatDate(date)!)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'>
          <CalendarIcon className='w-3 h-3' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={parseDate(value)}
          onSelect={handleSelect}
          defaultMonth={parseDate(value)}
          captionLayout='dropdown'
        />
      </PopoverContent>
    </Popover>
  )
}
