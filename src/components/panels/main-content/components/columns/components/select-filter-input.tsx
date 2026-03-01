'use client'

import { ChevronsUpDown } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useHome } from '@/contexts/home-context'
import { MULTI_VALUE_SEPARATOR, type SongSortField } from '@/features/songs/domain'
import { useDistinctValues } from '@/features/songs/hooks/use-distinct-values'

export function SelectFilterInput({ field }: { field: SongSortField }) {
  const { columnFilters, setColumnFilter } = useHome()
  const tFiles = useTranslations('files')
  const { data: values = [] } = useDistinctValues(field)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const raw = columnFilters[field] ?? ''
  const selected = raw ? raw.split(MULTI_VALUE_SEPARATOR) : []

  const toggle = (value: string) => {
    const next = selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]
    setColumnFilter(field, next.join(MULTI_VALUE_SEPARATOR))
  }

  const clearAll = () => setColumnFilter(field, '')

  const filtered = search ? values.filter(v => v.toLowerCase().includes(search.toLowerCase())) : values

  const label = selected.length === 0 ? tFiles('selectFilterAll') : selected.join(', ')

  const handleOpenChange = (v: boolean) => {
    if (v) requestAnimationFrame(() => searchRef.current?.focus())
  }

  return (
    <div onClick={e => e.stopPropagation()}>
      <DropdownMenu onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='h-6 w-full justify-between text-xs font-normal px-1.5'>
            <span className='truncate'>{label}</span>
            <ChevronsUpDown className='ml-1 h-3 w-3 shrink-0 opacity-50' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='start'
          className='min-w-(--radix-dropdown-menu-trigger-width) max-h-64 overflow-y-auto'>
          <div className='p-1'>
            <Input
              ref={searchRef}
              className='h-6 text-xs px-1.5'
              placeholder={tFiles('filterPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.stopPropagation()}
            />
          </div>
          {selected.length > 0 && (
            <>
              <DropdownMenuItem onSelect={clearAll} className='text-xs text-muted-foreground'>
                {tFiles('selectFilterAll')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuGroup>
            {filtered.map(v => (
              <DropdownMenuCheckboxItem
                key={v}
                checked={selected.includes(v)}
                onCheckedChange={() => toggle(v)}
                className='text-xs'>
                {v}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
