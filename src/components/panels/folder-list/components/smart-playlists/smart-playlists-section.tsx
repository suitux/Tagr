'use client'

import { ChevronRightIcon, PlusIcon, SparklesIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import type { SmartPlaylist } from '@/features/smart-playlists/domain'
import { useSmartPlaylists } from '@/features/smart-playlists/hooks/use-smart-playlists'
import { cn } from '@/lib/utils'
import { SmartPlaylistListItem } from './smart-playlist-list-item'
import { SmartPlaylistModal } from './smart-playlist-modal'

interface SmartPlaylistsSectionProps {
  selectedPlaylistId: number | null
  onPlaylistSelect: (playlistId: number | null) => void
}

export function SmartPlaylistsSection({ selectedPlaylistId, onPlaylistSelect }: SmartPlaylistsSectionProps) {
  const t = useTranslations('smartPlaylists')
  const [isExpanded, setIsExpanded] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const { data } = useSmartPlaylists()

  const privatePlaylists = data?.private ?? []
  const publicPlaylists = data?.public ?? []

  const renderItem = (playlist: SmartPlaylist) => (
    <SmartPlaylistListItem
      key={playlist.id}
      playlist={playlist}
      isSelected={selectedPlaylistId === playlist.id}
      onSelect={() => onPlaylistSelect(playlist.id)}
    />
  )

  return (
    <div className='mb-2'>
      <div className='flex items-center gap-1 px-2 py-1'>
        <button
          type='button'
          onClick={() => setIsExpanded(v => !v)}
          className='flex items-center gap-2 flex-1 rounded-md px-1 py-1 hover:bg-accent/50 cursor-pointer'>
          <ChevronRightIcon
            className={cn('w-4 h-4 text-muted-foreground transition-transform duration-200', isExpanded && 'rotate-90')}
          />
          <SparklesIcon className='w-4 h-4 text-muted-foreground' />
          <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{t('title')}</span>
        </button>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7'
          onClick={() => setCreateOpen(true)}
          aria-label={t('newPlaylist')}>
          <PlusIcon className='w-4 h-4' />
        </Button>
      </div>

      {isExpanded && (
        <div className='space-y-1 mt-1'>
          {privatePlaylists.length === 0 && publicPlaylists.length === 0 ? (
            <p className='text-xs text-muted-foreground px-4 py-2'>{t('empty')}</p>
          ) : (
            <>
              {privatePlaylists.map(renderItem)}
              {publicPlaylists.length > 0 && (
                <>
                  <div className='px-4 pt-2 pb-1'>
                    <span className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
                      {t('publicHeader')}
                    </span>
                  </div>
                  {publicPlaylists.map(renderItem)}
                </>
              )}
            </>
          )}
        </div>
      )}

      {createOpen && <SmartPlaylistModal open={createOpen} onOpenChange={setCreateOpen} />}
    </div>
  )
}
