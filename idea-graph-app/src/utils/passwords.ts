import type { PasswordHashValue } from '../types/graph'

const encoder = new TextEncoder()

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

export function createPasswordSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return bytesToBase64(bytes)
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${salt}:${password}`))
  return bytesToBase64(new Uint8Array(digest))
}

export async function createPasswordHashValue(password: string): Promise<PasswordHashValue> {
  const salt = createPasswordSalt()
  const hash = await hashPassword(password, salt)

  return { salt, hash }
}

export async function matchesPasswordHash(
  password: string,
  value: PasswordHashValue | null | undefined,
): Promise<boolean> {
  if (!value) {
    return false
  }

  const hash = await hashPassword(password, value.salt)
  return hash === value.hash
}
