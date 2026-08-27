import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type Values = z.infer<typeof schema>

export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onSubmit(values: Values) {
    setSubmitting(true)
    const { error } = await updatePassword(values.password)
    setSubmitting(false)

    if (error) {
      toast.error('Could not reset password', { description: error })
      return
    }

    toast.success('Password updated successfully')
    navigate('/login', { replace: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Set New Password
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Choose a strong password for your SafeWater utility account
        </p>
      </div>

      <Card className="rounded-[28px] border border-border/80 bg-card p-6 sm:p-7 card-soft-shadow">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-foreground">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  {...register('password')}
                  className="pl-10 pr-10 h-11 rounded-xl text-xs sm:text-sm bg-secondary/30 focus:bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] font-semibold text-rose-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-bold text-foreground">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className="pl-10 h-11 rounded-xl text-xs sm:text-sm bg-secondary/30 focus:bg-background"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] font-semibold text-rose-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/25 transition-all mt-2"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Password...
                </span>
              ) : (
                'Update Password & Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
