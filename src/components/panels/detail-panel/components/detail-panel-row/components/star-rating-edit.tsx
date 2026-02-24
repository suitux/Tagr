'use client'

import { StarIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingEditProps {
  value: number | null
  onSave: (value: number | null) => void
  isPending: boolean
  canEdit: boolean
}

const STARS = [1, 2, 3, 4, 5] as const

function valueToStars(value: number | null): number {
  if (value == null || value <= 0) return 0
  return Math.min(value / 20, 5)
}

function starsToValue(stars: number): number {
  return stars * 20
}

export function StarRatingEdit({ value, onSave, isPending, canEdit }: StarRatingEditProps) {
  const [hoverStar, setHoverStar] = useState<number | null>(null)
  const filledStars = valueToStars(typeof value === 'string' ? Number(value) : value)
  const displayStars = hoverStar ?? filledStars

  const handleClick = (star: number) => {
    if (!canEdit || isPending) return
    const currentRounded = Math.ceil(filledStars)
    onSave(star === currentRounded ? null : starsToValue(star))
  }

  return (
    <div
      className='flex items-center gap-0.5 mt-0.5'
      onMouseLeave={() => setHoverStar(null)}>
      {STARS.map(star => {
        const filled = displayStars >= star
        const halfFilled = !filled && displayStars >= star - 0.5

        return (
          <button
            key={star}
            type='button'
            disabled={!canEdit || isPending}
            className={cn(
              'relative p-0 w-5 h-5 border-0 bg-transparent',
              canEdit && !isPending ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            )}
            onMouseEnter={() => canEdit && setHoverStar(star)}
            onClick={() => handleClick(star)}>
            {/* Empty star (background) */}
            <StarIcon className='absolute inset-0 w-5 h-5 text-muted-foreground/30' />
            {/* Filled star */}
            {filled && (
              <StarIcon className='absolute inset-0 w-5 h-5 text-yellow-500 fill-yellow-500' />
            )}
            {/* Half star */}
            {halfFilled && (
              <div className='absolute inset-0 w-2.5 h-5 overflow-hidden'>
                <StarIcon className='w-5 h-5 text-yellow-500 fill-yellow-500' />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
