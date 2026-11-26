'use client'

import { ArchiveRestoreIcon, Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Song } from '@/features/songs/domain'
import { useCanManageTrash, useCanPurgeTrash } from '@/features/trash/hooks/use-can-manage-trash'
import { useTrashActions } from '@/features/trash/hooks/use-trash-actions'

/** Tops the detail of a trashed song: says why nothing can be edited and offers the two ways out. */
export function DetailPanelTrashBanner({ song }: { song: Song }) {
  const t = useTranslations('trash')
  const canManageTrash = useCanManageTrash()
  const canPurgeTrash = useCanPurgeTrash()
  const { restore, deletePermanently } = useTrashActions()
  const target = { mode: 'ids' as const, songIds: [song.id] }

  return (
    <Card className='p-0 border-destructive/40'>
      <CardContent className='p-3 flex flex-col gap-3'>
        <div className='flex items-start gap-2'>
          <Trash2Icon className='w-4 h-4 mt-0.5 shrink-0 text-destructive' />
          <p className='text-xs text-muted-foreground'>{t('readOnlyNotice')}</p>
        </div>
        {canManageTrash && (
          <div className='flex flex-wrap gap-2'>
            <Button size='sm' onClick={() => restore(target)}>
              <ArchiveRestoreIcon />
              {t('actions.restore')}
            </Button>
            {canPurgeTrash && (
              <Button variant='destructive' size='sm' onClick={() => deletePermanently(target, 1)}>
                <Trash2Icon />
                {t('actions.delete')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
