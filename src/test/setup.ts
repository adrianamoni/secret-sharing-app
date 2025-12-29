import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock window.location for URL generation
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000',
    hash: '',
    pathname: '/',
  },
  writable: true,
})

// Mock clipboard API
const clipboardMock = {
  writeText: vi.fn().mockResolvedValue(undefined),
  readText: vi.fn().mockResolvedValue(''),
}

Object.defineProperty(navigator, 'clipboard', {
  value: clipboardMock,
  writable: true,
  configurable: true,
})

// Export for tests to access
export { clipboardMock }

// Mock crypto.subtle for Web Crypto API
let uuidCounter = 0
const mockCrypto = {
  subtle: {
    generateKey: vi.fn().mockResolvedValue({
      type: 'secret',
      extractable: true,
      algorithm: { name: 'AES-GCM', length: 256 },
      usages: ['encrypt', 'decrypt'],
    }),
    encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    decrypt: vi.fn().mockResolvedValue(new TextEncoder().encode('decrypted content')),
    exportKey: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    importKey: vi.fn().mockResolvedValue({}),
  },
  getRandomValues: vi.fn((arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256)
    }
    return arr
  }),
  randomUUID: vi.fn(() => `test-uuid-${++uuidCounter}`),
}

Object.defineProperty(globalThis, 'crypto', {
  value: mockCrypto,
})
