import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, CheckCircle2, Copy, Droplets, Loader2, Sparkles, Wallet, Waves, Zap } from 'lucide-react'
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
import { useCreateToken, useActivateToken } from '@/hooks/useWaterTokens'
import { formatCurrency, formatLitres } from '@/lib/format'
import type { WaterToken } from '@/types'

interface GetWaterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meterId?: string
  meterSerial?: string
  onActivated?: () => void
}

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000]
// Real Tanzania DAWASA / EWURA Standard Tariff: TSh 1,663 per 1,000 Litres (1 m3) = TSh 1.663 / L
const TARIFF_PER_LITRE = 1.663 
const TAX_RATE = 0.05 // 5% VAT

export function GetWaterDialog({
  open,
  onOpenChange,
  meterId,
  meterSerial = 'SWM-000124',
  onActivated,
}: GetWaterDialogProps) {
  const { customer } = useAuth()
  const createToken = useCreateToken()
  const activateToken = useActivateToken()

  const [selectedLitres, setSelectedLitres] = useState<number>(5000)
  const [customLitres, setCustomLitres] = useState<string>('')
  const [isCustom, setIsCustom] = useState(false)
  const [step, setStep] = useState<'select' | 'payment' | 'token' | 'confirm_activate' | 'activating'>('select')
  const [createdToken, setCreatedToken] = useState<WaterToken | null>(null)
  const [activationPhase, setActivationPhase] = useState<'connecting' | 'opening' | 'flowing'>('connecting')
  const [copied, setCopied] = useState(false)

  const activeLitres = isCustom ? Number(customLitres) || 0 : selectedLitres
  const baseAmount = activeLitres * TARIFF_PER_LITRE
  const tax = Math.round(baseAmount * TAX_RATE)
  const totalAmount = baseAmount + tax

  function handleSelectPreset(amount: number) {
    setIsCustom(false)
    setSelectedLitres(amount)
    setCustomLitres('')
  }

  function handleCustomInput(val: string) {
    const num = val.replace(/\D/g, '')
    setCustomLitres(num)
    setIsCustom(true)
  }

  function handleCopyToken() {
    if (!createdToken) return
    navigator.clipboard.writeText(createdToken.token_code)
    setCopied(true)
    toast.success('Token copied to clipboard', { description: createdToken.token_code })
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSimulatePayment() {
    if (!customer) {
      toast.error('Please log in to purchase water')
      return
    }

    if (activeLitres <= 0) {
      toast.error('Please select a valid water volume')
      return
    }

    try {
      const token = await createToken.mutateAsync({
        customerId: customer.id,
        meterId: meterId || customer.meter_id || 'default-meter',
        allocatedLitres: activeLitres,
        tariff: TARIFF_PER_LITRE,
        taxRate: TAX_RATE,
      })

      setCreatedToken(token)
      setStep('token')
      toast.success('Payment successful (Demo)', {
        description: `Water token ready for ${formatLitres(activeLitres)}`,
      })
    } catch (error) {
      toast.error('Payment simulation failed', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  async function handleExecuteActivation() {
    if (!createdToken || !customer) return
    setStep('activating')
    setActivationPhase('connecting')

    try {
      // Step 1: Connecting to meter
      await new Promise((r) => setTimeout(r, 900))
      setActivationPhase('opening')

      // Step 2: Opening valve
      await new Promise((r) => setTimeout(r, 1100))
      await activateToken.mutateAsync({
        tokenCode: createdToken.token_code,
        customerId: customer.id,
      })

      // Step 3: Water is flowing
      setActivationPhase('flowing')
      await new Promise((r) => setTimeout(r, 1200))

      toast.success('Water is flowing!', {
        description: 'Smart meter valve is open and active.',
      })
      onOpenChange(false)
      resetState()
      onActivated?.()
    } catch (error) {
      setStep('confirm_activate')
      toast.error('Could not activate token', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  function resetState() {
    setStep('select')
    setSelectedLitres(5000)
    setCustomLitres('')
    setIsCustom(false)
    setCreatedToken(null)
    setActivationPhase('connecting')
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      resetState()
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-border/80 rounded-[28px] shadow-2xl bg-card">
        {/* Header */}
        <div className="bg-gradient-to-b from-sky-500/10 via-sky-500/5 to-transparent p-6 pb-3">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-500/30">
                <Droplets className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight">Get Water</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              {step === 'select' && 'Select volume & review price'}
              {step === 'payment' && 'Simulate demo payment without real charge'}
              {step === 'token' && 'Water token ready for activation'}
              {step === 'confirm_activate' && 'Confirm automatic valve opening'}
              {step === 'activating' && 'Opening motorized valve on meter'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-1">
          <AnimatePresence mode="wait">
            {/* 1. VOLUME SELECTION STEP */}
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    How much water do you need?
                  </Label>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    {PRESET_AMOUNTS.map((amount) => {
                      const isSelected = !isCustom && selectedLitres === amount
                      return (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handleSelectPreset(amount)}
                          className={`relative flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all ${
                            isSelected
                              ? 'border-sky-500 bg-sky-50 font-bold text-sky-700 shadow-sm ring-2 ring-sky-500/20 dark:bg-sky-950/40 dark:text-sky-300'
                              : 'border-border bg-card text-foreground hover:border-sky-300/80 hover:bg-secondary/40'
                          }`}
                        >
                          <span className="text-xl font-black">{amount.toLocaleString()}</span>
                          <span className="text-xs font-medium text-muted-foreground">Litres</span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-3">
                    <Label htmlFor="custom" className="text-xs text-muted-foreground">
                      Custom amount (Litres)
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="custom"
                        type="text"
                        placeholder="e.g. 7500"
                        value={customLitres}
                        onChange={(e) => handleCustomInput(e.target.value)}
                        className={`pr-12 rounded-xl ${isCustom ? 'border-sky-500 ring-2 ring-sky-500/20' : ''}`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        Litres
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="rounded-2xl border border-border/80 bg-secondary/30 p-4 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Water allocation</span>
                    <span className="font-semibold text-foreground">{formatLitres(activeLitres)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Water rate</span>
                    <span>TSh {TARIFF_PER_LITRE} / L</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Water</span>
                    <span>{formatCurrency(baseAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between font-bold text-base text-foreground">
                    <span>Total</span>
                    <span className="text-sky-600 dark:text-sky-400">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => setStep('payment')}
                  disabled={activeLitres <= 0}
                  className="w-full h-12 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-base shadow-lg shadow-sky-600/25"
                >
                  Continue to payment
                </Button>
              </motion.div>
            )}

            {/* 2. DEMO PAYMENT STEP */}
            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Demo payment</h4>
                      <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                        This is a demonstration. No real money will be charged.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border p-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Water Allocation</span>
                    <span className="font-bold text-foreground">{formatLitres(activeLitres)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-lg font-black text-sky-600 dark:text-sky-400">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('select')} className="flex-1 h-12 rounded-2xl">
                    Back
                  </Button>
                  <Button
                    onClick={handleSimulatePayment}
                    disabled={createToken.isPending}
                    className="flex-[2] h-12 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-base shadow-lg shadow-sky-600/25"
                  >
                    {createToken.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="h-4 w-4 mr-1.5" />
                    )}
                    Simulate Payment
                  </Button>
                </div>
              </motion.div>
            )}

            {/* 3. TOKEN READY SCREEN */}
            {step === 'token' && createdToken && (
              <motion.div
                key="token"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <CheckCircle2 className="h-7 w-7" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground">Water token ready</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Payment successful. You can activate water immediately.
                  </p>
                </div>

                {/* Token Box */}
                <div className="rounded-2xl border-2 border-dashed border-sky-300/80 bg-sky-50/50 p-4 dark:border-sky-800 dark:bg-sky-950/20 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Water Token Code
                  </span>
                  <div className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-sky-800 dark:text-sky-200">
                    {createdToken.token_code}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToken}
                    className="h-8 px-3 rounded-xl border-sky-300/80 text-xs font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1 text-muted-foreground" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>

                {/* Summary row */}
                <div className="grid grid-cols-3 gap-2 text-xs text-left bg-secondary/30 rounded-xl p-3">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Allocation</span>
                    <span className="font-bold text-foreground">{formatLitres(createdToken.allocated_litres)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Meter</span>
                    <span className="font-bold font-mono text-foreground">{meterSerial}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Valid Until</span>
                    <span className="font-bold text-foreground">30 Days</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <Button
                    onClick={() => setStep('confirm_activate')}
                    className="w-full h-12 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-base shadow-lg shadow-sky-600/25"
                  >
                    <Zap className="h-4 w-4 mr-1.5 fill-current" />
                    Activate Water
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleClose(false)}
                    className="w-full text-xs text-muted-foreground"
                  >
                    Save for later
                  </Button>
                </div>
              </motion.div>
            )}

            {/* 4. CONFIRM ACTIVATION STEP */}
            {step === 'confirm_activate' && createdToken && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-sky-200/80 bg-sky-50/60 p-4 dark:border-sky-800 dark:bg-sky-950/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white shrink-0">
                      <Waves className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">Activate water?</h4>
                      <p className="text-xs text-muted-foreground">
                        This will open your smart meter and start your water session.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border p-4 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Meter</span>
                    <span className="font-mono font-bold text-foreground">{meterSerial}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Allocation</span>
                    <span className="font-bold text-foreground">{formatLitres(createdToken.allocated_litres)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Token Code</span>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{createdToken.token_code}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('token')}
                    className="flex-1 h-12 rounded-2xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleExecuteActivation}
                    className="flex-[2] h-12 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-base shadow-lg shadow-sky-600/25"
                  >
                    <Zap className="h-4 w-4 mr-1.5 fill-current" />
                    Activate
                  </Button>
                </div>
              </motion.div>
            )}

            {/* 5. ACTIVATING REALTIME TRANSITION STEP */}
            {step === 'activating' && (
              <motion.div
                key="activating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-6 space-y-6 text-center"
              >
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                  {activationPhase === 'connecting' && (
                    <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
                  )}
                  {activationPhase === 'opening' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    >
                      <Waves className="h-10 w-10 text-sky-600" />
                    </motion.div>
                  )}
                  {activationPhase === 'flowing' && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                    >
                      <Droplets className="h-10 w-10 text-emerald-500" />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {activationPhase === 'connecting' && 'Connecting to meter...'}
                    {activationPhase === 'opening' && 'Opening valve...'}
                    {activationPhase === 'flowing' && 'Water is flowing!'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {activationPhase === 'connecting' && `Handshaking with ${meterSerial}`}
                    {activationPhase === 'opening' && 'Sending valve actuator signal'}
                    {activationPhase === 'flowing' && 'Flow rate 8.4 L/min detected'}
                  </p>
                </div>

                {/* Progress indicators */}
                <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                  <div
                    className={`h-1.5 flex-1 rounded-full ${
                      activationPhase === 'connecting' || activationPhase === 'opening' || activationPhase === 'flowing'
                        ? 'bg-sky-500'
                        : 'bg-secondary'
                    }`}
                  />
                  <div
                    className={`h-1.5 flex-1 rounded-full ${
                      activationPhase === 'opening' || activationPhase === 'flowing'
                        ? 'bg-sky-500'
                        : 'bg-secondary'
                    }`}
                  />
                  <div
                    className={`h-1.5 flex-1 rounded-full ${
                      activationPhase === 'flowing' ? 'bg-emerald-500' : 'bg-secondary'
                    }`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
