import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'
import { negotiateLocale } from './locale'

export default getRequestConfig(async () => {
  const locale = negotiateLocale((await headers()).get('accept-language'))

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})
