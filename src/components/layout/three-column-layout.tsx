'use client'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
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
      <ResizablePanelGroup orientation='horizontal' className='h-full'>
        {/* Sidebar */}
        <ResizablePanel
          id='sidebar'
          defaultSize={1}
          minSize={350}
          maxSize={600}
          className='bg-card/50 backdrop-blur-sm'>
          {sidebar}
        </ResizablePanel>

        <ResizableHandle className='w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize' />

        {/* Main content */}
        <ResizablePanel id='main' className='bg-background overflow-hidden'>
          {main}
        </ResizablePanel>

        {/* Detail panel */}
        {detail && (
          <>
            <ResizableHandle className='w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize' />
            <ResizablePanel
              id='detail'
              defaultSize={1}
              minSize={350}
              maxSize={600}
              className='bg-card/50 backdrop-blur-sm'>
              {detail}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
