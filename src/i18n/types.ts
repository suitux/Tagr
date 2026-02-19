import { getTranslations } from 'next-intl/server'

export type TFunction = Awaited<ReturnType<typeof getTranslations>>
