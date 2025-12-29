# Secret Sharing App

A secure secret sharing application that allows users to create encrypted secrets and share them via secure URLs. Secrets can be configured to self-destruct after being viewed.

## Features

- **Client-side encryption** - Secrets are encrypted using AES-GCM (Web Crypto API) before storage
- **Key in URL fragment** - The encryption key is stored in the URL hash (`#key`), never sent to servers
- **Self-destruct** - Option to automatically delete secrets after being viewed
- **No backend required** - All data is stored locally in the browser
- **Shareable URLs** - Generate secure links to share secrets

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| State Management | Zustand (with localStorage persistence) |
| Forms | react-hook-form + Zod |
| Routing | react-router-dom |
| Encryption | Web Crypto API (AES-GCM) |

## Installation

```bash
# Install dependencies
yarn install

# Development server
yarn dev

# Production build
yarn build

# Preview build
yarn preview
```

## How It Works

1. User creates a secret with a title and content
2. Content is encrypted in the browser using AES-GCM
3. A URL is generated with the format `/secret/:id#encryptionKey`
4. When opening the URL, the secret is decrypted using the key from the hash
5. If self-destruct is enabled, the secret is deleted after being viewed

## Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable components (shadcn-style)
│   ├── SecretCard.tsx         # Secret card in the list
│   └── CreateSecretDialog.tsx # Dialog for creating secrets
├── pages/
│   ├── HomePage.tsx           # Main view with secret list
│   └── ViewSecretPage.tsx     # Decrypts and displays shared secrets
├── stores/
│   └── secretStore.ts         # Zustand store with persistence
└── lib/
    ├── crypto.ts              # AES-GCM encryption functions
    └── utils.ts               # Utilities (cn helper)
```

## License

MIT
