'use client'

import { FolderIcon, SparklesIcon } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { Image } from '@/components/ui/image'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useMobileNavStore } from '@/stores/mobile-nav-store'

interface Props {
  title?: string
  mobileTitle?: string
  variant?: 'folder' | 'smart-playlist'
  badges?: ReactNode
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  searchKey?: string | number
}

export function SongsTableHeader({
  title = '—',
  mobileTitle = '—',
  variant = 'folder',
  badges,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchKey
}: Props) {
  const setFolderSheetOpen = useMobileNavStore(s => s.setFolderSheetOpen)

  return (
    <>
      <div className='flex-shrink-0 px-2 py-3 md:px-6 md:py-5 bg-gradient-to-r from-background to-muted/20'>
        <div className='hidden md:flex items-center justify-between'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary flex-shrink-0'>
              {variant === 'smart-playlist' && <SparklesIcon className='w-5 h-5' />}

              {variant === 'folder' && <FolderIcon className='w-5 h-5' />}
            </div>

            <div className='min-w-0'>
              <h1 className='text-xl md:text-2xl font-bold text-foreground mt-1 truncate'>{title}</h1>
            </div>
          </div>
          {badges && <div className='flex items-center gap-2 flex-shrink-0'>{badges}</div>}
        </div>

        <div className='md:hidden flex items-center gap-2 mb-3 min-w-0'>
          {variant === 'smart-playlist' ? <SparklesIcon className='w-5 h-5 text-primary flex-shrink-0' /> : null}
          {variant === 'folder' && (
            <button
              type='button'
              className='flex md:hidden items-center gap-2'
              onClick={() => setFolderSheetOpen(true)}>
              <FolderIcon className='w-5 h-5 text-primary flex-shrink-0' />
            </button>
          )}
          <span className='text-sm font-semibold truncate'>{mobileTitle ?? title}</span>
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
