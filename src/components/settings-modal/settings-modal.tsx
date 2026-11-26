'use client'

import {
  ChartNoAxesColumnIcon,
  LanguagesIcon,
  ListMusicIcon,
  PanelRightIcon,
  PlugIcon,
  SettingsIcon,
  Trash2Icon,
  UsersIcon,
  type LucideIcon
} from 'lucide-react'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { UserRole } from '@/features/users/domain'
import { hasMinimumRole } from '@/features/users/lib/hasMinimumRole'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { DetailPanelSettings } from './components/detail-panel-settings'
import { InsightsSettings } from './components/insights-settings'
import { LanguageSettings } from './components/language-settings'
import { ListenBrainzSettings } from './components/listenbrainz-settings'
import { SongListSettings } from './components/song-list-settings'
import { TrashSettings } from './components/trash-settings'
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
  },
  { id: 'songList', labelKey: 'songList', icon: ListMusicIcon, minimumRole: 'listener', Content: SongListSettings },
  {
    id: 'detailPanel',
    labelKey: 'detailPanel',
    icon: PanelRightIcon,
    minimumRole: 'listener',
    Content: DetailPanelSettings
  },
  { id: 'language', labelKey: 'language', icon: LanguagesIcon, minimumRole: 'listener', Content: LanguageSettings },
  { id: 'trash', labelKey: 'trash', icon: Trash2Icon, minimumRole: 'admin', Content: TrashSettings },
  { id: 'insights', labelKey: 'insights', icon: ChartNoAxesColumnIcon, minimumRole: 'admin', Content: InsightsSettings }
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

  const isMobile = breakpoint === 'mobile'

  const tabsList = (
    <TabsList variant='line' className='gap-1 max-md:mb-1 md:w-fit md:min-w-56 md:shrink-0'>
      {sections.map(({ id, labelKey, icon: Icon }) => (
        <TabsTrigger key={id} value={id} className='px-3 py-2'>
          <Icon />
          {t(`sections.${labelKey}`)}
        </TabsTrigger>
      ))}
    </TabsList>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-2xl max-md:flex max-md:max-w-[calc(100%-8px)] max-md:h-[85dvh] max-md:flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <SettingsIcon className='h-5 w-5' />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          orientation={isMobile ? 'horizontal' : 'vertical'}
          value={activeSection}
          onValueChange={value => setPickedSection(value as SettingsSection)}
          className='min-w-0 gap-3 md:gap-4 max-md:min-h-0 max-md:flex-1 md:min-h-96'>
          {isMobile ? <ScrollArea className='w-full shrink-0'>{tabsList}</ScrollArea> : tabsList}

          <Separator orientation={isMobile ? 'horizontal' : 'vertical'} />

          {sections.map(({ id, Content }) => (
            <TabsContent key={id} value={id} className='min-h-0 min-w-0 overflow-y-auto md:h-[60vh]'>
              <Content />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
