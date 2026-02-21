import NextImage from 'next/image'
import { cn } from '@/lib/utils'

type ImageProps = React.ComponentProps<typeof NextImage>

function Image({ className, ...props }: ImageProps) {
  return <NextImage data-slot='image' className={cn(className)} {...props} />
}

export { Image }
