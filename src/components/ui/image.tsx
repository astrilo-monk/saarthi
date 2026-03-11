import { forwardRef, type ImgHTMLAttributes, useEffect, useState } from 'react'
import './image.css'

const FALLBACK_IMAGE_URL = "/images/fallback.png";

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fittingType?: string
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(({ src, fittingType: _, ...props }, ref) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src)

  useEffect(() => {
    setImgSrc((prev) => {
      if (prev !== src) {
        return src
      }
      return prev
    })
  }, [src])

  if (!src) {
    return <div data-empty-image ref={ref as any} {...props} />
  }

  return (
    <img
      ref={ref}
      src={imgSrc}
      data-error-image={imgSrc === FALLBACK_IMAGE_URL}
      onError={() => setImgSrc(FALLBACK_IMAGE_URL)}
      {...props}
    />
  )
})
Image.displayName = 'Image'
