import crypto from 'crypto'
import { env } from '../../config/env'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16

function deriveKey(salt: Buffer): Buffer {
  return crypto.scryptSync(env.ENCRYPTION_KEY, salt, 32)
}

export function encrypt(text: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = deriveKey(salt)
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64')
}

export function decrypt(encryptedBase64: string): string {
  const data = Buffer.from(encryptedBase64, 'base64')
  const salt = data.subarray(0, SALT_LENGTH)
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const tag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
  const key = deriveKey(salt)
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted) + decipher.final('utf8')
}
