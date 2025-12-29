import { useState } from "react"
import { Plus, Shield, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SecretCard } from "@/components/SecretCard"
import { CreateSecretDialog } from "@/components/CreateSecretDialog"
import { useSecretStore } from "@/stores/secretStore"

export default function HomePage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const secrets = useSecretStore((state) => state.secrets)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#E07A5F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-[#E07A5F]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 pt-20 pb-16 max-w-4xl relative">
          {/* Header */}
          <header className="text-center mb-16 opacity-0 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-8">
              <Sparkles className="h-4 w-4 text-[#E07A5F]" />
              <span className="text-sm text-muted-foreground">End-to-end encrypted</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="block text-foreground">Share secrets.</span>
              <span className="block gradient-text">Stay secure.</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
              Create encrypted messages that self-destruct after being viewed.
              Your secrets never touch our servers.
            </p>
          </header>

          {/* CTA Button */}
          <div className="flex justify-center mb-20 opacity-0 animate-fade-in-up stagger-2">
            <Button
              onClick={() => setDialogOpen(true)}
              size="lg"
              className="group relative overflow-hidden px-10 py-7 text-lg animate-glow-pulse"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                Create New Secret
              </span>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-20">
            {[
              {
                icon: Shield,
                title: "AES-256 Encryption",
                description: "Military-grade encryption keeps your secrets safe",
              },
              {
                icon: Sparkles,
                title: "Self-Destruct",
                description: "Messages can auto-delete after being viewed",
              },
              {
                icon: Shield,
                title: "Zero Knowledge",
                description: "Encryption keys never leave your browser",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300 opacity-0 animate-fade-in-up stagger-${i + 3}`}
              >
                <feature.icon className="h-8 w-8 text-[#E07A5F] mb-4 transition-transform group-hover:scale-110" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secrets List Section */}
      <div className="container mx-auto px-6 pb-20 max-w-4xl">
        {secrets.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">Your Secrets</h2>
              <span className="text-sm text-muted-foreground">{secrets.length} total</span>
            </div>
            <div className="grid gap-4">
              {secrets.map((secret, index) => (
                <div
                  key={secret.id}
                  className="opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                >
                  <SecretCard secret={secret} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/[0.02] border border-white/[0.04] mb-6">
              <Shield className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-lg">No secrets yet</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Create your first encrypted secret above</p>
          </div>
        )}
      </div>

      <CreateSecretDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
