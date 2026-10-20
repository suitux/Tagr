'use client'

import { ArchiveRestoreIcon, Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ContextMenuItem } from '@/components/ui/context-menu'
import { type Song } from '@/features/songs/domain'
import { useTrashActions } from '@/features/trash/hooks/use-trash-actions'

interface SongRowTrashItemsProps {
  song: Song
  inTrash: boolean
}

/** Mounted only while the menu is open, so the trash hooks don't run once per table row. */
export function SongRowTrashItems({ song, inTrash }: SongRowTrashItemsProps) {
  const t = useTranslations('trash')
  const { moveToTrash, restore, deletePermanently } = useTrashActions()
  const target = { mode: 'ids' as const, songIds: [song.id] }

  if (!inTrash) {
    return (
      <ContextMenuItem variant='destructive' onSelect={() => moveToTrash(target, 1)}>
        <Trash2Icon />
        {t('actions.trash')}
      </ContextMenuItem>
    )
  }

  return (
    <>
      <ContextMenuItem onSelect={() => restore(target, 1)}>
        <ArchiveRestoreIcon />
        {t('actions.restore')}
      </ContextMenuItem>
      <ContextMenuItem variant='destructive' onSelect={() => deletePermanently(target, 1)}>
        <Trash2Icon />
        {t('actions.delete')}
      </ContextMenuItem>
    </>
  )
}
