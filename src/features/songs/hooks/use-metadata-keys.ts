import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

interface MetadataKeysResponse {
  keys: string[]
}

async function fetchMetadataKeys(): Promise<string[]> {
  const { data } = await api.get<MetadataKeysResponse>('/songs/metadata-keys')
  return data.keys
}

export function useMetadataKeys() {
  return useQuery({
    queryKey: ['songs', 'metadata-keys'],
    queryFn: fetchMetadataKeys,
    staleTime: 5 * 60 * 1000
  })
}
