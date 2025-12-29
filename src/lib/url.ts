export interface ShareableSecretData {
  t: string  // title
  c: string  // encrypted content
  b: boolean // burn after view
}

export function encodeSecretForUrl(data: ShareableSecretData): string {
  const json = JSON.stringify(data)
  // Use base64url encoding (URL-safe)
  return btoa(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function decodeSecretFromUrl(encoded: string): ShareableSecretData | null {
  try {
    // Restore base64 padding and characters
    let base64 = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    // Add padding if needed
    const padding = base64.length % 4
    if (padding) {
      base64 += '='.repeat(4 - padding)
    }

    const json = atob(base64)
    return JSON.parse(json) as ShareableSecretData
  } catch {
    return null
  }
}

export function generateShareUrl(data: ShareableSecretData, encryptionKey: string): string {
  const encoded = encodeSecretForUrl(data)
  return `${window.location.origin}/secret?d=${encoded}#${encryptionKey}`
}
