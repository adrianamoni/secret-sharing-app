import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateSecretDialog } from '@/components/CreateSecretDialog'
import { useSecretStore } from '@/stores/secretStore'

// Mock the crypto module
vi.mock('@/lib/crypto', () => ({
  encryptSecret: vi.fn().mockResolvedValue({
    encrypted: 'mock-encrypted-content',
    key: 'mock-encryption-key',
  }),
}))

// Mock the url module
vi.mock('@/lib/url', () => ({
  generateShareUrl: vi.fn().mockReturnValue('http://localhost:3000/secret?d=mockdata#mock-key'),
}))

describe('CreateSecretDialog', () => {
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the store before each test
    useSecretStore.setState({ secrets: [] })
  })

  it('renders the dialog when open', () => {
    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText('Create a Secret')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Secret Message')).toBeInTheDocument()
    expect(screen.getByText('Self-destruct mode')).toBeInTheDocument()
  })

  it('does not render content when dialog is closed', () => {
    render(<CreateSecretDialog open={false} onOpenChange={mockOnOpenChange} />)

    expect(screen.queryByText('Create a Secret')).not.toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup()
    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    const submitButton = screen.getByRole('button', { name: /create secret/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText('Secret content is required')).toBeInTheDocument()
    })
  })

  it('shows validation error for empty title', async () => {
    const user = userEvent.setup()
    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    const contentInput = screen.getByLabelText('Secret Message')
    await user.type(contentInput, 'Some secret content')

    const submitButton = screen.getByRole('button', { name: /create secret/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
  })

  it('shows validation error for empty content', async () => {
    const user = userEvent.setup()
    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    const titleInput = screen.getByLabelText('Title')
    await user.type(titleInput, 'My Secret')

    const submitButton = screen.getByRole('button', { name: /create secret/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Secret content is required')).toBeInTheDocument()
    })
  })

  it('successfully creates a secret and shows share URL', async () => {
    const user = userEvent.setup()
    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    const titleInput = screen.getByLabelText('Title')
    const contentInput = screen.getByLabelText('Secret Message')

    await user.type(titleInput, 'My Test Secret')
    await user.type(contentInput, 'This is my secret message')

    const submitButton = screen.getByRole('button', { name: /create secret/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Secret Created!')).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('http://localhost:3000/secret?d=mockdata#mock-key')).toBeInTheDocument()
  })

  it('adds the secret to the store on successful submission', async () => {
    const user = userEvent.setup()
    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    const titleInput = screen.getByLabelText('Title')
    const contentInput = screen.getByLabelText('Secret Message')

    await user.type(titleInput, 'Store Test Secret')
    await user.type(contentInput, 'Secret content for store')

    const submitButton = screen.getByRole('button', { name: /create secret/i })
    await user.click(submitButton)

    await waitFor(() => {
      const secrets = useSecretStore.getState().secrets
      expect(secrets).toHaveLength(1)
      expect(secrets[0].title).toBe('Store Test Secret')
      expect(secrets[0].content).toBe('mock-encrypted-content')
      expect(secrets[0].deleteAfterView).toBe(true)
    })
  })

  it('toggles self-destruct mode', async () => {
    const user = userEvent.setup()
    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    const toggle = screen.getByRole('checkbox', { name: /self-destruct mode/i })
    expect(toggle).toBeChecked()

    await user.click(toggle)
    expect(toggle).not.toBeChecked()

    await user.click(toggle)
    expect(toggle).toBeChecked()
  })

  it('respects deleteAfterView toggle when creating secret', async () => {
    const user = userEvent.setup()
    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    // Turn off self-destruct mode
    const toggle = screen.getByRole('checkbox', { name: /self-destruct mode/i })
    await user.click(toggle)

    const titleInput = screen.getByLabelText('Title')
    const contentInput = screen.getByLabelText('Secret Message')

    await user.type(titleInput, 'Persistent Secret')
    await user.type(contentInput, 'This should not self-destruct')

    const submitButton = screen.getByRole('button', { name: /create secret/i })
    await user.click(submitButton)

    await waitFor(() => {
      const secrets = useSecretStore.getState().secrets
      expect(secrets[0].deleteAfterView).toBe(false)
    })
  })

  it('shows copy button next to share URL', async () => {
    const user = userEvent.setup()
    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    // Fill and submit form
    await user.type(screen.getByLabelText('Title'), 'Copy Test')
    await user.type(screen.getByLabelText('Secret Message'), 'Secret to copy')
    await user.click(screen.getByRole('button', { name: /create secret/i }))

    await waitFor(() => {
      expect(screen.getByText('Secret Created!')).toBeInTheDocument()
    })

    // Verify the URL input and copy button are present
    const urlInput = screen.getByDisplayValue('http://localhost:3000/secret?d=mockdata#mock-key')
    expect(urlInput).toBeInTheDocument()

    // The copy button should be in the same container as the URL input
    const container = urlInput.parentElement
    const copyButton = container?.querySelector('button')
    expect(copyButton).toBeTruthy()
  })

  it('closes dialog and resets form when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    // Type something in the form
    await user.type(screen.getByLabelText('Title'), 'Partial input')

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes dialog and resets state when Done is clicked after creation', async () => {
    const user = userEvent.setup()
    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    // Create a secret
    await user.type(screen.getByLabelText('Title'), 'Done Test')
    await user.type(screen.getByLabelText('Secret Message'), 'Secret content')
    await user.click(screen.getByRole('button', { name: /create secret/i }))

    await waitFor(() => {
      expect(screen.getByText('Secret Created!')).toBeInTheDocument()
    })

    // Click done
    const doneButton = screen.getByRole('button', { name: /done/i })
    await user.click(doneButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows encrypting state while submitting', async () => {
    const user = userEvent.setup()

    // Slow down the encryption mock to catch the loading state
    const { encryptSecret } = await import('@/lib/crypto')
    vi.mocked(encryptSecret).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({
        encrypted: 'mock-encrypted',
        key: 'mock-key',
      }), 100))
    )

    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    await user.type(screen.getByLabelText('Title'), 'Loading Test')
    await user.type(screen.getByLabelText('Secret Message'), 'Secret content')
    await user.click(screen.getByRole('button', { name: /create secret/i }))

    expect(screen.getByText('Encrypting...')).toBeInTheDocument()
  })

  it('has correct default values for form fields', () => {
    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    const contentInput = screen.getByLabelText('Secret Message') as HTMLTextAreaElement
    const toggle = screen.getByRole('checkbox', { name: /self-destruct mode/i })

    expect(titleInput.value).toBe('')
    expect(contentInput.value).toBe('')
    expect(toggle).toBeChecked() // deleteAfterView defaults to true
  })

  it('displays informational text about encryption', () => {
    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText(/AES-256/)).toBeInTheDocument()
  })

  it('displays security information after secret creation', async () => {
    const user = userEvent.setup()
    render(<CreateSecretDialog open={true} onOpenChange={mockOnOpenChange} />)

    await user.type(screen.getByLabelText('Title'), 'Security Info Test')
    await user.type(screen.getByLabelText('Secret Message'), 'Secret')
    await user.click(screen.getByRole('button', { name: /create secret/i }))

    await waitFor(() => {
      expect(screen.getByText(/encryption key is embedded in the URL hash/i)).toBeInTheDocument()
    })
  })
})
