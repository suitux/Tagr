'use client'

import { ImageIcon, PencilIcon, XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { BulkConfirmModal } from '@/components/bulk-confirm-modal/bulk-confirm-modal'
import { BulkEditModal } from '@/components/bulk-edit-modal/bulk-edit-modal'
import { Button } from '@/components/ui/button'
import { useBulkFetchMusicBrainzCover } from '@/features/musicbrainz/hooks/use-bulk-fetch-musicbrainz-cover'
import { buildBulkTargetFromSelection } from '@/features/songs/bulk-target-helpers'
import { type Song } from '@/features/songs/domain'
import { useBulkUpdateSongs } from '@/features/songs/hooks/use-bulk-update-songs'
import {
  type SelectionState,
  useBulkSelectionStore,
  useSelectionCount,
  useSelectionState
} from '@/stores/bulk-selection-store'
import { type SongMetadataUpdate } from '@/features/metadata/domain'
import { useSmartPlaylists } from '@/features/smart-playlists/hooks/use-smart-playlists'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'
import { formatSecondsAsDuration } from '@/lib/date'

interface BulkActionBarProps {
  loadedSongs: Song[]
}

export function BulkActionBar({ loadedSongs }: BulkActionBarProps) {
  const tBulk = useTranslations('bulkEdit')
  const tFolders = useTranslations('folders')

  const selection = useSelectionState()
  const count = useSelectionCount()
  const clear = useBulkSelectionStore(s => s.clear)

  const [editOpen, setEditOpen] = useState(false)
  const [confirmKind, setConfirmKind] = useState<'edit' | 'cover' | null>(null)
  const [pendingPatch, setPendingPatch] = useState<Partial<SongMetadataUpdate> | null>(null)

  const updateMutation = useBulkUpdateSongs()
  const coverMutation = useBulkFetchMusicBrainzCover()

  const playlists = useSmartPlaylists().data
  const playlistName = useMemo(() => {
    if (selection?.mode !== 'all-in-context') return null
    if (selection.context.type !== 'smart-playlist') return null
    const all = [...(playlists?.private ?? []), ...(playlists?.public ?? [])]
    return all.find(p => p.id === (selection.context as { playlistId: number }).playlistId)?.name ?? null
  }, [selection, playlists])

  if (!selection) return null

  // Pick the loaded subset that's actually in this selection (used for aggregates).
  const selectedLoadedSongs = filterLoadedBySelection(loadedSongs, selection)

  const contextLabel = buildContextLabel(selection, { playlistName, allFoldersLabel: tFolders('allFolders') })
  const wholeBadge =
    selection.mode === 'all-in-context'
      ? selection.context.type === 'folder'
        ? tBulk('actionBar.wholeFolder')
        : tBulk('actionBar.wholePlaylist')
      : null

  const handleEditSubmit = (patch: Partial<SongMetadataUpdate>) => {
    setPendingPatch(patch)
    setConfirmKind('edit')
  }

  const closeAll = () => {
    setEditOpen(false)
    setConfirmKind(null)
    setPendingPatch(null)
  }

  const handleConfirm = async () => {
    const target = buildBulkTargetFromSelection(selection)
    if (!target) return

    if (confirmKind === 'edit' && pendingPatch) {
      try {
        const result = await updateMutation.mutateAsync({ target, metadata: pendingPatch })
        const ok = result.results.filter(r => r.ok).length
        const fail = result.results.length - ok
        if (fail === 0) {
          toast.success(tBulk('result.success', { count: ok }))
        } else if (ok === 0) {
          toast.error(tBulk('result.allFailed', { count: result.results.length }))
        } else {
          toast.warning(tBulk('result.partial', { ok, failed: fail }))
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Bulk update failed')
      } finally {
        closeAll()
      }
    } else if (confirmKind === 'cover') {
      try {
        const result = await coverMutation.mutateAsync({ target })
        const ok = result.results.filter(r => r.ok).length
        const fail = result.results.length - ok
        if (fail === 0) {
          toast.success(tBulk('result.success', { count: ok }))
        } else if (ok === 0) {
          toast.error(tBulk('result.allFailed', { count: result.results.length }))
        } else {
          toast.warning(tBulk('result.partial', { ok, failed: fail }))
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Bulk cover fetch failed')
      } finally {
        closeAll()
      }
    }
  }

  const busy = updateMutation.isPending || coverMutation.isPending

  const confirmTitle =
    confirmKind === 'edit'
      ? tBulk('edit.title')
      : confirmKind === 'cover'
        ? tBulk('cover.title')
        : ''

  const confirmChanges =
    confirmKind === 'edit' && pendingPatch ? (
      <PatchSummary patch={pendingPatch} />
    ) : confirmKind === 'cover' ? (
      <CoverSummary count={count} />
    ) : null

  const confirmWarning = confirmKind === 'cover' ? tBulk('cover.warning') : undefined

  return (
    <>
      <div
        className='sticky bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'
        data-slot='bulk-action-bar'>
        <div className='flex items-center gap-2 px-3 py-2'>
          <Button variant='ghost' size='icon-sm' onClick={() => clear()} aria-label={tBulk('actionBar.cancel')}>
            <XIcon />
          </Button>
          <span className='text-sm font-medium'>{tBulk('actionBar.selectedCount', { count })}</span>
          {wholeBadge && <span className='text-xs text-muted-foreground'>{wholeBadge}</span>}
          <span className='flex-1' />
          <Button variant='outline' size='sm' onClick={() => setEditOpen(true)} disabled={count === 0 || busy}>
            <PencilIcon />
            {tBulk('actionBar.edit')}
          </Button>
          <Button variant='outline' size='sm' onClick={() => setConfirmKind('cover')} disabled={count === 0 || busy}>
            <ImageIcon />
            {tBulk('actionBar.fetchCovers')}
          </Button>
        </div>
      </div>

      <BulkEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        loadedSongs={selectedLoadedSongs}
        totalAffected={count}
        onSubmit={handleEditSubmit}
      />

      <BulkConfirmModal
        open={confirmKind !== null}
        onOpenChange={open => {
          if (!open) {
            setConfirmKind(null)
            setPendingPatch(null)
          }
        }}
        onConfirm={handleConfirm}
        title={confirmTitle}
        affectedCount={count}
        contextLabel={contextLabel}
        changes={confirmChanges}
        warning={confirmWarning}
        busy={busy}
      />
    </>
  )
}

function filterLoadedBySelection(loadedSongs: Song[], selection: SelectionState): Song[] {
  if (!selection) return []
  if (selection.mode === 'explicit') {
    const ids = selection.ids
    return loadedSongs.filter(s => ids.has(s.id))
  }
  return loadedSongs.filter(s => !selection.exclusions.has(s.id))
}

function buildContextLabel(
  selection: NonNullable<SelectionState>,
  opts: { playlistName: string | null; allFoldersLabel: string }
): string {
  if (selection.mode === 'explicit') return ''
  if (selection.context.type === 'folder') {
    if (selection.context.folderPath === ALL_SONGS_FOLDER_ID) return opts.allFoldersLabel
    return selection.context.folderPath
  }
  return opts.playlistName ?? `#${selection.context.playlistId}`
}

function PatchSummary({ patch }: { patch: Partial<SongMetadataUpdate> }) {
  const tFields = useTranslations('fields')
  const entries = Object.entries(patch)
  if (entries.length === 0) return null
  return (
    <div className='rounded-md border bg-muted/30 divide-y text-xs'>
      {entries.map(([k, v]) => (
        <div key={k} className='flex justify-between gap-2 px-2.5 py-1.5'>
          <span className='font-medium'>{tFields(k as never)}</span>
          <span className='text-muted-foreground truncate max-w-[60%]'>
            {v === null || v === undefined || v === '' ? '—' : String(v as string | number | boolean)}
          </span>
        </div>
      ))}
    </div>
  )
}

function CoverSummary({ count }: { count: number }) {
  const tBulk = useTranslations('bulkEdit')
  const duration = formatSecondsAsDuration(Math.max(1, count)) // ~1s per req
  return (
    <div className='space-y-2 text-sm'>
      <p className='text-muted-foreground'>{tBulk('cover.description')}</p>
      <p className='text-muted-foreground'>{tBulk('cover.estimate', { duration, count })}</p>
    </div>
  )
}
