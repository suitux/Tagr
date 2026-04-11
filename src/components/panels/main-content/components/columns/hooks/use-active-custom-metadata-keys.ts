'use client'

import { useMemo } from 'react'
import useColumnVisibility from '@/components/panels/main-content/components/columns/hooks/use-column-visibility'
import { getMetadataKeyFromColumnId, isMetadataColumnId } from '@/features/songs/domain'
import { useMetadataKeys } from '@/features/songs/hooks/use-metadata-keys'
import { useSongColumns } from '../columns'

export function useActiveCustomMetadataKeys(): string[] {
  const { data: metadataKeys = [] } = useMetadataKeys()
  const columns = useSongColumns(metadataKeys)
  const { data: columnVisibility } = useColumnVisibility({ columns })

  return useMemo(
    () =>
      Object.entries(columnVisibility || {})
        .filter(e => e[1] && isMetadataColumnId(e[0]))
        .map(e => getMetadataKeyFromColumnId(e[0])),
    [columnVisibility]
  )
}
