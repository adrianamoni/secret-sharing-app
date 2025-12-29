import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AutoDestroyDuration = 30 | 60 | 300 | null

export interface Secret {
  id: string
  title: string
  content: string // encrypted
  encryptionKey: string
  deleteAfterView: boolean
  autoDestroyAfter: AutoDestroyDuration // seconds until auto-destruction
  viewCount: number
  createdAt: number
}

interface SecretStore {
  secrets: Secret[]
  addSecret: (secret: Omit<Secret, "id" | "viewCount" | "createdAt">) => string
  deleteSecret: (id: string) => void
  getSecretById: (id: string) => Secret | undefined
  incrementViewCount: (id: string) => void
}

function generateId(): string {
  return crypto.randomUUID()
}

export const useSecretStore = create<SecretStore>()(
  persist(
    (set, get) => ({
      secrets: [],

      addSecret: (secretData) => {
        const id = generateId()
        const newSecret: Secret = {
          ...secretData,
          id,
          viewCount: 0,
          createdAt: Date.now(),
          autoDestroyAfter: secretData.autoDestroyAfter ?? null,
        }
        set((state) => ({
          secrets: [newSecret, ...state.secrets],
        }))
        return id
      },

      deleteSecret: (id) => {
        set((state) => ({
          secrets: state.secrets.filter((s) => s.id !== id),
        }))
      },

      getSecretById: (id) => {
        return get().secrets.find((s) => s.id === id)
      },

      incrementViewCount: (id) => {
        set((state) => ({
          secrets: state.secrets.map((s) =>
            s.id === id ? { ...s, viewCount: s.viewCount + 1 } : s
          ),
        }))
      },
    }),
    {
      name: "secret-storage",
    }
  )
)
