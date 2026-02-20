import { MusicIcon } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PreviewCardProps {
  title: string
  extension: string
  lossless?: boolean | null
  pictureUrl?: string | null
  hasPicture: boolean
  extColor: string
}

export function PreviewCard({ title, extension, lossless, pictureUrl, hasPicture, extColor }: PreviewCardProps) {
  return (
    <Card className='p-0'>
      <CardContent className='p-0'>
        <div className='relative bg-gradient-to-br from-muted/50 to-muted'>
          <div className='absolute inset-0 bg-grid-pattern opacity-5' />
          <div className='relative flex flex-col items-center py-6 px-4'>
            {hasPicture && pictureUrl ? (
              <div className='w-64 h-64 rounded-2xl overflow-hidden shadow-2xl mb-4 relative'>
                <Image src={pictureUrl} alt={title} fill className='object-cover' unoptimized />
              </div>
            ) : (
              <div
                className={cn(
                  'w-64 h-64 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-2xl mb-4',
                  extColor
                )}>
                <MusicIcon className='w-32 h-32 text-white' />
              </div>
            )}
            <div className='flex items-center gap-2'>
              <Badge variant='secondary'>{extension.toUpperCase()}</Badge>
              {lossless && <Badge variant='outline'>Lossless</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
