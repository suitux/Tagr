'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { FolderListHeader } from './folder-list-header'

export function FolderListLoadingState() {
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
