'use client'

import {
  HistoryIcon,
  Loader2Icon,
  LogOutIcon,
  MessageCirclePlus,
  MoreVerticalIcon,
  RefreshCwIcon,
  ZapIcon
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useScan } from '@/features/scan/hooks/use-scan'

const GITHUB_ISSUE_URL = 'https://github.com/suitux/Tagr/issues/new'

interface FolderListHeaderMenuProps {
  onOpenHistory: () => void
}

export function FolderListHeaderMenu({ onOpenHistory }: FolderListHeaderMenuProps) {
  const t = useTranslations('folders')
  const tCommon = useTranslations('common')
  const { isPending, confirmQuickScan, confirmFullScan } = useScan()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <MoreVerticalIcon className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={isPending}>
            {isPending ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <RefreshCwIcon className='h-4 w-4' />}
            {t('rescan')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={confirmQuickScan}>
              <ZapIcon className='h-4 w-4' />
              {t('quickScan')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={confirmFullScan}>
              <RefreshCwIcon className='h-4 w-4' />
              {t('fullScan')}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={onOpenHistory}>
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
  )
}
