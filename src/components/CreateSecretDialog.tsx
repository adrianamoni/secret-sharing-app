import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Copy, Check, Lock, Sparkles, Timer, Infinity } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSecretStore, type AutoDestroyDuration } from "@/stores/secretStore"
import { encryptSecret } from "@/lib/crypto"
import { generateShareUrl } from "@/lib/url"

const secretSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Secret content is required"),
  deleteAfterView: z.boolean(),
  autoDestroyAfter: z.union([z.literal(30), z.literal(60), z.literal(300), z.null()]),
})

type SecretFormData = z.infer<typeof secretSchema>

const AUTO_DESTROY_OPTIONS: { value: AutoDestroyDuration; label: string; shortLabel: string }[] = [
  { value: null, label: "Never", shortLabel: "∞" },
  { value: 30, label: "30 seconds", shortLabel: "30s" },
  { value: 60, label: "1 minute", shortLabel: "1m" },
  { value: 300, label: "5 minutes", shortLabel: "5m" },
]

interface CreateSecretDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSecretDialog({ open, onOpenChange }: CreateSecretDialogProps) {
  const addSecret = useSecretStore((state) => state.addSecret)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SecretFormData>({
    resolver: zodResolver(secretSchema),
    defaultValues: {
      title: "",
      content: "",
      deleteAfterView: true,
      autoDestroyAfter: null,
    },
  })

  const deleteAfterView = watch("deleteAfterView")
  const autoDestroyAfter = watch("autoDestroyAfter")

  const onSubmit = async (data: SecretFormData) => {
    const { encrypted, key } = await encryptSecret(data.content)

    // Store locally for creator's reference
    addSecret({
      title: data.title,
      content: encrypted,
      encryptionKey: key,
      deleteAfterView: data.deleteAfterView,
      autoDestroyAfter: data.autoDestroyAfter,
    })

    // Generate shareable URL with encrypted data embedded
    const url = generateShareUrl(
      {
        t: data.title,
        c: encrypted,
        b: data.deleteAfterView,
      },
      key
    )
    setShareUrl(url)
  }

  const copyUrl = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setShareUrl(null)
    setCopied(false)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        {!shareUrl ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E07A5F] to-[#C65D40]">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">Create a Secret</DialogTitle>
                  <DialogDescription>
                    Your message will be encrypted with AES-256
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Give your secret a name..."
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-400">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Secret Message</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your confidential message here..."
                  className="min-h-[160px]"
                  {...register("content")}
                />
                {errors.content && (
                  <p className="text-sm text-red-400">{errors.content.message}</p>
                )}
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="space-y-1">
                  <Label htmlFor="deleteAfterView" className="text-base font-medium text-foreground">
                    Self-destruct mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Secret will be permanently deleted after viewing
                  </p>
                </div>
                <Switch
                  id="deleteAfterView"
                  checked={deleteAfterView}
                  onCheckedChange={(checked) => setValue("deleteAfterView", checked)}
                />
              </div>

              {/* Time-based auto-destruction */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-[#E07A5F]" />
                  <Label className="text-base font-medium text-foreground">
                    Auto-destruct timer
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Secret will self-destruct after the selected time
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {AUTO_DESTROY_OPTIONS.map((option) => {
                    const isSelected = autoDestroyAfter === option.value
                    return (
                      <button
                        key={option.value ?? "never"}
                        type="button"
                        onClick={() => setValue("autoDestroyAfter", option.value)}
                        className={`
                          relative flex flex-col items-center justify-center gap-1 p-3 rounded-lg
                          transition-all duration-300 cursor-pointer
                          ${isSelected
                            ? "bg-gradient-to-br from-[#E07A5F] to-[#C65D40] text-white shadow-lg shadow-[#E07A5F]/20"
                            : "bg-white/[0.03] hover:bg-white/[0.06] text-muted-foreground hover:text-foreground border border-white/[0.04] hover:border-white/[0.08]"
                          }
                        `}
                      >
                        {option.value === null ? (
                          <Infinity className={`h-5 w-5 ${isSelected ? "text-white" : ""}`} />
                        ) : (
                          <span className={`text-lg font-semibold ${isSelected ? "text-white" : ""}`}>
                            {option.shortLabel}
                          </span>
                        )}
                        <span className={`text-xs ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                          {option.label}
                        </span>
                        {isSelected && (
                          <div className="absolute inset-0 rounded-lg ring-2 ring-[#E07A5F] ring-offset-2 ring-offset-background" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Encrypting...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Create Secret
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">Secret Created!</DialogTitle>
                  <DialogDescription>
                    Share this secure link with your recipient
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="font-mono text-sm h-12"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-12 w-12"
                  onClick={copyUrl}
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <Lock className="h-4 w-4 shrink-0 mt-0.5 text-[#E07A5F]" />
                  <span>
                    The encryption key is embedded in the URL hash and never sent to any server.
                    Only someone with this exact link can decrypt your secret.
                  </span>
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full sm:w-auto">
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
