import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'

const LosslessBadge = () => {
  const t = useTranslations('fields')
  return <Badge variant='outline'>{t('lossless')}</Badge>
}

export default LosslessBadge
