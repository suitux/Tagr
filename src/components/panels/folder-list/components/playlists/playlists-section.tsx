'use client'

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVerticalIcon, ListMusicIcon, PlusIcon, SparklesIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useConfig } from '@/features/config/hooks/use-config'
import { useUpdateConfig } from '@/features/config/hooks/use-update-config'
import { genericJsonObjectParser } from '@/features/config/parsers'
import type { Playlist, PlaylistOrderEntry } from '@/features/playlists/domain'
import { usePlaylists } from '@/features/playlists/hooks/use-playlists'
import type { SmartPlaylist } from '@/features/smart-playlists/domain'
import { useSmartPlaylists } from '@/features/smart-playlists/hooks/use-smart-playlists'
import { SmartPlaylistModal } from '../smart-playlists/smart-playlist-modal/smart-playlist-modal'
import { SmartPlaylistListItem } from '../smart-playlists/smart-playlist-list-item'
import { ListItemGroup } from '../list-item-group'
import { PlaylistListItem } from './playlist-list-item'
import { PlaylistModal } from './playlist-modal'

type Entry = { kind: 'smart'; item: SmartPlaylist } | { kind: 'custom'; item: Playlist }

const entryKey = (e: Entry) => `${e.kind}:${e.item.id}`

interface PlaylistsSectionProps {
  selectedPlaylistId: number | null
  onPlaylistSelect: (playlistId: number | null) => void
  selectedCustomPlaylistId: number | null
  onCustomPlaylistSelect: (playlistId: number | null) => void
}

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? 'relative z-10 opacity-80' : undefined}>
      <div className='group/row flex items-center'>
        <button
          type='button'
          className='flex items-center justify-center w-5 h-8 shrink-0 cursor-grab touch-none text-muted-foreground opacity-0 group-hover/row:opacity-100'
          aria-label='Drag to reorder'
          {...attributes}
          {...listeners}>
          <GripVerticalIcon className='w-4 h-4' />
        </button>
        <div className='flex-1 min-w-0'>{children}</div>
      </div>
    </div>
  )
}

export function PlaylistsSection({
  selectedPlaylistId,
  onPlaylistSelect,
  selectedCustomPlaylistId,
  onCustomPlaylistSelect
}: PlaylistsSectionProps) {
  const t = useTranslations('playlists')
  const [isExpanded, setIsExpanded] = useState(true)
  const [createSmartOpen, setCreateSmartOpen] = useState(false)
  const [createCustomOpen, setCreateCustomOpen] = useState(false)

  const { data: smartData } = useSmartPlaylists()
  const { data: customData } = usePlaylists()
  const { data: order } = useConfig<PlaylistOrderEntry[]>({
    key: 'playlistOrder',
    parser: v => genericJsonObjectParser<PlaylistOrderEntry[]>(v) ?? [],
    defaultData: []
  })
  const { mutate: updateConfig } = useUpdateConfig({ parser: genericJsonObjectParser })

  const entries = useMemo<Entry[]>(() => {
    const all: Entry[] = [
      ...(smartData?.private ?? []).map(item => ({ kind: 'smart' as const, item })),
      ...(smartData?.public ?? []).map(item => ({ kind: 'smart' as const, item })),
      ...(customData?.private ?? []).map(item => ({ kind: 'custom' as const, item })),
      ...(customData?.public ?? []).map(item => ({ kind: 'custom' as const, item }))
    ]

    if (!order || order.length === 0) return all

    const rank = new Map(order.map((o, i) => [`${o.type}:${o.id}`, i]))
    return [...all].sort((a, b) => {
      const ra = rank.get(entryKey(a)) ?? Number.MAX_SAFE_INTEGER
      const rb = rank.get(entryKey(b)) ?? Number.MAX_SAFE_INTEGER
      return ra - rb
    })
  }, [smartData, customData, order])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = entries.findIndex(e => entryKey(e) === active.id)
    const newIndex = entries.findIndex(e => entryKey(e) === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const next = [...entries]
    const [moved] = next.splice(oldIndex, 1)
    next.splice(newIndex, 0, moved)
    const orderValue: PlaylistOrderEntry[] = next.map(e => ({ type: e.kind, id: e.item.id }))
    updateConfig({ key: 'playlistOrder', value: JSON.stringify(orderValue) })
  }

  const ids = entries.map(entryKey)

  return (
    <>
      <ListItemGroup
        icon={<ListMusicIcon className='w-4 h-4 text-muted-foreground' />}
        label={t('title')}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(v => !v)}
        action={
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-7 w-7' aria-label={t('add')}>
                    <PlusIcon className='w-4 h-4' />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>{t('add')}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => setCreateCustomOpen(true)}>
                <ListMusicIcon />
                {t('newPlaylist')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCreateSmartOpen(true)}>
                <SparklesIcon />
                {t('newSmartPlaylist')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }>
        {entries.length === 0 ? (
          <p className='text-xs text-muted-foreground px-4 py-2'>{t('empty')}</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              {entries.map(entry =>
                entry.kind === 'smart' ? (
                  <SortableRow key={entryKey(entry)} id={entryKey(entry)}>
                    <SmartPlaylistListItem
                      playlist={entry.item}
                      isSelected={selectedPlaylistId === entry.item.id}
                      onSelect={() => onPlaylistSelect(entry.item.id)}
                      onCreated={onPlaylistSelect}
                    />
                  </SortableRow>
                ) : (
                  <SortableRow key={entryKey(entry)} id={entryKey(entry)}>
                    <PlaylistListItem
                      playlist={entry.item}
                      isSelected={selectedCustomPlaylistId === entry.item.id}
                      onSelect={() => onCustomPlaylistSelect(entry.item.id)}
                    />
                  </SortableRow>
                )
              )}
            </SortableContext>
          </DndContext>
        )}
      </ListItemGroup>

      {createSmartOpen && (
        <SmartPlaylistModal open={createSmartOpen} onOpenChange={setCreateSmartOpen} onCreated={onPlaylistSelect} />
      )}
      {createCustomOpen && (
        <PlaylistModal open={createCustomOpen} onOpenChange={setCreateCustomOpen} onCreated={onCustomPlaylistSelect} />
      )}
    </>
  )
}
