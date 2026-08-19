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
import { useBulkUpdateSongPicture } from '@/features/songs/hooks/use-bulk-update-song-picture'
import { useBulkUpdateSongs } from '@/features/songs/hooks/use-bulk-update-songs'
import { useBulkSelectionStore, useSelectionCount, useSelectionState } from '@/stores/bulk-selection-store'
import { type BulkSummaryKind, useHomeStore } from '@/stores/home-store'
import { BulkActionBarPill } from './bulk-action-bar-pill'
import { BulkCoverPickerModal } from './bulk-cover-picker-modal'
import { CoverSummary } from './cover-summary'
import { buildContextLabel, filterLoadedBySelection } from './helpers'
import { PatchSummary } from './patch-summary'
import { SetCoverSummary } from './set-cover-summary'

interface BulkActionBarProps {
  loadedSongs: Song[]
}

export function BulkActionBar({ loadedSongs }: BulkActionBarProps) {
  const tBulk = useTranslations('bulkEdit')
  const tFolders = useTranslations('folders')
  const tListens = useTranslations('listens')

  const selection = useSelectionState()
  const count = useSelectionCount()
  const clear = useBulkSelectionStore(s => s.clear)
  const setBulkLastResult = useHomeStore(s => s.setBulkLastResult)
  const setBulkSummaryOpen = useHomeStore(s => s.setBulkSummaryOpen)
  const coverPickerOpen = useHomeStore(s => s.bulkCoverPickerOpen)
  const setCoverPickerOpen = useHomeStore(s => s.setBulkCoverPickerOpen)

  const [editOpen, setEditOpen] = useState(false)
  const [confirmKind, setConfirmKind] = useState<'edit' | 'cover' | 'set-cover' | null>(null)
  const [pendingPatch, setPendingPatch] = useState<Partial<SongMetadataUpdate> | null>(null)
  const [pendingCover, setPendingCover] = useState<File | null>(null)
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null)

  const updateMutation = useBulkUpdateSongs()
  const coverMutation = useBulkFetchMusicBrainzCover()
  const setCoverMutation = useBulkUpdateSongPicture()

  const playlists = useSmartPlaylists().data
  const playlistName = useMemo(() => {
    if (selection?.mode !== 'all-in-context') return null
    if (selection.context.type !== 'smart-playlist') return null
    const all = [...(playlists?.private ?? []), ...(playlists?.public ?? [])]
    return all.find(p => p.id === (selection.context as { playlistId: number }).playlistId)?.name ?? null
  }, [selection, playlists])

  if (!selection) return null

  const selectedLoadedSongs = filterLoadedBySelection(loadedSongs, selection)
  const contextLabel = buildContextLabel(selection, {
    playlistName,
    allFoldersLabel: tFolders('allFolders'),
    recentListensLabel: tListens('title')
  })

  const handleEditSubmit = (patch: Partial<SongMetadataUpdate>) => {
    setPendingPatch(patch)
    setConfirmKind('edit')
  }

  const handleCoverSubmit = (file: File) => {
    setPendingCover(file)
    setCoverPickerOpen(false)
    setConfirmKind('set-cover')
  }

  const closeAll = () => {
    setEditOpen(false)
    setCoverPickerOpen(false)
    setConfirmKind(null)
    setPendingPatch(null)
    setPendingCover(null)
    setProgress(null)
  }

  const handleProgress = (p: { completed: number; total: number }) => {
    setProgress({ completed: p.completed, total: p.total })
  }

  type BulkResultItem =
    | { songId: number; ok: true; song: Song }
    | { songId: number; ok: false; error: string }

  const buildPath = (song: Song) => `${song.folderPath}/${song.fileName}`

  const findLoadedPath = (songId: number) => {
    const found = loadedSongs.find(s => s.id === songId)
    return found ? buildPath(found) : String(songId)
  }

  const reportResults = (kind: BulkSummaryKind, results: BulkResultItem[]) => {
    const okResults = results.filter((r): r is Extract<BulkResultItem, { ok: true }> => r.ok)
    const failResults = results.filter((r): r is Extract<BulkResultItem, { ok: false }> => !r.ok)
    const ok = okResults.length
    const fail = failResults.length

    setBulkLastResult({
      kind,
      updated: { count: ok, files: okResults.map(r => buildPath(r.song)) },
      failed: {
        count: fail,
        errors: failResults.map(r => ({ path: findLoadedPath(r.songId), error: r.error }))
      }
    })

    const toastAction = {
      label: tBulk('result.viewDetails'),
      onClick: () => setBulkSummaryOpen(true)
    }

    if (fail === 0) {
      toast.success(tBulk('result.success', { count: ok }), { action: toastAction, duration: 30000 })
    } else if (ok === 0) {
      toast.error(tBulk('result.allFailed', { count: results.length }), { action: toastAction, duration: 30000 })
    } else {
      toast.warning(tBulk('result.partial', { ok, failed: fail }), { action: toastAction, duration: 30000 })
    }
  }

  const runBulkEdit = async (target: ReturnType<typeof buildBulkTargetFromSelection>, patch: Partial<SongMetadataUpdate>) => {
    if (!target) return
    try {
      const result = await updateMutation.mutateAsync({ target, metadata: patch, onProgress: handleProgress })
      reportResults('edit', result.results)
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
      reportResults('cover', result.results)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Bulk cover fetch failed')
    } finally {
      closeAll()
    }
  }

  const runSetCover = async (target: ReturnType<typeof buildBulkTargetFromSelection>, file: File) => {
    if (!target) return
    try {
      const result = await setCoverMutation.mutateAsync({ target, file, onProgress: handleProgress })
      reportResults('set-cover', result.results)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Bulk cover update failed')
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
    } else if (confirmKind === 'set-cover' && pendingCover) {
      void runSetCover(target, pendingCover)
    }
  }

  const busy = updateMutation.isPending || coverMutation.isPending || setCoverMutation.isPending

  const confirmTitle =
    confirmKind === 'edit'
      ? tBulk('edit.title')
      : confirmKind === 'cover'
        ? tBulk('cover.title')
        : confirmKind === 'set-cover'
          ? tBulk('setCover.title')
          : ''

  const confirmChanges =
    confirmKind === 'edit' && pendingPatch ? (
      <PatchSummary patch={pendingPatch} />
    ) : confirmKind === 'cover' ? (
      <CoverSummary count={count} />
    ) : confirmKind === 'set-cover' && pendingCover ? (
      <SetCoverSummary file={pendingCover} count={count} />
    ) : null

  const confirmWarning =
    confirmKind === 'cover' || confirmKind === 'set-cover' ? tBulk('cover.warning') : undefined

  return (
    <>
      <BulkActionBarPill
        count={count}
        busy={busy}
        onCancel={() => clear()}
        onEdit={() => setEditOpen(true)}
        onSetCover={() => setCoverPickerOpen(true)}
        onFetchCovers={() => setConfirmKind('cover')}
      />

      <BulkEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        loadedSongs={selectedLoadedSongs}
        totalAffected={count}
        onSubmit={handleEditSubmit}
      />

      <BulkCoverPickerModal
        open={coverPickerOpen}
        onOpenChange={setCoverPickerOpen}
        totalAffected={count}
        onSubmit={handleCoverSubmit}
      />

      <BulkConfirmModal
        open={confirmKind !== null}
        onOpenChange={open => {
          if (!open) {
            setConfirmKind(null)
            setPendingPatch(null)
            setPendingCover(null)
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
