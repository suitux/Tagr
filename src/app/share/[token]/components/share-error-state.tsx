import { MusicIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ShareErrorStateProps {
  error: 'expired' | 'notFound'
}

export function ShareErrorState({ error }: ShareErrorStateProps) {
  const t = useTranslations('share')

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='text-center space-y-4 max-w-md'>
        <div className='mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center'>
          <MusicIcon className='h-8 w-8 text-muted-foreground' />
        </div>
        <h1 className='text-2xl font-bold'>{t(error === 'expired' ? 'expired' : 'notFound')}</h1>
        <p className='text-muted-foreground'>{t('errorDescription')}</p>
      </div>
    </div>
  )
}
