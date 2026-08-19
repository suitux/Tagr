'use client'

import { ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { Image } from '@/components/ui/image'
import { formatFileSize } from '@/lib/formatters'

interface CoverFilePreviewProps {
  file: File
  note?: string
}

/** Thumbnail + name/size of a locally picked cover image. */
export function CoverFilePreview({ file, note }: CoverFilePreviewProps) {
  const [preview, setPreview] = useState(() => ({ file, url: URL.createObjectURL(file) }))

  if (preview.file !== file) {
    URL.revokeObjectURL(preview.url)
    setPreview({ file, url: URL.createObjectURL(file) })
  }

  return (
    <>
      <div className='relative size-20 shrink-0 overflow-hidden rounded-md bg-muted'>
        <Image
          src={preview.url}
          alt={file.name}
          fill
          sizes='80px'
          unoptimized
          className='object-cover'
          fallbackComponent={
            <div className='flex size-full items-center justify-center'>
              <ImageIcon className='size-6 text-muted-foreground' />
            </div>
          }
        />
      </div>
      <div className='min-w-0 text-sm'>
        <p className='truncate font-medium'>{file.name}</p>
        <p className='text-xs text-muted-foreground'>{formatFileSize(file.size)}</p>
        {note && <p className='mt-1 text-xs text-muted-foreground'>{note}</p>}
      </div>
    </>
  )
}
