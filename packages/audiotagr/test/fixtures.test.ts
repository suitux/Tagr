import { createHash } from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { afterAll, beforeAll, expect, it } from 'vitest'

const FIXTURES = path.join(__dirname, 'fixtures')

/**
 * The write tests must always work on a copy: a fixture mutated by one test
 * would silently change what the next one starts from. This guards that rule by
 * hashing the checked-in fixtures before and after the whole run.
 */
async function hashFixtures(): Promise<Record<string, string>> {
  const names = await fs.readdir(FIXTURES)
  const hashes: Record<string, string> = {}

  for (const name of names.sort()) {
    const contents = await fs.readFile(path.join(FIXTURES, name))
    hashes[name] = createHash('sha256').update(contents).digest('hex')
  }

  return hashes
}

let before: Record<string, string>

beforeAll(async () => {
  before = await hashFixtures()
})

afterAll(async () => {
  expect(await hashFixtures()).toEqual(before)
})

it('has a fixture for every format the write tests cover', () => {
  expect(Object.keys(before)).toEqual([
    'sample.flac',
    'sample.m4a',
    'sample.mp3',
    'sample.ogg',
    'sample.opus',
    'sample.wma'
  ])
})
