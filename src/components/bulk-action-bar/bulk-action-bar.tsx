'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { BulkConfirmModal } from '@/components/bulk-confirm-modal/bulk-confirm-modal'
import { BulkEditModal } from '@/components/bulk-edit-modal/bulk-edit-modal'
import { isEmptyBulkPatch, type BulkPatch } from '@/components/bulk-edit-modal/build-patch'
import {
  BulkMusicBrainzModal,
  type BulkMusicBrainzSubmission
} from '@/components/bulk-musicbrainz-modal/bulk-musicbrainz-modal'
import { SCAN_FILE_LIST_LIMIT } from '@/features/metadata/domain'
import { useBulkFetchMusicBrainzCover } from '@/features/musicbrainz/hooks/use-bulk-fetch-musicbrainz-cover'
import { useBulkApplyMusicBrainz } from '@/features/musicbrainz/hooks/use-bulk-musicbrainz'
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
import { MusicBrainzSummary } from './musicbrainz-summary'
import { PatchSummary } from './patch-summary'
import { SetCoverSummary } from './set-cover-summary'

interface BulkActionBarProps {
  loadedSongs: Song[]
}

export function BulkActionBar({ loadedSongs }: BulkActionBarProps) {
  const tBulk = useTranslations('bulkEdit')
  const tFolders = useTranslations('folders')
  const tListens = useTranslations('listens')
  const tMusicBrainz = useTranslations('bulkMusicbrainz')

  const selection = useSelectionState()
  const count = useSelectionCount()
  const clear = useBulkSelectionStore(s => s.clear)
  const setBulkLastResult = useHomeStore(s => s.setBulkLastResult)
  const setBulkSummaryOpen = useHomeStore(s => s.setBulkSummaryOpen)
  const coverPickerOpen = useHomeStore(s => s.bulkCoverPickerOpen)
  const setCoverPickerOpen = useHomeStore(s => s.setBulkCoverPickerOpen)

  const [editOpen, setEditOpen] = useState(false)
  const [musicBrainzOpen, setMusicBrainzOpen] = useState(false)
  const [confirmKind, setConfirmKind] = useState<'edit' | 'cover' | 'set-cover' | 'musicbrainz' | null>(null)
  const [pendingPatch, setPendingPatch] = useState<BulkPatch | null>(null)
  const [pendingCover, setPendingCover] = useState<File | null>(null)
  const [pendingMusicBrainz, setPendingMusicBrainz] = useState<BulkMusicBrainzSubmission | null>(null)
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null)

  const updateMutation = useBulkUpdateSongs()
  const coverMutation = useBulkFetchMusicBrainzCover()
  const setCoverMutation = useBulkUpdateSongPicture()
  const musicBrainzMutation = useBulkApplyMusicBrainz()

  const playlists = useSmartPlaylists().data
  const playlistName = useMemo(() => {
    if (selection?.mode !== 'all-in-context') return null
    if (selection.context.type !== 'smart-playlist') return null
    const all = [...(playlists?.private ?? []), ...(playlists?.public ?? [])]
    return all.find(p => p.id === (selection.context as { playlistId: number }).playlistId)?.name ?? null
  }, [selection, playlists])

  // The lookup dialog loads the selected songs itself, so it gets the target only while it is open.
  const musicBrainzTarget = useMemo(
    () => (musicBrainzOpen && selection ? buildBulkTargetFromSelection(selection) : null),
    [musicBrainzOpen, selection]
  )

  if (!selection) return null

  const selectedLoadedSongs = filterLoadedBySelection(loadedSongs, selection)
  const contextLabel = buildContextLabel(selection, {
    playlistName,
    allFoldersLabel: tFolders('allFolders'),
    recentListensLabel: tListens('title')
  })

  const handleEditSubmit = (patch: BulkPatch) => {
    // Nothing touched means nothing to send — the route rejects an empty payload.
    if (isEmptyBulkPatch(patch)) {
      setEditOpen(false)
      return
    }
    setPendingPatch(patch)
    setConfirmKind('edit')
  }

  const handleCoverSubmit = (file: File) => {
    setPendingCover(file)
    setCoverPickerOpen(false)
    setConfirmKind('set-cover')
  }

  const handleMusicBrainzSubmit = (submission: BulkMusicBrainzSubmission) => {
    setPendingMusicBrainz(submission)
    setMusicBrainzOpen(false)
    setConfirmKind('musicbrainz')
  }

  const closeAll = () => {
    setEditOpen(false)
    setMusicBrainzOpen(false)
    setCoverPickerOpen(false)
    setConfirmKind(null)
    setPendingPatch(null)
    setPendingCover(null)
    setPendingMusicBrainz(null)
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

    // Only the first slice is listed — the summary shows "and N more" from the counts, and a
    // selection can run into thousands of songs.
    setBulkLastResult({
      kind,
      updated: { count: ok, files: okResults.slice(0, SCAN_FILE_LIST_LIMIT).map(r => buildPath(r.song)) },
      failed: {
        count: fail,
        errors: failResults
          .slice(0, SCAN_FILE_LIST_LIMIT)
          .map(r => ({ path: findLoadedPath(r.songId), error: r.error }))
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

  const runBulkEdit = async (target: ReturnType<typeof buildBulkTargetFromSelection>, patch: BulkPatch) => {
    if (!target) return
    try {
      const result = await updateMutation.mutateAsync({
        target,
        metadata: patch.metadata,
        ...(patch.customMetadata.length > 0 && { customMetadata: patch.customMetadata }),
        onProgress: handleProgress
      })
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

  const runMusicBrainz = async (
    target: ReturnType<typeof buildBulkTargetFromSelection>,
    submission: BulkMusicBrainzSubmission
  ) => {
    if (!target) return
    try {
      const result = await musicBrainzMutation.mutateAsync({
        target,
        items: submission.items,
        coverReleaseId: submission.coverReleaseId,
        onProgress: handleProgress
      })
      reportResults('musicbrainz', result.results)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'MusicBrainz lookup failed')
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
    } else if (confirmKind === 'musicbrainz' && pendingMusicBrainz) {
      void runMusicBrainz(target, pendingMusicBrainz)
    }
  }

  const busy =
    updateMutation.isPending || coverMutation.isPending || setCoverMutation.isPending || musicBrainzMutation.isPending

  const confirmTitle =
    confirmKind === 'edit'
      ? tBulk('edit.title')
      : confirmKind === 'cover'
        ? tBulk('cover.title')
        : confirmKind === 'set-cover'
          ? tBulk('setCover.title')
          : confirmKind === 'musicbrainz'
            ? tMusicBrainz('title')
            : ''

  const confirmChanges =
    confirmKind === 'edit' && pendingPatch ? (
      <PatchSummary patch={pendingPatch} />
    ) : confirmKind === 'cover' ? (
      <CoverSummary count={count} />
    ) : confirmKind === 'set-cover' && pendingCover ? (
      <SetCoverSummary file={pendingCover} count={count} />
    ) : confirmKind === 'musicbrainz' && pendingMusicBrainz ? (
      <MusicBrainzSummary submission={pendingMusicBrainz} />
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
        onMusicBrainz={() => setMusicBrainzOpen(true)}
      />

      <BulkMusicBrainzModal
        open={musicBrainzOpen}
        onOpenChange={setMusicBrainzOpen}
        target={musicBrainzTarget}
        onSubmit={handleMusicBrainzSubmit}
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
            setPendingMusicBrainz(null)
          }
        }}
        onConfirm={handleConfirm}
        title={confirmTitle}
        // The lookup writes only the songs it matched, which can be fewer than were selected.
        affectedCount={confirmKind === 'musicbrainz' && pendingMusicBrainz ? pendingMusicBrainz.items.length : count}
        contextLabel={contextLabel}
        changes={confirmChanges}
        warning={confirmWarning}
        busy={busy}
        progress={progress}
      />
    </>
  )
}
