'use client'

import { PlugIcon, SettingsIcon, UsersIcon, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { UserRole } from '@/features/users/domain'
import { hasMinimumRole } from '@/features/users/lib/hasMinimumRole'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { ListenBrainzSettings } from './components/listenbrainz-settings'
import { UsersSettings } from './components/users-settings/users-settings'

interface SettingsSectionDefinition {
  id: string
  labelKey: string
  icon: LucideIcon
  minimumRole: UserRole
  Content: () => React.ReactNode
}

const SETTINGS_SECTIONS = [
  { id: 'users', labelKey: 'users', icon: UsersIcon, minimumRole: 'admin', Content: UsersSettings },
  {
    id: 'integrations',
    labelKey: 'integrations',
    icon: PlugIcon,
    minimumRole: 'listener',
    Content: ListenBrainzSettings
  }
] as const satisfies readonly SettingsSectionDefinition[]

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number]['id']

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  section?: SettingsSection
}

export function SettingsModal({ open, onOpenChange, section }: SettingsModalProps) {
  const t = useTranslations('settings')
  const { data: session } = useSession()
  const breakpoint = useBreakpoint()

  const role = session?.user?.role as UserRole
  const sections = SETTINGS_SECTIONS.filter(item => hasMinimumRole(role, item.minimumRole))

  const [pickedSection, setPickedSection] = useState<SettingsSection | null>(null)
  const selectedSection = pickedSection ?? section

  const activeSection = sections.find(item => item.id === selectedSection)?.id ?? sections[0]?.id

  const handleOpenChange = (value: boolean) => {
    if (!value) setPickedSection(null)
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <SettingsIcon className='h-5 w-5' />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          orientation={breakpoint === 'mobile' ? 'horizontal' : 'vertical'}
          value={activeSection}
          onValueChange={value => setPickedSection(value as SettingsSection)}
          className='min-h-96 gap-4'>
          <TabsList variant='line' className='w-full gap-1 md:w-56 md:shrink-0'>
            {sections.map(({ id, labelKey, icon: Icon }) => (
              <TabsTrigger key={id} value={id} className='px-3 py-2'>
                <Icon />
                {t(`sections.${labelKey}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          <Separator orientation={breakpoint === 'mobile' ? 'horizontal' : 'vertical'} />

          {sections.map(({ id, Content }) => (
            <TabsContent key={id} value={id} className='max-h-[60vh] min-w-0 overflow-y-auto'>
              <Content />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
