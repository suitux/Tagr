import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

const DetailPanelLoadingState = () => {
  return (
    <div className='flex flex-col h-full overflow-hidden'>
      <ScrollArea className='flex-1 min-h-0'>
        <div className='p-4 space-y-6'>
          {/* Preview card skeleton */}
          <Skeleton className='w-full h-80 rounded-xl' />

          {/* Sections skeleton */}
          <div className='space-y-3'>
            <Skeleton className='h-3 w-20' />
            <div className='space-y-2'>
              <Skeleton className='h-14 w-full rounded-lg' />
              <Skeleton className='h-14 w-full rounded-lg' />
              <Skeleton className='h-14 w-full rounded-lg' />
            </div>
          </div>

          <div className='space-y-3'>
            <Skeleton className='h-3 w-24' />
            <div className='space-y-2'>
              <Skeleton className='h-14 w-full rounded-lg' />
              <Skeleton className='h-14 w-full rounded-lg' />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default DetailPanelLoadingState
