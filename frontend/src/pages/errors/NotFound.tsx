import { Link } from 'react-router-dom'
import { Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background text-center">
      <Droplets className="h-10 w-10 text-primary" />
      <h1 className="text-3xl font-bold text-foreground">404 — Page not found</h1>
      <p className="text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  )
}
