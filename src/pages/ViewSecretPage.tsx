import { useEffect, useState } from "react"
import { useLocation, useSearchParams, Link } from "react-router-dom"
import { Lock, Copy, Check, AlertTriangle, ArrowLeft, Flame, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { decryptSecret } from "@/lib/crypto"
import { decodeSecretFromUrl } from "@/lib/url"

export default function ViewSecretPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [title, setTitle] = useState<string | null>(null)
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [burnAfterView, setBurnAfterView] = useState(false)

  useEffect(() => {
    const loadSecret = async () => {
      // Get encrypted data from URL params
      const encodedData = searchParams.get("d")
      if (!encodedData) {
        setError("Invalid secret link - missing data")
        return
      }

      // Get encryption key from hash
      const key = location.hash.slice(1)
      if (!key) {
        setError("Missing encryption key in URL")
        return
      }

      // Decode the secret data
      const secretData = decodeSecretFromUrl(encodedData)
      if (!secretData) {
        setError("Failed to decode secret data. The link may be corrupted.")
        return
      }

      try {
        const content = await decryptSecret(secretData.c, key)
        setTitle(secretData.t)
        setDecryptedContent(content)
        setBurnAfterView(secretData.b)
      } catch {
        setError("Failed to decrypt secret. The key may be invalid.")
      }
    }

    loadSecret()
  }, [location.hash, searchParams])

  const copyContent = async () => {
    if (decryptedContent) {
      await navigator.clipboard.writeText(decryptedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E07A5F]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#E07A5F]/3 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-xl relative animate-scale-in">
        <CardContent className="p-8">
          {error ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold mb-2">Unable to Display Secret</h1>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Link to="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          ) : decryptedContent !== null ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E07A5F] to-[#C65D40]">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold mb-1">{title || "Secret Message"}</h1>
                  <p className="text-muted-foreground">Someone shared this encrypted message with you</p>
                </div>
              </div>

              {/* Status Badge */}
              {burnAfterView && (
                <div className="flex justify-center">
                  <Badge variant="destructive" className="gap-1.5 py-1.5 px-4">
                    <Flame className="h-3.5 w-3.5" />
                    This is a one-time secret
                  </Badge>
                </div>
              )}

              {/* Secret Content */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#E07A5F]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <div className="relative p-6 rounded-xl bg-white/[0.03] border border-white/[0.06] font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {decryptedContent}
                </div>
              </div>

              {/* Security Note */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <Shield className="h-5 w-5 text-[#E07A5F] shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  This message was encrypted end-to-end. The decryption key was only present in the URL you received.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={copyContent} variant="outline" className="flex-1">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
                <Link to="/" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="h-6 w-6 border-2 border-[#E07A5F]/30 border-t-[#E07A5F] rounded-full animate-spin" />
              </div>
              <p className="text-muted-foreground">Decrypting your secret...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
