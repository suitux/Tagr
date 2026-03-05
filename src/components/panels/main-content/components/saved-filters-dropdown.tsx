'use client'

import { BookmarkIcon, PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useHomeStore } from '@/stores/home-store'
import { useCreateSavedFilter } from '@/features/saved-filters/hooks/use-create-saved-filter'
import { useDeleteSavedFilter } from '@/features/saved-filters/hooks/use-delete-saved-filter'
import { useSavedFilters } from '@/features/saved-filters/hooks/use-saved-filters'

export function SavedFiltersDropdown() {
  const t = useTranslations('savedFilters')
  const columnFilters = useHomeStore(s => s.columnFilters)
  const setAllColumnFilters = useHomeStore(s => s.setAllColumnFilters)
  const search = useHomeStore(s => s.search)
  const isAnyFilterActive = Object.values(columnFilters).some(value => value) || search.length > 0
  const { data: savedFilters } = useSavedFilters()
  const { mutate: createFilter, isPending: isCreating } = useCreateSavedFilter()
  const { mutate: deleteFilter } = useDeleteSavedFilter()

  const [isOpen, setIsOpen] = useState(false)
  const [showNameInput, setShowNameInput] = useState(false)
  const [filterName, setFilterName] = useState('')

  const handleSave = () => {
    if (!filterName.trim()) return
    createFilter(
      { name: filterName.trim(), filters: columnFilters },
      {
        onSuccess: () => {
          setFilterName('')
          setShowNameInput(false)
        }
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setShowNameInput(false)
      setFilterName('')
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='gap-1.5'>
          <BookmarkIcon className='w-4 h-4' />
          {t('title')}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-64 p-0'>
        <div className='p-3 space-y-2'>
          {showNameInput ? (
            <div className='flex gap-1.5'>
              <Input
                autoFocus
                value={filterName}
                onChange={e => setFilterName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('filterName')}
                className='h-8 text-sm'
              />
              <Button size='sm' variant='default' onClick={handleSave} disabled={!filterName.trim() || isCreating}>
                {t('save')}
              </Button>
            </div>
          ) : (
            <Button
              size='sm'
              variant='outline'
              className='w-full gap-1.5'
              disabled={!isAnyFilterActive}
              onClick={() => setShowNameInput(true)}>
              <PlusIcon className='w-3.5 h-3.5' />
              {t('saveCurrentFilters')}
            </Button>
          )}
        </div>

        {savedFilters && savedFilters.length > 0 && (
          <div className='border-t max-h-64 overflow-y-auto'>
            {savedFilters.map(filter => (
              <div
                key={filter.id}
                className='flex items-center justify-between px-3 py-2 hover:bg-accent cursor-pointer group'
                onClick={() => {
                  setAllColumnFilters(filter.filters)
                  setIsOpen(false)
                }}>
                <span className='text-sm truncate'>{filter.name}</span>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0'
                  onClick={e => {
                    e.stopPropagation()
                    deleteFilter(filter.id)
                  }}>
                  <XIcon className='w-3.5 h-3.5' />
                </Button>
              </div>
            ))}
          </div>
        )}

        {(!savedFilters || savedFilters.length === 0) && (
          <div className='border-t px-3 py-3'>
            <p className='text-sm text-muted-foreground text-center'>{t('noSavedFilters')}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
