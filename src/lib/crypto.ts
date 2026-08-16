import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto'

/**
 * Symmetric encryption for third-party secrets kept in the database (scrobbling tokens).
 * The key is derived from AUTH_SECRET, so no extra environment variable is needed —
 * rotating AUTH_SECRET invalidates the stored secrets, which is the desired behaviour.
 */

const ALGORITHM = 'aes-256-gcm'
const KEY_SALT = 'tagr-scrobble-v1'
const VERSION = 'v1'
const IV_BYTES = 12

function getKey(): Buffer {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('Cannot encrypt secrets: the AUTH_SECRET environment variable is not set.')
  }
  return scryptSync(secret, KEY_SALT, 32)
}

/** Returns `v1:<iv>:<authTag>:<cipherText>`, all base64. */
export function encryptSecret(plainText: string): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const cipherText = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [VERSION, iv.toString('base64'), authTag.toString('base64'), cipherText.toString('base64')].join(':')
}

/** Throws when the payload was tampered with or AUTH_SECRET changed. */
export function decryptSecret(encrypted: string): string {
  const [version, iv, authTag, cipherText] = encrypted.split(':')

  if (version !== VERSION || !iv || !authTag || !cipherText) {
    throw new Error('Malformed encrypted secret')
  }

  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(authTag, 'base64'))

  return Buffer.concat([decipher.update(Buffer.from(cipherText, 'base64')), decipher.final()]).toString('utf8')
}
