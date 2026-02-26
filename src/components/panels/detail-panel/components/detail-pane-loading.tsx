import { XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useHome } from '@/contexts/home-context'

function SkeletonRow() {
  return (
    <div className='flex items-start gap-3 p-3'>
      <Skeleton className='flex-shrink-0 w-8 h-8 rounded-lg' />
      <div className='flex-1 min-w-0 space-y-1.5'>
        <Skeleton className='h-3 w-16' />
        <Skeleton className='h-4 w-32' />
      </div>
    </div>
  )
}

function SkeletonSection({ title, rows }: { title: string; rows: number }) {
  return (
    <div className='space-y-3'>
      <Skeleton className='h-3' style={{ width: `${title.length * 7}px` }} />
      <Card className='p-0'>
        <CardContent className='p-0 divide-y divide-border'>
          {Array.from({ length: rows }, (_, i) => (
            <SkeletonRow key={i} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

const DetailPanelLoadingState = () => {
  const { setSelectedSongId } = useHome()

  return (
    <div className='flex flex-col h-full overflow-hidden'>
      <div className='flex justify-end p-2'>
        <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setSelectedSongId(null)}>
          <XIcon className='h-4 w-4' />
        </Button>
      </div>
      <ScrollArea className='flex-1 min-h-0'>
        <div className='px-4 pb-4 space-y-6'>
          {/* Preview card */}
          <Card className='p-0'>
            <CardContent className='p-0'>
              <div className='relative bg-gradient-to-br from-muted/50 to-muted'>
                <div className='relative flex flex-col items-center py-6 px-4'>
                  <Skeleton className='w-64 h-64 rounded-2xl mb-4' />
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-5 w-12 rounded-full' />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Music Info — 8 rows */}
          <SkeletonSection title='Song INFO' rows={8} />

          {/* Notes — 1 row */}
          <SkeletonSection title='NOTES' rows={1} />

          {/* Track Info — 3 rows */}
          <SkeletonSection title='TRACK INFO' rows={3} />

          {/* Audio Properties — 5 rows */}
          <SkeletonSection title='AUDIO PROPERTIES' rows={5} />

          {/* File Details — 4 rows */}
          <SkeletonSection title='FILE DETAILS' rows={4} />
        </div>
      </ScrollArea>
    </div>
  )
}

export default DetailPanelLoadingState
