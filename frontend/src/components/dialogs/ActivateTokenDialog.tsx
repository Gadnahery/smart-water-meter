import { useState } from 'react'
import { Droplets, KeyRound, Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { useActivateToken } from '@/hooks/useWaterTokens'

interface ActivateTokenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ActivateTokenDialog({ open, onOpenChange, onSuccess }: ActivateTokenDialogProps) {
  const { customer } = useAuth()
  const activateToken = useActivateToken()
  const [tokenInput, setTokenInput] = useState('')

  function handleInputChange(raw: string) {
    // Only allow digits and format as "XXXX XXXX XXXX"
    const digits = raw.replace(/\D/g, '').slice(0, 12)
    const parts: string[] = []
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4))
    }
    setTokenInput(parts.join(' '))
  }

  async function handleActivate() {
    if (!customer) {
      toast.error('Please sign in first')
      return
    }

    if (tokenInput.replace(/\s/g, '').length < 8) {
      toast.error('Please enter a valid water token code')
      return
    }

    try {
      await activateToken.mutateAsync({
        tokenCode: tokenInput,
        customerId: customer.id,
      })

      toast.success('Water token activated!', {
        description: 'Valve is opening and water is flowing to your meter.',
      })

      onOpenChange(false)
      setTokenInput('')
      onSuccess?.()
    } catch (error) {
      toast.error('Activation failed', {
        description: error instanceof Error ? error.message : 'Invalid or expired token',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-border/80 rounded-[28px] shadow-2xl">
        <div className="bg-gradient-to-b from-sky-500/10 via-sky-500/5 to-transparent p-6 pb-2">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-500/30">
                <KeyRound className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight">Activate Token</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter your 12-digit water token to open the valve.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-3 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token-code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Token Code
            </Label>
            <Input
              id="token-code"
              type="text"
              placeholder="4829 1736 2041"
              value={tokenInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="text-center font-mono text-xl tracking-widest h-13 rounded-2xl border-sky-200 focus-visible:ring-sky-500"
              autoFocus
            />
          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-3.5 dark:border-sky-900/40 dark:bg-sky-950/20 text-xs text-sky-800 dark:text-sky-300 flex items-start gap-2.5">
            <Droplets className="h-4 w-4 shrink-0 mt-0.5 text-sky-500" />
            <p>
              Once activated, your smart valve opens automatically and tracks live consumption until your token allocation finishes.
            </p>
          </div>

          <Button
            onClick={handleActivate}
            disabled={activateToken.isPending || tokenInput.replace(/\s/g, '').length < 8}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold text-base shadow-lg shadow-sky-500/25"
          >
            {activateToken.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Zap className="h-5 w-5 mr-1.5 fill-current" />
            )}
            Activate Token
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
