import { useTranslations } from 'next-intl'
import { summaryBasename } from './helpers'

interface SummaryFileListProps {
  files: string[]
  total: number
}

export function SummaryFileList({ files, total }: SummaryFileListProps) {
  const t = useTranslations('summary')
  return (
    <ul className='space-y-0.5'>
      {files.map(filePath => (
        <li key={filePath} className='text-xs text-muted-foreground truncate' title={filePath}>
          {summaryBasename(filePath)}
        </li>
      ))}
      {total > files.length && (
        <li className='text-xs text-muted-foreground italic'>
          {t('andMore', { count: total - files.length })}
        </li>
      )}
    </ul>
  )
}
