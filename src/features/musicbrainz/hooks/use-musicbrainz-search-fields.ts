'use client'

import { useCallback } from 'react'
import type { MusicBrainzSearchFieldsState } from '@/features/config/domain'
import { useConfig } from '@/features/config/hooks/use-config'
import { useUpdateConfig } from '@/features/config/hooks/use-update-config'
import { genericJsonObjectParser } from '@/features/config/parsers'

const CONFIG_KEY = 'musicbrainzSearchFields'

const parse = (value: string | null) => genericJsonObjectParser<MusicBrainzSearchFieldsState>(value) ?? null

export function useMusicBrainzSearchFields() {
  const { data } = useConfig<MusicBrainzSearchFieldsState | null>({ key: CONFIG_KEY, parser: parse })
  const { mutate } = useUpdateConfig({ parser: parse })

  const saveFields = useCallback(
    (fields: MusicBrainzSearchFieldsState) => mutate({ key: CONFIG_KEY, value: JSON.stringify(fields) }),
    [mutate]
  )

  return { fields: data ?? null, saveFields }
}
