import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Song } from '@/features/songs/domain'

const { mockUseMusicBrainzSearch } = vi.hoisted(() => ({ mockUseMusicBrainzSearch: vi.fn() }))

vi.mock('@/features/musicbrainz/hooks/use-musicbrainz-search', () => ({
  useMusicBrainzSearch: (params: unknown) => mockUseMusicBrainzSearch(params)
}))

import { SearchStage } from './search-stage'

const song = {
  title: 'In Silence',
  artist: 'Christopher Anton',
  album: 'Nostalgia',
  year: 2009,
  fileName: 'in-silence.mp3'
} as Song

/** The params the component last handed to the search hook. */
const lastSearch = () => mockUseMusicBrainzSearch.mock.calls.at(-1)?.[0]

const submit = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'musicbrainzLookup.search' }))

const openSelector = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'musicbrainzLookup.searchFields' }))

beforeEach(() => {
  mockUseMusicBrainzSearch.mockReset()
  mockUseMusicBrainzSearch.mockReturnValue({
    data: { pages: [{ recordings: [], count: 0, offset: 0 }] },
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn()
  })
})

describe('SearchStage field selector', () => {
  it('shows the fields the song has a tag for, and hides the rest', () => {
    render(<SearchStage song={song} onSelect={vi.fn()} />)

    expect(screen.getByLabelText('fields.title')).toHaveValue('In Silence')
    expect(screen.getByLabelText('fields.artist')).toHaveValue('Christopher Anton')
    expect(screen.queryByLabelText('musicbrainzLookup.mbid')).not.toBeInTheDocument()
  })

  it('leaves out a field the song has no tag for', () => {
    render(<SearchStage song={{ ...song, artist: null } as Song} onSelect={vi.fn()} />)

    expect(screen.queryByLabelText('fields.artist')).not.toBeInTheDocument()
  })

  it('adds a field from the selector and searches with it', async () => {
    const user = userEvent.setup()
    render(<SearchStage song={song} onSelect={vi.fn()} />)

    await openSelector(user)
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'musicbrainzLookup.mbid' }))
    await user.keyboard('{Escape}')

    await user.type(screen.getByLabelText('musicbrainzLookup.mbid'), 'abc')
    await submit(user)

    expect(lastSearch()).toMatchObject({ mbid: 'abc' })
  })

  it('drops a hidden field from the search but keeps what was typed in it', async () => {
    const user = userEvent.setup()
    render(<SearchStage song={song} onSelect={vi.fn()} />)

    await openSelector(user)
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'fields.artist' }))
    await user.keyboard('{Escape}')

    expect(screen.queryByLabelText('fields.artist')).not.toBeInTheDocument()
    await submit(user)
    expect(lastSearch()).toMatchObject({ title: 'In Silence', artist: '', album: 'Nostalgia' })

    await openSelector(user)
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'fields.artist' }))
    await user.keyboard('{Escape}')

    expect(screen.getByLabelText('fields.artist')).toHaveValue('Christopher Anton')
  })

  it('blocks the search and explains why when every field is hidden', async () => {
    const user = userEvent.setup()
    render(<SearchStage song={song} onSelect={vi.fn()} />)

    await openSelector(user)
    for (const name of ['fields.title', 'fields.artist', 'fields.album', 'fields.year']) {
      await user.click(screen.getByRole('menuitemcheckbox', { name }))
    }
    await user.keyboard('{Escape}')

    expect(screen.getByRole('button', { name: 'musicbrainzLookup.search' })).toBeDisabled()
    expect(screen.getByText('musicbrainzLookup.noSearchFields')).toBeInTheDocument()
  })
})
