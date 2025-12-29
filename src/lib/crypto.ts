const ALGORITHM = "AES-GCM"
const KEY_LENGTH = 256
const IV_LENGTH = 12

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export async function encryptSecret(content: string): Promise<{ encrypted: string; key: string }> {
  const key = await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  )

  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoder = new TextEncoder()
  const data = encoder.encode(content)

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data
  )

  const exportedKey = await crypto.subtle.exportKey("raw", key)

  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encryptedBuffer), iv.length)

  return {
    encrypted: arrayBufferToBase64(combined.buffer),
    key: arrayBufferToBase64(exportedKey),
  }
}

export async function decryptSecret(encrypted: string, keyBase64: string): Promise<string> {
  const combined = new Uint8Array(base64ToArrayBuffer(encrypted))
  const iv = combined.slice(0, IV_LENGTH)
  const data = combined.slice(IV_LENGTH)

  const keyBuffer = base64ToArrayBuffer(keyBase64)
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["decrypt"]
  )

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data
  )

  const decoder = new TextDecoder()
  return decoder.decode(decryptedBuffer)
}
