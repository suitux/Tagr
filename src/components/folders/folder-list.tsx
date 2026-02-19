'use client'

import { FolderIcon, AlertTriangleIcon, SearchIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useFolders } from '@/features/folders/hooks/use-folders'
import { FolderItem } from './folder-item'

interface FolderListProps {
  onFolderSelect?: (folderId: string | null) => void
  selectedFolderId?: string | null
}

export function FolderList({ onFolderSelect, selectedFolderId }: FolderListProps) {
  const t = useTranslations('folders')
  const { data, isLoading, error } = useFolders()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFolders =
    data?.folders.filter(folder => {
      const folderName = folder.folder.toLowerCase()
      return folderName.includes(searchQuery.toLowerCase())
    }) ?? []

  if (isLoading) {
    return (
      <div className='flex flex-col h-full'>
        <FolderListHeader />
        <div className='p-3 space-y-2'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-14 w-full' />
          <Skeleton className='h-14 w-full' />
          <Skeleton className='h-14 w-full' />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex flex-col h-full'>
        <FolderListHeader />
        <div className='flex-1 flex items-center justify-center p-4'>
          <Card className='w-full'>
            <CardHeader className='text-center pb-2'>
              <div className='mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2'>
                <AlertTriangleIcon className='w-6 h-6 text-destructive' />
              </div>
              <CardTitle className='text-base'>{t('errorLoading')}</CardTitle>
              <CardDescription>{t('errorLoadingDescription')}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full'>
      <FolderListHeader />

      {/* Search */}
      <div className='px-3 pb-3'>
        <div className='relative'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            type='text'
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-9 h-9'
          />
        </div>
      </div>

      {/* Summary */}
      {data?.summary && (
        <div className='px-3 pb-3 flex gap-2'>
          <Badge variant='secondary'>{t('totalFolders', { count: data.summary.totalFolders })}</Badge>
          <Badge variant='outline'>{t('files', { count: data.summary.totalFiles })}</Badge>
        </div>
      )}

      <Separator />

      {/* Folder List */}
      <ScrollArea className='flex-1'>
        <div className='p-2'>
          {filteredFolders.length === 0 ? (
            <Card className='m-2'>
              <CardContent className='flex flex-col items-center justify-center py-8 text-center'>
                <div className='w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3'>
                  <FolderIcon className='w-6 h-6 text-muted-foreground' />
                </div>
                <p className='text-sm text-muted-foreground'>
                  {searchQuery ? t('notFound') : t('empty')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-1'>
              {filteredFolders.map(folder => (
                <FolderItem
                  key={folder.folder}
                  folder={folder}
                  isSelected={selectedFolderId === folder.folder}
                  onClick={() => onFolderSelect?.(folder.folder)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function FolderListHeader() {
  const t = useTranslations('folders')

  return (
    <div className='px-4 py-5'>
      <div className='flex items-center gap-3'>
        <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20'>
          <FolderIcon className='w-5 h-5 text-primary-foreground' />
        </div>
        <div>
          <h2 className='text-base font-semibold text-foreground'>{t('title')}</h2>
          <p className='text-xs text-muted-foreground'>{t('subtitle')}</p>
        </div>
      </div>
    </div>
  )
}
