import { useEffect } from 'react'

interface UseKeyPressOptions {
  enabled?: boolean
  ignoreEditable?: boolean
  ignoreDialog?: boolean
}

export function useKeyPress(
  key: string | string[],
  handler: (e: KeyboardEvent) => void,
  options: UseKeyPressOptions = {}
) {
  const { enabled = true, ignoreEditable = true, ignoreDialog = true } = options

  useEffect(() => {
    if (!enabled) return
    const keys = Array.isArray(key) ? key : [key]
    const onKeyDown = (e: KeyboardEvent) => {
      if (!keys.includes(e.key)) return
      const target = e.target as HTMLElement | null
      if (ignoreEditable && target?.closest('input, textarea, [contenteditable="true"]')) return
      if (ignoreDialog && target?.closest('[role="dialog"]')) return
      handler(e)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key, handler, enabled, ignoreEditable, ignoreDialog])
}
