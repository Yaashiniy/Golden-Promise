import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Logo } from '../components/Logo.jsx'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
})

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login, logout } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values) {
    try {
      const result = await login(values)
      const u = result.user ?? result

      if (u?.role !== 'admin') {
        await logout()
        toast.error('This sign-in is reserved for administrators.')
        return
      }

      toast.success(`Welcome back, ${u?.name ?? 'Admin'}`)
      navigate('/admin', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Invalid credentials')
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center p-4 bg-[#14090B] overflow-hidden">
      {/* Subtle grid backdrop to feel like an internal tool, not the public site */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[60%] h-[50%] rounded-full bg-burgundy-800/30 blur-[140px]" />

      <div className="relative z-10 w-full max-w-sm bg-[#1D1013] border border-white/10 rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo logoOnly dark className="h-12 mb-4 invert" />
          <span className="w-10 h-10 rounded-full bg-gold-400/10 border border-gold-400/30 grid place-items-center mb-3">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
          </span>
          <span className="text-[11px] font-bold tracking-[0.25em] text-gold-400 uppercase">Restricted access</span>
          <h1 className="text-2xl font-display font-medium text-white mt-1">Admin Sign In</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-white/50 pl-1">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="admin@goldenpromise.my"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm outline-none focus:border-gold-400/50 focus:bg-white/10 transition"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1 pl-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-white/50 pl-1">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm outline-none focus:border-gold-400/50 focus:bg-white/10 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white/80"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1 pl-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-burgundy-950 text-sm font-bold transition cursor-pointer"
            >
              {isSubmitting ? 'Authenticating…' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={() => {
                setValue('email', 'admin@goldenpromise.my', { shouldValidate: true })
                setValue('password', 'password', { shouldValidate: true })
              }}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold transition border border-white/10 cursor-pointer"
            >
              Quick Admin Login
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-[11px] text-white/30">
          Golden Promise internal administration
        </p>
      </div>
    </section>
  )
}
