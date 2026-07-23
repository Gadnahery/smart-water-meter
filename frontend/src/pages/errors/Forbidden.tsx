import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Forbidden() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background text-center">
      <ShieldAlert className="h-10 w-10 text-destructive" />
      <h1 className="text-3xl font-bold text-foreground">403 — Access denied</h1>
      <p className="text-muted-foreground">You don&apos;t have permission to view this page.</p>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  )
}
