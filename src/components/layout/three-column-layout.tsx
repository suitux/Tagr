'use client'

import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface ThreeColumnLayoutProps {
  sidebar: React.ReactNode
  main?: React.ReactNode
  detail?: React.ReactNode
  className?: string
}

export function ThreeColumnLayout({ sidebar, main, detail, className }: ThreeColumnLayoutProps) {
  return (
    <div className={cn('flex h-screen w-full overflow-hidden bg-background', className)}>
      {/* Primera columna - Sidebar */}
      <aside className='w-72 flex-shrink-0 bg-card/50 backdrop-blur-sm'>{sidebar}</aside>

      <Separator orientation='vertical' />

      {/* Segunda columna - Contenido principal */}
      <main className='flex-1 overflow-hidden bg-background'>{main}</main>

      {/* Tercera columna - Panel de detalles */}
      {detail && (
        <>
          <Separator orientation='vertical' />
          <aside className='w-80 flex-shrink-0 bg-card/50 backdrop-blur-sm'>{detail}</aside>
        </>
      )}
    </div>
  )
}
