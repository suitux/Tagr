'use client'

import { Loader2Icon, ScanSearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import NextImage from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useScan } from '@/features/scan/hooks/use-scan'

export function WelcomeScanState() {
  const t = useTranslations('welcome')
  const router = useRouter()
  const { mutate: scan, isPending } = useScan()

  const handleScan = () => {
    scan(undefined, {
      onSuccess: () => router.refresh()
    })
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen text-center p-8'>
      <Card className='max-w-md'>
        <CardContent className='pt-6'>
          <NextImage
            src='/icons/tagr-logo.webp'
            alt='Tagr'
            width={64}
            height={64}
            className='mx-auto rounded-xl mb-4'
            unoptimized
          />
          <h1 className='text-xl font-semibold mb-2'>{t('title')}</h1>
          <p className='text-sm text-muted-foreground mb-2'>{t('description')}</p>
          <p className='text-sm text-muted-foreground mb-6'>{t('timing')}</p>
          <Button size='lg' onClick={handleScan} disabled={isPending}>
            {isPending ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <ScanSearchIcon className='h-4 w-4' />}
            {isPending ? t('scanning') : t('scanButton')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
