'use client'

import { useLayoutEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { useHome } from '@/contexts/home-context'
import type { SongSortField } from '@/features/songs/domain'

// Track which filter field was focused before a potential remount
let focusedFilterField: SongSortField | null = null

export function ColumnFilterInput({ field }: { field: SongSortField }) {
  const { columnFilters, setColumnFilter } = useHome()
  const tFiles = useTranslations('files')
  const inputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    if (focusedFilterField === field) {
      inputRef.current?.focus()
    }
  })

  return (
    <Input
      ref={inputRef}
      className='h-6 text-xs px-1.5'
      placeholder={tFiles('filterPlaceholder')}
      debounceMs={300}
      value={columnFilters[field] ?? ''}
      onChange={e => setColumnFilter(field, e.target.value)}
      onClick={e => e.stopPropagation()}
      onFocus={() => {
        focusedFilterField = field
      }}
      onBlur={() => {
        requestAnimationFrame(() => {
          if (focusedFilterField === field) focusedFilterField = null
        })
      }}
    />
  )
}
