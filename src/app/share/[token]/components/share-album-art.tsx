import { MusicIcon } from 'lucide-react'
import { Image } from '@/components/ui/image'

interface ShareAlbumArtProps {
  pictureUrl: string
  title: string
}

export function ShareAlbumArt({ pictureUrl, title }: ShareAlbumArtProps) {
  return (
    <div className='relative aspect-square w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-muted shadow-2xl'>
      <Image
        src={pictureUrl}
        alt={title}
        className='w-full h-full object-cover'
        fill
        unoptimized
        fallbackComponent={
          <div className='w-full h-full flex items-center justify-center'>
            <MusicIcon className='w-[50%] h-[50%] text-muted-foreground' />
          </div>
        }
      />
    </div>
  )
}
