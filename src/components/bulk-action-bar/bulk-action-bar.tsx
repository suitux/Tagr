'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { BulkConfirmModal } from '@/components/bulk-confirm-modal/bulk-confirm-modal'
import { BulkEditModal } from '@/components/bulk-edit-modal/bulk-edit-modal'
import { type SongMetadataUpdate } from '@/features/metadata/domain'
import { useBulkFetchMusicBrainzCover } from '@/features/musicbrainz/hooks/use-bulk-fetch-musicbrainz-cover'
import { useSmartPlaylists } from '@/features/smart-playlists/hooks/use-smart-playlists'
import { buildBulkTargetFromSelection } from '@/features/songs/bulk-target-helpers'
import { type Song } from '@/features/songs/domain'
import { useBulkUpdateSongs } from '@/features/songs/hooks/use-bulk-update-songs'
import { useBulkSelectionStore, useSelectionCount, useSelectionState } from '@/stores/bulk-selection-store'
import { BulkActionBarPill } from './bulk-action-bar-pill'
import { CoverSummary } from './cover-summary'
import { buildContextLabel, filterLoadedBySelection } from './helpers'
import { PatchSummary } from './patch-summary'

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
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null)

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

  const selectedLoadedSongs = filterLoadedBySelection(loadedSongs, selection)
  const contextLabel = buildContextLabel(selection, { playlistName, allFoldersLabel: tFolders('allFolders') })

  const handleEditSubmit = (patch: Partial<SongMetadataUpdate>) => {
    setPendingPatch(patch)
    setConfirmKind('edit')
  }

  const closeAll = () => {
    setEditOpen(false)
    setConfirmKind(null)
    setPendingPatch(null)
    setProgress(null)
  }

  const handleProgress = (p: { completed: number; total: number }) => {
    setProgress({ completed: p.completed, total: p.total })
  }

  const reportResults = (results: { ok: boolean }[]) => {
    const ok = results.filter(r => r.ok).length
    const fail = results.length - ok
    if (fail === 0) {
      toast.success(tBulk('result.success', { count: ok }))
    } else if (ok === 0) {
      toast.error(tBulk('result.allFailed', { count: results.length }))
    } else {
      toast.warning(tBulk('result.partial', { ok, failed: fail }))
    }
  }

  const runBulkEdit = async (target: ReturnType<typeof buildBulkTargetFromSelection>, patch: Partial<SongMetadataUpdate>) => {
    if (!target) return
    try {
      const result = await updateMutation.mutateAsync({ target, metadata: patch, onProgress: handleProgress })
      reportResults(result.results)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Bulk update failed')
    } finally {
      closeAll()
    }
  }

  const runBulkCover = async (target: ReturnType<typeof buildBulkTargetFromSelection>) => {
    if (!target) return
    try {
      const result = await coverMutation.mutateAsync({ target, onProgress: handleProgress })
      reportResults(result.results)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Bulk cover fetch failed')
    } finally {
      closeAll()
    }
  }

  const handleConfirm = () => {
    const target = buildBulkTargetFromSelection(selection)
    if (!target) return
    if (confirmKind === 'edit' && pendingPatch) {
      void runBulkEdit(target, pendingPatch)
    } else if (confirmKind === 'cover') {
      void runBulkCover(target)
    }
  }

  const busy = updateMutation.isPending || coverMutation.isPending

  const confirmTitle =
    confirmKind === 'edit' ? tBulk('edit.title') : confirmKind === 'cover' ? tBulk('cover.title') : ''

  const confirmChanges =
    confirmKind === 'edit' && pendingPatch ? (
      <PatchSummary patch={pendingPatch} />
    ) : confirmKind === 'cover' ? (
      <CoverSummary count={count} />
    ) : null

  const confirmWarning = confirmKind === 'cover' ? tBulk('cover.warning') : undefined

  return (
    <>
      <BulkActionBarPill
        count={count}
        busy={busy}
        onCancel={() => clear()}
        onEdit={() => setEditOpen(true)}
        onFetchCovers={() => setConfirmKind('cover')}
      />

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
        progress={progress}
      />
    </>
  )
}
