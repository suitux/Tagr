import { beforeEach, describe, expect, it } from 'vitest'
import { decryptSecret, encryptSecret } from './crypto'

beforeEach(() => {
  process.env.AUTH_SECRET = 'test-secret'
})

describe('encryptSecret / decryptSecret', () => {
  it('round-trips a token', () => {
    const token = 'lbz-0123456789abcdef'

    expect(decryptSecret(encryptSecret(token))).toBe(token)
  })

  it('produces a different cipher text every time', () => {
    expect(encryptSecret('same')).not.toBe(encryptSecret('same'))
  })

  it('throws when the payload was tampered with', () => {
    const [version, iv, tag] = encryptSecret('token').split(':')

    expect(() => decryptSecret([version, iv, tag, Buffer.from('other').toString('base64')].join(':'))).toThrow()
  })

  it('throws when the format is not recognized', () => {
    expect(() => decryptSecret('not-encrypted')).toThrow('Malformed encrypted secret')
  })

  it('throws when AUTH_SECRET is missing', () => {
    delete process.env.AUTH_SECRET

    expect(() => encryptSecret('token')).toThrow('AUTH_SECRET')
  })

  it('cannot decrypt with a different AUTH_SECRET', () => {
    const encrypted = encryptSecret('token')
    process.env.AUTH_SECRET = 'rotated-secret'

    expect(() => decryptSecret(encrypted)).toThrow()
  })
})
