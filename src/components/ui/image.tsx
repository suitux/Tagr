import { useState } from 'react'
import NextImage, { ImageProps } from 'next/image'

const failedSrcs = new Set<string>()

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  fallbackComponent?: React.ReactNode
  src?: string
}

const Image = ({ fallbackComponent, alt, src = '', ...props }: ImageWithFallbackProps) => {
  const [error, setError] = useState<boolean>(() => failedSrcs.has(src))

  if (error) {
    return fallbackComponent
  }

  return (
    <NextImage
      alt={alt}
      src={src}
      onError={() => {
        failedSrcs.add(src)
        setError(true)
      }}
      {...props}
    />
  )
}

export { Image }
