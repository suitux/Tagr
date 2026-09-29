import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

interface MetadataKeysResponse {
  keys: string[]
}

async function fetchMetadataKeys(): Promise<string[]> {
  const { data } = await api.get<MetadataKeysResponse>('/songs/metadata-keys')
  return data.keys
}

export const METADATA_KEYS_QUERY_KEY = ['songs', 'metadata-keys']

export function useMetadataKeys() {
  return useQuery({
    queryKey: METADATA_KEYS_QUERY_KEY,
    queryFn: fetchMetadataKeys,
    staleTime: 5 * 60 * 1000
  })
}
