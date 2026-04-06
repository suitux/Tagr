import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`
}))
