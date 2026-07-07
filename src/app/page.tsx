import { redirect } from 'next/navigation'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'

export default function Home() {
  redirect(`/folders/${ALL_SONGS_FOLDER_ID}`)
}
