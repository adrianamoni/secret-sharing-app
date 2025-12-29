# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Secret sharing application that allows users to create encrypted secrets and share them via secure URLs. Secrets can be configured to auto-delete after being viewed.

## Commands

```bash
# Development server with HMR
yarn dev

# Type-check and build for production
yarn build

# Lint the codebase
yarn lint

# Preview production build
yarn preview
```

## Architecture

### Tech Stack
- **Framework**: React 19 + TypeScript
- **Build**: Vite 7 with `@vitejs/plugin-react`
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **UI Components**: Custom shadcn-style components in `src/components/ui/`
- **State**: Zustand with persist middleware (localStorage)
- **Forms**: react-hook-form + zod validation
- **Routing**: react-router-dom

### Key Directories
```
src/
├── components/
│   ├── ui/              # shadcn-style reusable components
│   ├── SecretCard.tsx   # Displays a secret in the list
│   └── CreateSecretDialog.tsx
├── pages/
│   ├── HomePage.tsx     # Main view with secret list
│   └── ViewSecretPage.tsx # Decrypts and displays shared secrets
├── stores/
│   └── secretStore.ts   # Zustand store with persistence
├── lib/
│   ├── crypto.ts        # AES-GCM encryption via Web Crypto API
│   └── utils.ts         # cn() helper for class merging
```

### Encryption Flow
- Secrets are encrypted client-side using AES-GCM (Web Crypto API)
- Encryption key is stored in the URL hash fragment (`#key`) - never sent to servers
- Share URL format: `/secret/:id#encryptionKey`

### Data Model
```typescript
interface Secret {
  id: string
  title: string
  content: string          // encrypted
  encryptionKey: string    // for decryption
  deleteAfterView: boolean
  viewCount: number
  createdAt: number
}
```

### Path Alias
`@/` maps to `src/` (configured in tsconfig.app.json and vite.config.ts)
