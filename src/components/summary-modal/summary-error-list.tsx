import { summaryBasename } from './helpers'

interface SummaryErrorListProps {
  errors: Array<{ path: string; error: string }>
}

export function SummaryErrorList({ errors }: SummaryErrorListProps) {
  return (
    <ul className='space-y-1'>
      {errors.map(({ path: filePath, error }, idx) => (
        <li key={`${filePath}-${idx}`} className='text-xs'>
          <span className='text-muted-foreground truncate block' title={filePath}>
            {summaryBasename(filePath)}
          </span>
          <span className='text-destructive'>{error}</span>
        </li>
      ))}
    </ul>
  )
}
