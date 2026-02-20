'use client'

import { Group, Panel, Separator } from 'react-resizable-panels'
import { cn } from '@/lib/utils'

interface ThreeColumnLayoutProps {
  sidebar: React.ReactNode
  main?: React.ReactNode
  detail?: React.ReactNode
  className?: string
}

export function ThreeColumnLayout({ sidebar, main, detail, className }: ThreeColumnLayoutProps) {
  return (
    <div className={cn('h-screen w-full overflow-hidden bg-background', className)}>
      <Group orientation='horizontal' className='h-full'>
        {/* Sidebar */}
        <Panel id='sidebar' defaultSize={1} minSize={350} maxSize={600} className='bg-card/50 backdrop-blur-sm'>
          {sidebar}
        </Panel>

        <Separator className='w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize' />

        {/* Main content */}
        <Panel id='main' defaultSize={detail ? 55 : 80} minSize={30} className='bg-background overflow-hidden'>
          {main}
        </Panel>

        {/* Detail panel */}
        {detail && (
          <>
            <Separator className='w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize' />
            <Panel id='detail' defaultSize={1} minSize={350} maxSize={600} className='bg-card/50 backdrop-blur-sm'>
              {detail}
            </Panel>
          </>
        )}
      </Group>
    </div>
  )
}
