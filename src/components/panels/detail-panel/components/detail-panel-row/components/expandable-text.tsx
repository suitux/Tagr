'use client'

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ExpandableTextProps {
  value: string | number | null | undefined | boolean
  isPath?: boolean
}

export function ExpandableText({ value, isPath }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isClamped, setIsClamped] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    setIsClamped(el.scrollHeight > el.clientHeight)
  }, [value])

  return (
    <div className='flex-1 min-w-0'>
      <div className={cn({ 'max-h-72 overflow-y-auto': isExpanded })}>
        <p
          ref={textRef}
          className={cn('text-sm font-medium text-foreground mt-0.5 wrap-anywhere', {
            'text-xs': isPath,
            'line-clamp-3': !isExpanded
          })}>
          {value}
        </p>
      </div>
      {(isClamped || isExpanded) && (
        <Button
          variant='link'
          size='sm'
          className='h-auto p-0 text-xs text-muted-foreground'
          onClick={e => {
            e.stopPropagation()
            setIsExpanded(prev => !prev)
          }}>
          {isExpanded ? (
            <>
              <ChevronUpIcon className='w-3 h-3 mr-0.5' /> Less
            </>
          ) : (
            <>
              <ChevronDownIcon className='w-3 h-3 mr-0.5' /> More
            </>
          )}
        </Button>
      )}
    </div>
  )
}
