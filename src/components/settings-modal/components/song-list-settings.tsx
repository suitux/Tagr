'use client'

import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DEFAULT_VISIBLE_COLUMNS } from '@/features/config/domain'
import type { ColumnField, SongSortDirection } from '@/features/songs/domain'
import { useDefaultSortOrder } from '@/features/songs/hooks/use-default-sort-order'

// Every standard column of the song list, in the order the column picker lists them
const SORT_FIELDS = Object.keys(DEFAULT_VISIBLE_COLUMNS) as (keyof typeof DEFAULT_VISIBLE_COLUMNS)[]

export function SongListSettings() {
  const t = useTranslations('songListSettings')
  const tFields = useTranslations('fields')
  const { defaultSorting, setDefaultSorting, isPending } = useDefaultSortOrder()

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <h3 className='text-sm font-semibold'>{t('title')}</h3>
        <p className='text-xs text-muted-foreground'>{t('description')}</p>
      </div>

      <div className='flex flex-wrap gap-4'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='default-sort-field'>{t('fieldLabel')}</Label>
          <Select
            value={defaultSorting.sortField}
            onValueChange={value => setDefaultSorting({ ...defaultSorting, sortField: value as ColumnField })}
            disabled={isPending}>
            <SelectTrigger id='default-sort-field' className='w-56'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_FIELDS.map(field => (
                <SelectItem key={field} value={field}>
                  {tFields(field)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='default-sort-direction'>{t('directionLabel')}</Label>
          <Select
            value={defaultSorting.sort}
            onValueChange={value => setDefaultSorting({ ...defaultSorting, sort: value as SongSortDirection })}
            disabled={isPending}>
            <SelectTrigger id='default-sort-direction' className='w-40'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='asc'>{t('ascending')}</SelectItem>
              <SelectItem value='desc'>{t('descending')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
