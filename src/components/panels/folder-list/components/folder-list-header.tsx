'use client'

import {
  HistoryIcon,
  Loader2Icon,
  LogOutIcon,
  MessageCircleIcon,
  MessageCirclePlus,
  MoreVerticalIcon,
  RefreshCwIcon
} from 'lucide-react'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import NextImage from 'next/image'
import Link from 'next/link'
import { HistoryModal } from '@/components/history-modal/history-modal'
import { UpdateBanner } from '@/components/panels/folder-list/components/update-banner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAlertDialog } from '@/contexts/alert-dialog-context'
import { useScan } from '@/features/scan/hooks/use-scan'

const GITHUB_ISSUE_URL = 'https://github.com/suitux/Tagr/issues/new'

export function FolderListHeader() {
  const t = useTranslations('folders')
  const tCommon = useTranslations('common')
  const { mutate: scan, isPending } = useScan()
  const [historyOpen, setHistoryOpen] = useState(false)
  const { confirm } = useAlertDialog()

  const handleRescan = () => {
    confirm({
      title: t('rescanConfirmTitle'),
      description: t('rescanConfirmDescription'),
      cancel: { label: tCommon('cancel') },
      action: { label: t('rescanConfirmAction'), onClick: () => scan() }
    })
  }

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <MoreVerticalIcon className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={handleRescan} disabled={isPending}>
              {isPending ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <RefreshCwIcon className='h-4 w-4' />}
              {t('rescan')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setHistoryOpen(true)}>
              <HistoryIcon className='h-4 w-4' />
              {t('history')}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={GITHUB_ISSUE_URL} target='_blank' rel='noopener noreferrer'>
                <MessageCirclePlus className='h-4 w-4' />
                {t('feedback')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOutIcon className='h-4 w-4' />
              {tCommon('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} />
      <UpdateBanner />
    </div>
  )
}
