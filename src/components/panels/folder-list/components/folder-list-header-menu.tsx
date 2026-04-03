'use client'

import {
  DownloadIcon,
  HistoryIcon,
  Loader2Icon,
  LogOutIcon,
  MessageCirclePlus,
  MoreVerticalIcon,
  RefreshCwIcon,
  UsersIcon,
  ZapIcon
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePwaInstall } from '@/components/pwa/use-pwa-install'
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
import type { UserRole } from '@/features/users/domain'
import { hasMinimumRole } from '@/features/users/lib/hasMinimumRole'

const GITHUB_ISSUE_URL = 'https://github.com/suitux/Tagr/issues/new'

interface FolderListHeaderMenuProps {
  onOpenHistory: () => void
  onOpenUserManagement: () => void
}

export function FolderListHeaderMenu({ onOpenHistory, onOpenUserManagement }: FolderListHeaderMenuProps) {
  const t = useTranslations('folders')
  const tCommon = useTranslations('common')
  const { data: session } = useSession()
  const { isPending, confirmQuickScan, confirmFullScan } = useScan()
  const { canInstall, install } = usePwaInstall()

  const role = session?.user?.role as UserRole
  const isAdmin = hasMinimumRole(role, 'admin')
  const isTagger = hasMinimumRole(role, 'tagger')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <MoreVerticalIcon className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {isTagger && (
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
        )}
        {isTagger && (
          <DropdownMenuItem onClick={onOpenHistory}>
            <HistoryIcon className='h-4 w-4' />
            {t('history')}
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem onClick={onOpenUserManagement}>
            <UsersIcon className='h-4 w-4' />
            {t('manageUsers')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={GITHUB_ISSUE_URL} target='_blank' rel='noopener noreferrer'>
            <MessageCirclePlus className='h-4 w-4' />
            {t('feedback')}
          </Link>
        </DropdownMenuItem>
        {canInstall && (
          <DropdownMenuItem onClick={install}>
            <DownloadIcon className='h-4 w-4' />
            {t('installApp')}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOutIcon className='h-4 w-4' />
          {tCommon('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
