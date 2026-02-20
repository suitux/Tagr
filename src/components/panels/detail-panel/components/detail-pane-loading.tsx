import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

const DetailPanelLoadingState = () => {
  return (
    <div className='flex flex-col h-full overflow-hidden'>
      {/* Header skeleton */}
      <div className='flex-shrink-0 p-5'>
        <div className='flex items-center gap-3'>
          <Skeleton className='w-12 h-12 rounded-xl' />
          <div className='flex-1'>
            <Skeleton className='h-4 w-32 mb-2' />
            <Skeleton className='h-3 w-24' />
          </div>
        </div>
      </div>

      <Separator />

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
