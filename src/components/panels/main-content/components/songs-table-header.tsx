'use client'

import { FolderIcon, HistoryIcon, SparklesIcon, Trash2Icon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useMobileNavStore } from '@/stores/mobile-nav-store'

interface SongTableHeaderProps {
  title?: string | null
  mobileTitle?: string | null
  variant?: 'folder' | 'smart-playlist' | 'recent' | 'trash'
  badges?: ReactNode
  /** Buttons for the whole view; unlike `badges`, also shown on mobile. */
  actions?: ReactNode
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  searchKey?: string | number | null
}

export function SongsTableHeader({
  title = '—',
  mobileTitle = '—',
  variant = 'folder',
  badges,
  actions,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchKey
}: SongTableHeaderProps) {
  const setFolderSheetOpen = useMobileNavStore(s => s.setFolderSheetOpen)

  return (
    <>
      <div className='flex-shrink-0 px-2 py-3 md:px-6 md:py-5 bg-gradient-to-r from-background to-muted/20'>
        <div className='hidden md:flex items-center justify-between'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary flex-shrink-0'>
              {variant === 'smart-playlist' && <SparklesIcon className='w-5 h-5' />}

              {variant === 'recent' && <HistoryIcon className='w-5 h-5' />}

              {variant === 'trash' && <Trash2Icon className='w-5 h-5' />}

              {variant === 'folder' && <FolderIcon className='w-5 h-5' />}
            </div>

            <div className='min-w-0'>
              <h1 className='text-xl md:text-2xl font-bold text-foreground mt-1 truncate'>{title}</h1>
            </div>
          </div>
          {(badges || actions) && (
            <div className='flex items-center gap-2 flex-shrink-0'>
              {badges}
              {actions}
            </div>
          )}
        </div>

        <div className='md:hidden flex items-center gap-2 mb-3 min-w-0'>
          {variant === 'smart-playlist' && <SparklesIcon className='w-5 h-5 text-primary flex-shrink-0' />}
          {variant === 'recent' && <HistoryIcon className='w-5 h-5 text-primary flex-shrink-0' />}
          {variant === 'trash' && <Trash2Icon className='w-5 h-5 text-primary flex-shrink-0' />}
          {variant === 'folder' && (
            <button
              type='button'
              className='flex md:hidden items-center gap-2'
              onClick={() => setFolderSheetOpen(true)}>
              <FolderIcon className='w-5 h-5 text-primary flex-shrink-0' />
            </button>
          )}
          <span className='text-sm font-semibold truncate'>{mobileTitle ?? title}</span>
          {actions && <div className='ml-auto flex items-center gap-2 flex-shrink-0'>{actions}</div>}
        </div>

        <div className='relative md:mt-4'>
          <Input
            key={searchKey}
            debounceMs={300}
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
      </div>
      <Separator />
    </>
  )
}
