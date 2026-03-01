'use client'

import { X } from 'lucide-react'
import { useRef, useState, useLayoutEffect, type KeyboardEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { useHome } from '@/contexts/home-context'
import { MULTI_VALUE_SEPARATOR, type SongSortField } from '@/features/songs/domain'

let focusedTagFilterField: SongSortField | null = null

export function TagFilterInput({ field }: { field: SongSortField }) {
  const { columnFilters, setColumnFilter } = useHome()
  const tFiles = useTranslations('files')
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')

  const raw = columnFilters[field] ?? ''
  const tags = raw ? raw.split(MULTI_VALUE_SEPARATOR) : []

  useLayoutEffect(() => {
    if (focusedTagFilterField === field) {
      inputRef.current?.focus()
    }
  })

  const addTag = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || tags.includes(trimmed)) return
    const next = [...tags, trimmed]
    setColumnFilter(field, next.join(MULTI_VALUE_SEPARATOR))
    setInputValue('')
  }

  const removeTag = (index: number) => {
    const next = tags.filter((_, i) => i !== index)
    setColumnFilter(field, next.join(MULTI_VALUE_SEPARATOR))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div onClick={e => e.stopPropagation()}>
      <InputGroup className='h-auto min-h-6 flex-wrap'>
        {tags.map((tag, i) => (
          <InputGroupAddon key={`${tag}-${i}`} align='inline-start' className='py-0.5 pl-0.5'>
            <Badge variant='secondary' className='h-4 gap-1 px-2 text-[12px] shrink-0 flex justify-between'>
              <span className='truncate max-w-16'>{tag}</span>
              <InputGroupButton
                size='icon-xs'
                className='h-3 w-3 hover:text-destructive'
                onClick={e => {
                  e.stopPropagation()
                  removeTag(i)
                }}>
                <X className='h-2.5 w-2.5' />
              </InputGroupButton>
            </Badge>
          </InputGroupAddon>
        ))}
        <InputGroupInput
          ref={inputRef}
          className='h-6 min-w-8 text-xs px-1.5'
          placeholder={tags.length === 0 ? tFiles('filterPlaceholderPressEnter') : ''}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            focusedTagFilterField = field
          }}
          onBlur={() => {
            requestAnimationFrame(() => {
              if (focusedTagFilterField === field) focusedTagFilterField = null
            })
            if (inputValue.trim()) addTag(inputValue)
          }}
        />
        {tags.length > 0 && (
          <InputGroupAddon align='inline-end' className='pr-3'>
            <Button
              variant='ghost'
              size='icon'
              className='h-3 w-3'
              onClick={e => {
                e.stopPropagation()
                setColumnFilter(field, '')
                setInputValue('')
              }}>
              <X className='h-3 w-3' />
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  )
}
