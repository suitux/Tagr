import { useState } from 'react'
import NextImage, { ImageProps } from 'next/image'

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  fallbackComponent?: React.ReactNode
  src?: string
}

const Image = ({ fallbackComponent, alt, src = '', ...props }: ImageWithFallbackProps) => {
  const [error, setError] = useState<boolean>(false)

  if (error) {
    return fallbackComponent
  }

  return <NextImage alt={alt} src={src} onError={() => setError(true)} {...props} />
}

export { Image }
