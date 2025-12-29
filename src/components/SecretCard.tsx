import { useState, useEffect, useMemo } from "react"
import { Link2, Copy, Trash2, Eye, Clock, Flame, Timer } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/alert-dialog"
import { useSecretStore, type Secret } from "@/stores/secretStore"
import { decryptSecret } from "@/lib/crypto"
import { generateShareUrl } from "@/lib/url"

interface SecretCardProps {
  secret: Secret
}

function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "0s"
  if (seconds < 60) return `${Math.ceil(seconds)}s`
  const mins = Math.floor(seconds / 60)
  const secs = Math.ceil(seconds % 60)
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
}

export function SecretCard({ secret }: SecretCardProps) {
  const deleteSecret = useSecretStore((state) => state.deleteSecret)
  const [copied, setCopied] = useState<"link" | "content" | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  // Calculate initial time remaining and set up countdown
  const expiresAt = useMemo(() => {
    if (!secret.autoDestroyAfter) return null
    return secret.createdAt + secret.autoDestroyAfter * 1000
  }, [secret.createdAt, secret.autoDestroyAfter])

  // Update countdown every 100ms for smooth progress bar
  useEffect(() => {
    if (!expiresAt) return

    const updateTimeRemaining = () => {
      const remaining = Math.max(0, (expiresAt - Date.now()) / 1000)
      setTimeRemaining(remaining)

      // Auto-delete when expired
      if (remaining <= 0) {
        deleteSecret(secret.id)
      }
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 100)

    return () => clearInterval(interval)
  }, [expiresAt, deleteSecret, secret.id])

  // Calculate progress percentage (0 = expired, 100 = full time)
  const progressPercent = useMemo(() => {
    if (!secret.autoDestroyAfter || timeRemaining === null) return 100
    return Math.max(0, (timeRemaining / secret.autoDestroyAfter) * 100)
  }, [timeRemaining, secret.autoDestroyAfter])

  // Check if we're in the danger zone (last 20 seconds)
  const isDangerZone = timeRemaining !== null && timeRemaining <= 20 && timeRemaining > 0

  const shareUrl = generateShareUrl(
    {
      t: secret.title,
      c: secret.content,
      b: secret.deleteAfterView,
    },
    secret.encryptionKey
  )

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied("link")
    setTimeout(() => setCopied(null), 2000)
  }

  const copyContent = async () => {
    try {
      const decrypted = await decryptSecret(secret.content, secret.encryptionKey)
      await navigator.clipboard.writeText(decrypted)
      setCopied("content")
      setTimeout(() => setCopied(null), 2000)
    } catch {
      console.error("Failed to decrypt secret")
    }
  }

  const handleDelete = () => {
    deleteSecret(secret.id)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <Card
        className={`
          group overflow-hidden relative
          ${isDangerZone ? "animate-danger-pulse" : ""}
        `}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate mb-2 group-hover:text-[#E07A5F] transition-colors">
                {secret.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {secret.viewCount} views
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(secret.createdAt)}
                </span>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-2">
              {secret.deleteAfterView ? (
                <Badge variant="destructive" className="gap-1">
                  <Flame className="h-3 w-3" />
                  Burns after view
                </Badge>
              ) : (
                <Badge variant="secondary">
                  Persistent
                </Badge>
              )}
              {/* Timer countdown badge */}
              {secret.autoDestroyAfter && timeRemaining !== null && timeRemaining > 0 && (
                <Badge
                  variant="outline"
                  className={`
                    gap-1.5 font-mono tabular-nums transition-all duration-300
                    ${isDangerZone
                      ? "border-red-500/50 text-red-400 bg-red-500/10"
                      : "border-amber-500/30 text-amber-400/90 bg-amber-500/5"
                    }
                  `}
                >
                  <Timer className={`h-3 w-3 ${isDangerZone ? "animate-pulse" : ""}`} />
                  {formatTimeRemaining(timeRemaining)}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-white/[0.04]">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-10"
              onClick={copyLink}
            >
              <Link2 className="h-4 w-4" />
              {copied === "link" ? (
                <span className="text-[#E07A5F]">Copied!</span>
              ) : (
                "Copy Link"
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-10"
              onClick={copyContent}
            >
              <Copy className="h-4 w-4" />
              {copied === "content" ? (
                <span className="text-[#E07A5F]">Copied!</span>
              ) : (
                "Copy Secret"
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-10 w-10 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>

        {/* Animated countdown progress bar */}
        {secret.autoDestroyAfter && timeRemaining !== null && timeRemaining > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20 overflow-hidden">
            <div
              className={`
                h-full transition-all duration-100 ease-linear
                ${isDangerZone
                  ? "countdown-bar-danger"
                  : "countdown-bar"
                }
              `}
              style={{
                width: `${progressPercent}%`,
              }}
            />
            {/* Shimmer effect on the bar */}
            <div
              className="absolute inset-0 countdown-shimmer"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Delete Secret"
        description={`Are you sure you want to delete "${secret.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  )
}
