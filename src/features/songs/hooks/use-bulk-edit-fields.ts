'use client'

import { useCallback } from 'react'
import { DEFAULT_BULK_EDIT_FIELDS, type BulkEditFieldsState } from '@/features/config/domain'
import { useConfig } from '@/features/config/hooks/use-config'
import { useUpdateConfig } from '@/features/config/hooks/use-update-config'
import { genericJsonObjectParser } from '@/features/config/parsers'

const CONFIG_KEY = 'bulkEditFields'

const parse = (value: string | null) =>
  genericJsonObjectParser<BulkEditFieldsState>(value) ?? DEFAULT_BULK_EDIT_FIELDS

export function useBulkEditFields() {
  const { data } = useConfig<BulkEditFieldsState>({
    key: CONFIG_KEY,
    parser: parse,
    defaultData: DEFAULT_BULK_EDIT_FIELDS
  })
  const { mutate } = useUpdateConfig({ parser: parse })

  const saveFields = useCallback(
    (fields: BulkEditFieldsState) => mutate({ key: CONFIG_KEY, value: JSON.stringify(fields) }),
    [mutate]
  )

  return { fields: data ?? DEFAULT_BULK_EDIT_FIELDS, saveFields }
}
