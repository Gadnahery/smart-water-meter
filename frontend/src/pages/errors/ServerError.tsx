import { AlertOctagon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ServerError({ onReset }: { onReset?: () => void }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background text-center">
      <AlertOctagon className="h-10 w-10 text-destructive" />
      <h1 className="text-3xl font-bold text-foreground">500 — Something went wrong</h1>
      <p className="max-w-sm text-muted-foreground">
        An unexpected error occurred. Try reloading the page - if it keeps happening, please contact support.
      </p>
      <Button onClick={() => (onReset ? onReset() : window.location.reload())}>Reload</Button>
    </div>
  )
}
