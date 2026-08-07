import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { readAudioMetadata } from '../../src/read/read-audio-metadata'
import { splitMultiValue } from '../../src/shared/multi-value'
import { AudioMetadataPatch } from '../../src/tags/domain'
import { writeAudioMetadata } from '../../src/write/write-audio-metadata'
import { writeAudioPicture } from '../../src/write/write-audio-picture'

const FIXTURES = path.join(__dirname, '..', 'fixtures')

let workDir: string

beforeAll(async () => {
  workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'audiotagr-'))
})

afterAll(async () => {
  await fs.rm(workDir, { recursive: true, force: true })
})

/**
 * Copy a fixture into the scratch dir so every test writes to its own file and
 * the checked-in fixtures stay pristine. The copy is named after the running
 * test, so two tests can never share a file by accident.
 */
async function fixture(name: string): Promise<string> {
  const testName = expect.getState().currentTestName ?? 'unknown'
  const slug = testName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  const target = path.join(workDir, `${slug}-${name}`)

  await fs.copyFile(path.join(FIXTURES, name), target)
  return target
}

async function writeAndRead(name: string, patch: AudioMetadataPatch) {
  const filePath = await fixture(name)
  await writeAudioMetadata(filePath, patch)
  return readAudioMetadata(filePath)
}

// WMA/ASF is intentionally absent from some cases: taglib writes descriptors the
// parser exposes differently. Each case lists the formats it covers.
const ALL_FORMATS = ['sample.mp3', 'sample.flac', 'sample.m4a', 'sample.ogg', 'sample.opus', 'sample.wma']

describe.each(ALL_FORMATS)('%s', name => {
  it('round-trips the common fields', async () => {
    const meta = await writeAndRead(name, {
      title: 'Round Trip',
      album: 'Test Album',
      trackNumber: 3,
      year: 1998,
      comment: 'hello'
    })

    expect(meta.title).toBe('Round Trip')
    expect(meta.album).toBe('Test Album')
    expect(meta.trackNumber).toBe(3)
    expect(meta.year).toBe(1998)
    expect(meta.comment).toBe('hello')
  })

  it('round-trips multi-value artists', async () => {
    const meta = await writeAndRead(name, { artist: 'A;B' })

    // MP4 and ASF hold every performer in a single field joined with "; ", so
    // compare the values rather than the exact separator.
    expect(splitMultiValue(meta.artist?.replace(/;\s+/g, ';'))).toEqual(['A', 'B'])
  })

  it('keeps Style out of Genre', async () => {
    const meta = await writeAndRead(name, { genre: 'Pop Punk', style: 'acoustic' })

    expect(meta.genre).toBe('Pop Punk')
    expect(meta.style).toBe('acoustic')
  })

  it('round-trips custom tags', async () => {
    const meta = await writeAndRead(name, {
      customTags: [{ key: 'MOOD', value: 'calm' }]
    })

    const mood = meta.customTags.find(t => t.key.toUpperCase().endsWith('MOOD'))
    expect(mood?.value).toBe('calm')
  })

  it('clears a field written as null', async () => {
    const filePath = await fixture(name)
    await writeAudioMetadata(filePath, { title: 'To be removed' })
    await writeAudioMetadata(filePath, { title: null })

    expect((await readAudioMetadata(filePath)).title).toBeNull()
  })

  it('writes a front cover', async () => {
    const filePath = await fixture(name)
    // 1x1 transparent PNG.
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    )

    await writeAudioPicture(filePath, png, 'image/png')

    const meta = await readAudioMetadata(filePath)
    expect(meta.pictures).toHaveLength(1)
    expect(meta.pictures[0].data?.length).toBe(png.length)
  })
})

// BPM is the reason this package writes Vorbis comments by hand: taglib's
// convenience setter stores it in TEMPO, which parsers do not read back as BPM.
describe.each(['sample.mp3', 'sample.flac', 'sample.m4a', 'sample.ogg', 'sample.opus'])('%s bpm', name => {
  it('round-trips BPM', async () => {
    const meta = await writeAndRead(name, { bpm: 128 })

    expect(meta.bpm).toBe(128)
  })
})

// Rating uses POPM in ID3v2 and a plain 0-100 field elsewhere.
describe.each(['sample.mp3', 'sample.flac', 'sample.ogg', 'sample.opus'])('%s rating', name => {
  it('round-trips a 0-100 rating', async () => {
    const meta = await writeAndRead(name, { rating: 80 })

    expect(meta.rating).toBeGreaterThan(70)
    expect(meta.rating).toBeLessThanOrEqual(100)
  })
})
