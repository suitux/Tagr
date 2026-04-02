'use client'

import { FolderOpenIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { useMobileNavStore } from '@/stores/mobile-nav-store'

export function MainContentEmptyFolderState() {
  const tFolders = useTranslations('folders')
  const breakpoint = useBreakpoint()
  const setFolderSheetOpen = useMobileNavStore(s => s.setFolderSheetOpen)

  return (
    <div className='flex flex-col h-full items-center justify-center text-center p-8'>
      <Card className='max-w-sm w-full'>
        <CardHeader className='text-center'>
          <div className='mx-auto w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4'>
            <FolderOpenIcon className='w-10 h-10 text-muted-foreground/50' />
          </div>
          <CardTitle>{tFolders('selectFolder')}</CardTitle>
          <CardDescription>{tFolders('selectFolderDescription')}</CardDescription>
          {breakpoint === 'mobile' && (
            <Button variant='outline' className='mt-4' onClick={() => setFolderSheetOpen(true)}>
              <FolderOpenIcon className='h-4 w-4' />
              {tFolders('browseFolders')}
            </Button>
          )}
        </CardHeader>
      </Card>
    </div>
  )
}
