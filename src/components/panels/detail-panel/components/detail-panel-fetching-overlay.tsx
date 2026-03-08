import { LoaderCircleIcon } from 'lucide-react'

export function DetailPanelFetchingOverlay() {
  return (
    <div className='absolute inset-0 z-10 flex items-center justify-center bg-background/80'>
      <LoaderCircleIcon className='h-6 w-6 animate-spin text-muted-foreground' />
    </div>
  )
}
