'use client'

import { FileAudioIcon, Loader2Icon, RefreshCwIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useScan } from '@/features/scan/hooks/use-scan'

export function MainContentEmptyFilesState() {
  const tFiles = useTranslations('files')
  const { mutate: scan, isPending } = useScan()

  return (
    <div className='flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8'>
      <Card className='max-w-sm'>
        <CardContent className='pt-6'>
          <div className='mx-auto w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4'>
            <FileAudioIcon className='w-8 h-8 text-muted-foreground' />
          </div>
          <p className='text-sm text-muted-foreground mb-4'>{tFiles('empty')}</p>
          <Button size='lg' onClick={() => scan()} disabled={isPending}>
            {isPending ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <RefreshCwIcon className='h-4 w-4' />}
            {tFiles('syncNow')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
