import { DownloadIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWaveform } from '@/components/waveform/use-waveform'
import { Waveform } from '@/components/waveform/waveform'

interface SharePlayerProps {
  audioUrl: string
  fileName?: string
}

export function SharePlayer({ audioUrl, fileName }: SharePlayerProps) {
  const { audioRef, isPlaying, currentTime, duration, handleSeek, togglePlayPause } = useWaveform()

  return (
    <div className='flex items-center gap-3'>
      <Button variant='ghost' size='icon' className='h-10 w-10 shrink-0' onClick={togglePlayPause}>
        {isPlaying ? <PauseIcon className='h-5 w-5' /> : <PlayIcon className='h-5 w-5' />}
      </Button>
      <Waveform
        showTime
        url={audioUrl}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        audioRef={audioRef}
      />
      <Button variant='ghost' size='icon' className='h-10 w-10 shrink-0' asChild>
        <a href={audioUrl} download={fileName || true}>
          <DownloadIcon className='h-5 w-5' />
        </a>
      </Button>
    </div>
  )
}
