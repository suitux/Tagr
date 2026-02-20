import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface DetailPanelSectionProps {
  title: string
  children: ReactNode
}

export function DetailPanelSection({ title, children }: DetailPanelSectionProps) {
  return (
    <div className='space-y-3'>
      <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>{title}</h3>
      <Card>
        <CardContent className='p-0 divide-y divide-border'>{children}</CardContent>
      </Card>
    </div>
  )
}
