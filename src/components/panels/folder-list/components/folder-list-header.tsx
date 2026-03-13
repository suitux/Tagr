'use client'

import { MessageCirclePlus } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import NextImage from 'next/image'
import Link from 'next/link'
import { HistoryModal } from '@/components/history-modal/history-modal'
import { FolderListHeaderMenu } from '@/components/panels/folder-list/components/folder-list-header-menu'
import { UpdateBanner } from '@/components/panels/folder-list/components/update-banner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const GITHUB_ISSUE_URL = 'https://github.com/suitux/Tagr/issues/new'

export function FolderListHeader() {
  const t = useTranslations('folders')
  const [historyOpen, setHistoryOpen] = useState(false)

  return (
    <div className='px-4 py-5'>
      <div className='flex items-center gap-3'>
        <NextImage src='/icons/tagr-logo.webp' alt='Tagr' width={40} height={40} className='rounded-xl' unoptimized />
        <div className='flex-1'>
          <h2 className='text-base font-semibold text-foreground'>
            {t('title')} <span className='text-xs font-normal text-muted-foreground'>v{process.env.APP_VERSION}</span>
          </h2>
          <p className='text-xs text-muted-foreground'>{t('subtitle')}</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
              <Link href={GITHUB_ISSUE_URL} target='_blank' rel='noopener noreferrer'>
                <MessageCirclePlus className='h-4 w-4' />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('feedback')}</TooltipContent>
        </Tooltip>
        <FolderListHeaderMenu onOpenHistory={() => setHistoryOpen(true)} />
      </div>
      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} />
      <UpdateBanner />
    </div>
  )
}
