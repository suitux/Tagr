import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`
}))

vi.mock('@/icons/musicbrainz.svg', () => ({
  default: (props: Record<string, unknown>) => <svg data-testid='musicbrainz-icon' {...props} />
}))

vi.mock('@/components/pwa/use-pwa-install', () => ({
  usePwaInstall: () => ({ canInstall: false, install: vi.fn() })
}))
