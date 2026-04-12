'use client'

import { PlusIcon, SparklesIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import type { SmartPlaylist } from '@/features/smart-playlists/domain'
import { useSmartPlaylists } from '@/features/smart-playlists/hooks/use-smart-playlists'
import { ListItemGroup } from '../list-item-group'
import { SmartPlaylistListItem } from './smart-playlist-list-item'
import { SmartPlaylistModal } from './smart-playlist-modal/smart-playlist-modal'

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
    <>
      <ListItemGroup
        icon={<SparklesIcon className='w-4 h-4 text-muted-foreground' />}
        label={t('title')}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(v => !v)}
        action={
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={() => setCreateOpen(true)}
            aria-label={t('newPlaylist')}>
            <PlusIcon className='w-4 h-4' />
          </Button>
        }>
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
      </ListItemGroup>

      {createOpen && <SmartPlaylistModal open={createOpen} onOpenChange={setCreateOpen} />}
    </>
  )
}
