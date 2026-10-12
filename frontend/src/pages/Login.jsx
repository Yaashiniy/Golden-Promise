import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Briefcase, ArrowRight, Send, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Logo } from '../components/Logo.jsx'
import LoveDeathRobotsLoader from '../components/LoveDeathRobotsLoader.jsx'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
})

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [activeTab, setActiveTab] = useState('couple')

  // Support deep linking to vendor tab via query param or state
  useEffect(() => {
    if (location.pathname === '/vendor-login' || new URLSearchParams(location.search).get('type') === 'vendor') {
      setActiveTab('vendor')
    }
    
    // If redirected from a protected route
    if (location.state?.from?.pathname) {
      toast('Please sign in first to access that page.', { id: 'auth-redirect', icon: '🔒' })
    }
  }, [location])

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: new URLSearchParams(location.search).get('email') || '',
    },
  })

  function fillDemo(email, password) {
    setValue('email', email)
    setValue('password', password)
  }

  async function onSubmit(values) {
    try {
      const result = await login(values)
      const u = result.user ?? result
      toast.success(`Welcome back, ${u?.name ?? ''}`)

      let defaultRedirect = '/dashboard'
      if (u?.role === 'admin') defaultRedirect = '/admin'
      else if (u?.role === 'vendor') defaultRedirect = '/vendor-portal'

      const from = location.state?.from?.pathname
      const redirect = (from && from !== '/login') ? from : defaultRedirect
      
      setShowLoader(true)
      setTimeout(() => {
        navigate(redirect, { replace: true })
      }, 4000)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Invalid credentials')
    }
  }

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 lg:p-8 bg-transparent">
      {showLoader && <LoveDeathRobotsLoader />}
      {/* Background blobs & float animations */}
      <style>{`
        @keyframes mesh-blob-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -50px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
        }
        @keyframes mesh-blob-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-60px, 60px) scale(1.08); }
        }
        .animate-mesh-blob-1 { animation: mesh-blob-1 20s ease-in-out infinite; }
        .animate-mesh-blob-2 { animation: mesh-blob-2 24s ease-in-out infinite; }
        
        .input-field-glass-split {
          width: 100%;
          padding: 0.95rem 1.25rem;
          border-radius: 16px;
          background-color: #FAF8F5;
          border: 1px solid rgba(78, 18, 24, 0.08);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: #4E1218;
          transition: all 0.3s ease;
        }
        .input-field-glass-split:focus {
          background-color: #FFFFFF;
          border-color: #7B1F2A;
          box-shadow: 0 0 0 3px rgba(123, 31, 42, 0.06);
          outline: none;
        }
        .input-field-glass-split::placeholder {
          color: rgba(78, 18, 24, 0.35);
          font-family: var(--font-sans);
          font-size: 0.9rem;
        }
      `}</style>
      
      {/* Main Split Screen Container */}
      <div className="relative z-10 w-full max-w-6xl bg-white/70 backdrop-blur-2xl rounded-[36px] border border-white/80 shadow-[0_35px_80px_-20px_rgba(78,18,24,0.12)] p-5 lg:p-8 grid md:grid-cols-2 gap-8 items-stretch">
        
        {/* LEFT COLUMN: Form fields */}
        <div className="flex flex-col justify-between p-4 lg:p-8 min-w-0">
          <div>
            <div className="flex justify-center items-center mb-6">
              <Logo logoOnly={true} className="h-16" />
            </div>
            
            {/* TABS */}
            <div className="flex p-1 bg-burgundy-900/5 rounded-2xl mb-8 border border-burgundy-900/10">
              <button
                type="button"
                onClick={() => setActiveTab('couple')}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'couple' 
                    ? 'bg-white text-burgundy-900 shadow-sm' 
                    : 'text-burgundy-900/60 hover:text-burgundy-900'
                }`}
              >
                Couple
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('vendor')}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'vendor' 
                    ? 'bg-white text-burgundy-900 shadow-sm' 
                    : 'text-burgundy-900/60 hover:text-burgundy-900'
                }`}
              >
                Vendor
              </button>
            </div>

            <div className="mb-8">
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#C08E3F] uppercase block mb-1">
                {activeTab === 'couple' ? 'Welcome back' : 'Vendor console access'}
              </span>
              <h1 className="text-4xl text-burgundy-900 tracking-tight font-medium font-display">
                {activeTab === 'couple' ? 'Sign in to your account' : 'Vendor Sign In'}
              </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-neutral-500 pl-1">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Email"
                  className="input-field-glass-split"
                  autoComplete="email"
                />
                {errors.email && <p className="text-burgundy-650 text-xs mt-1 pl-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-neutral-500 pl-1">Password</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="input-field-glass-split pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-burgundy-650 hover:text-burgundy-900"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-burgundy-650 text-xs mt-1 pl-1">{errors.password.message}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full golden-button disabled:opacity-60"
                >
                  {isSubmitting ? 'Authenticating...' : 'Sign in'}
                </button>
              </div>
            </form>

            {/* Test credentials shortcut */}
            <div className="mt-8 pt-6 border-t border-burgundy-900/5">
              <p className="text-[11px] font-bold tracking-[0.25em] text-burgundy-900/50 uppercase mb-3 pl-1">Quick test logins</p>
              {activeTab === 'vendor' ? (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo('vendor@goldenpromise.my', 'password')}
                    className="bg-white hover:bg-neutral-50 border border-neutral-200/80 py-2.5 rounded-xl text-[11px] font-bold text-[#4E1218] transition cursor-pointer text-center"
                  >
                    Free Vendor
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('vendorpremium@goldenpromise.my', 'password')}
                    className="bg-white hover:bg-neutral-50 border border-neutral-200/80 py-2.5 rounded-xl text-[11px] font-bold text-[#4E1218] transition cursor-pointer text-center"
                  >
                    Premium Vendor
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('vendorelite@goldenpromise.my', 'password')}
                    className="bg-white hover:bg-neutral-50 border border-neutral-200/80 py-2.5 rounded-xl text-[11px] font-bold text-[#4E1218] transition cursor-pointer text-center"
                  >
                    Elite Vendor
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo('couple@goldenpromise.my', 'password')}
                    className="bg-white hover:bg-neutral-50 border border-neutral-200/80 py-2.5 rounded-xl text-[11px] font-bold text-[#4E1218] transition cursor-pointer text-center"
                  >
                    Demo Couple
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-center text-xs text-burgundy-900/60 mb-6">
              {activeTab === 'couple' ? (
                <>Not a member? <Link to="/signup" className="text-burgundy-900 font-bold underline">Sign Up</Link></>
              ) : (
                <>New wedding service provider? <Link to="/become-vendor" className="text-burgundy-900 font-bold underline">Become Vendor</Link></>
              )}
            </p>
          </div>
        </div>

        {/* Shared login card for couple and vendor access */}
        <div className="relative rounded-[28px] overflow-hidden hidden md:block h-full min-h-[580px]">
            <img
              src="https://images.unsplash.com/photo-1525772764200-be829a350797?auto=format&fit=crop&w=1200&q=90"
              alt="Wedding ceremony"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover motion-reduce:hidden"
              src="/vendor-login-background.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950/40 via-transparent to-transparent z-0" />
            
            {/* Floating AI Prompt Box */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/75 backdrop-blur-md rounded-[24px] p-5 shadow-[0_20px_50px_rgba(78,18,24,0.15)] border border-white/60 z-10">
              <span className="text-[10px] font-mono tracking-widest text-burgundy-900/50 uppercase block mb-1">
                Authentication Active // Goldie AI
              </span>
              <div className="text-sm text-burgundy-950 font-medium leading-relaxed mb-4 min-h-[40px]">
                "Accessing secure session data. Re-initializing custom wedding checklists, budget tools, and direct WhatsApp vendor matching..."
              </div>
              
              <div className="flex items-center justify-between">
                {/* Tool pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-burgundy-900/5 border border-burgundy-900/10 flex items-center justify-center text-burgundy-900 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-burgundy-900 text-white text-[10px] font-mono uppercase">
                    Secure SPA Auth
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-burgundy-900/5 border border-burgundy-900/10 text-[10px] font-mono uppercase text-burgundy-900">
                    Goldie AI Planner
                  </span>
                </div>

                {/* Action Button */}
                <span className="w-8 h-8 rounded-full bg-burgundy-900 text-white flex items-center justify-center cursor-pointer shadow-md">
                  <Send className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
        </div>

      </div>
    </section>
  )
}
