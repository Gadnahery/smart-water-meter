import { useState } from 'react'
import { format } from 'date-fns'
import { Check, Copy, KeyRound, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatLitres } from '@/lib/format'
import type { WaterToken } from '@/types'
import { cn } from '@/lib/utils'

interface WaterTokenCardProps {
  token: WaterToken
  meterSerial?: string
  onActivate?: (token: WaterToken) => void
  isActivating?: boolean
  className?: string
}

export function WaterTokenCard({
  token,
  meterSerial = 'SWM-000124',
  onActivate,
  isActivating = false,
  className,
}: WaterTokenCardProps) {
  const [copied, setCopied] = useState(false)

  const isReady = token.status === 'ready' || token.status === 'paid'
  const isActive = token.status === 'active'

  function handleCopy() {
    navigator.clipboard.writeText(token.token_code)
    setCopied(true)
    toast.success('Token copied to clipboard', { description: token.token_code })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card
      className={cn(
        'rounded-[24px] border border-border/80 bg-card overflow-hidden card-soft-shadow transition-all',
        isActive && 'border-sky-300 dark:border-sky-800 ring-2 ring-sky-500/20',
        className,
      )}
    >
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs',
                isActive
                  ? 'bg-sky-500 text-white'
                  : isReady
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-secondary text-muted-foreground',
              )}
            >
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground">Water Token</span>
              <span className="text-[11px] text-muted-foreground block">
                Meter {meterSerial}
              </span>
            </div>
          </div>

          <Badge
            variant={isActive ? 'default' : isReady ? 'outline' : 'secondary'}
            className="capitalize text-[11px] font-semibold"
          >
            {token.status}
          </Badge>
        </div>

        {/* Token Code Display Box */}
        <div className="rounded-2xl border-2 border-dashed border-sky-200/80 bg-sky-50/50 p-3.5 sm:p-4 dark:border-sky-800 dark:bg-sky-950/20 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Token Code
            </span>
            <div className="font-mono text-xl sm:text-2xl font-black tracking-widest text-sky-800 dark:text-sky-200 mt-0.5">
              {token.token_code}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-9 px-3 rounded-xl border-sky-300/80 bg-white/80 dark:bg-card/80 hover:bg-white text-xs font-semibold shadow-xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-xl bg-secondary/30 p-2.5">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Allocation</span>
            <span className="font-bold text-foreground mt-0.5 block">{formatLitres(token.allocated_litres)}</span>
          </div>
          <div className="rounded-xl bg-secondary/30 p-2.5">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Amount</span>
            <span className="font-bold text-foreground mt-0.5 block">{formatCurrency(token.total)}</span>
          </div>
          <div className="rounded-xl bg-secondary/30 p-2.5">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Valid Until</span>
            <span className="font-bold text-foreground mt-0.5 block">
              {token.expires_at ? format(new Date(token.expires_at), 'd MMM yyyy') : '30 Days'}
            </span>
          </div>
        </div>

        {/* Action button if ready */}
        {isReady && onActivate && (
          <Button
            onClick={() => onActivate(token)}
            disabled={isActivating}
            className="w-full h-11 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/25"
          >
            <Zap className="h-4 w-4 mr-1.5 fill-current" />
            Activate Water
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
