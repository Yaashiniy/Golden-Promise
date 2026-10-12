import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Briefcase, ArrowRight, Sparkles, Send, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Logo } from '../components/Logo.jsx'
import { setBudgetTotal } from '../api/budget.js'
import { updateProfile } from '../api/profile.js'

const MY_STATES = [
  'Johor','Kedah','Kelantan','Melaka','Negeri Sembilan','Pahang','Perak','Perlis',
  'Pulau Pinang','Sabah','Sarawak','Selangor','Terengganu',
  'Kuala Lumpur','Labuan','Putrajaya',
]


const schema = z
  .object({
    name: z.string().min(2, 'Enter your name'),
    email: z.string().email('Enter valid email'),
    password: z.string().min(8, 'Min 8 characters'),
    password_confirmation: z.string(),
    
    // Step 2
    target_budget: z.preprocess((val) => val ? Number(val) : undefined, z.number().min(1000, 'Min RM 1,000').optional()),
    guest_count: z.preprocess((val) => val ? Number(val) : undefined, z.number().min(10, 'Min 10 guests').optional()),
    wedding_date: z.string().refine((val) => !val || !isNaN(Date.parse(val)), 'Enter valid date').optional(),
    wedding_location: z.string().optional(),

    // Step 3
    culture: z.string().min(1, 'Tell us your cultural tradition'),
    partner_name: z.string().optional(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  })

export default function Signup() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      culture: '',
    }
  })

  const selectedCulture = watch('culture')
  const budgetWatch = watch('target_budget')
  const guestWatch = watch('guest_count')
  const cultureWatch = watch('culture')

  async function nextStep() {
    let isValid = false
    if (step === 1) {
      isValid = await trigger(['name', 'email', 'password', 'password_confirmation'])
      if (isValid) setStep(2)
    } else if (step === 2) {
      isValid = await trigger(['target_budget', 'guest_count', 'wedding_date', 'wedding_location'])
      if (isValid) setStep(3)
    }
  }

  function prevStep() {
    setStep((prev) => Math.max(1, prev - 1))
  }

  async function onSubmit(values) {
    try {
      const result = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
        role: 'couple'
      })

      if (values.target_budget) {
        try {
          await setBudgetTotal(Number(values.target_budget))
        } catch (err) {
          console.error('Budget creation skipped:', err)
        }
      }

      await updateProfile({
        partner_name: values.partner_name || null,
        wedding_date: values.wedding_date || null,
        culture: values.culture || null,
        wedding_location: values.wedding_location || null,
        guest_count: values.guest_count ? Number(values.guest_count) : null,
        onboarded: true,
      })

      toast.success(`Identity active, ${result.user?.name ?? values.name}`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const messages =
        err.response?.data?.errors && Object.values(err.response.data.errors).flat().join(', ')
      toast.error(messages ?? err.response?.data?.message ?? 'Initialization failed')
    }
  }

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 lg:p-8 overflow-hidden bg-white">
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
      
      {/* Moving liquid mesh gradient background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[65%] h-[65%] rounded-full bg-[#FFF0EE] blur-[130px] lg:blur-[180px] opacity-85 animate-mesh-blob-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[65%] h-[65%] rounded-full bg-[#FFF2F0] blur-[130px] lg:blur-[180px] opacity-90 animate-mesh-blob-2" />
      </div>

      {/* Main Split Screen Container */}
      <div className="relative z-10 w-full max-w-6xl bg-white/70 backdrop-blur-2xl rounded-[36px] border border-white/80 shadow-[0_35px_80px_-20px_rgba(78,18,24,0.12)] p-5 lg:p-8 grid md:grid-cols-2 gap-8 items-stretch">
        
        {/* LEFT COLUMN: Clean Form steps */}
        <div className="flex flex-col justify-between p-4 lg:p-8 min-w-0">
          <div>
            <div className="flex justify-center items-center mb-8">
              <Logo logoOnly={true} className="h-16" />
            </div>

            <div className="mb-6">
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#C08E3F] uppercase block mb-1">
                Account creation
              </span>
              <h1 className="text-4xl text-burgundy-900 tracking-tight font-medium font-display">
                Create your account
              </h1>
            </div>

            {/* Step Progress Timeline */}
            <div className="flex items-center justify-between mb-8 relative px-2 max-w-[340px]">
              <div className="absolute left-6 right-6 top-1/2 h-[1px] bg-burgundy-900/10 -translate-y-1/2 z-0" />
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-xs transition duration-300 border ${
                    step >= s
                      ? 'bg-[#C08E3F]/25 border-[#C08E3F]/60 text-[#7B1F2A] font-extrabold shadow-sm backdrop-blur-md'
                      : 'bg-white/40 border-neutral-300/40 text-neutral-400 backdrop-blur-sm'
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Account Setup */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="space-y-3.5"
                  >
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-500 pl-1">Name</label>
                      <input {...register('name')} placeholder="Name" className="input-field-glass-split" autoComplete="name" />
                      {errors.name && <p className="text-burgundy-650 text-xs mt-1 pl-1">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-500 pl-1">Email</label>
                      <input {...register('email')} type="email" placeholder="Email" className="input-field-glass-split" autoComplete="email" />
                      {errors.email && <p className="text-burgundy-650 text-xs mt-1 pl-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-500 pl-1">Password (Min 8 characters)</label>
                      <div className="relative">
                        <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Password" className="input-field-glass-split pr-12" autoComplete="new-password" />
                        <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-burgundy-650 hover:text-burgundy-900" aria-label="Toggle password">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-burgundy-650 text-xs mt-1 pl-1">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-500 pl-1">Confirm password</label>
                      <input {...register('password_confirmation')} type={showPassword ? 'text' : 'password'} placeholder="Confirm password" className="input-field-glass-split" autoComplete="new-password" />
                      {errors.password_confirmation && <p className="text-burgundy-650 text-xs mt-1 pl-1">{errors.password_confirmation.message}</p>}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Wedding Essentials */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="space-y-3.5"
                  >
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-500 pl-1">Wedding Date</label>
                      <input {...register('wedding_date')} type="date" className="input-field-glass-split" />
                      {errors.wedding_date && <p className="text-burgundy-650 text-xs mt-1 pl-1">{errors.wedding_date.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="block text-xs sm:text-sm font-semibold text-neutral-500 pl-1">Budget (RM)</label>
                        <input {...register('target_budget')} type="number" placeholder="RM 30000" className="input-field-glass-split" />
                        {errors.target_budget && <p className="text-burgundy-650 text-xs mt-1 pl-1">{errors.target_budget.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs sm:text-sm font-semibold text-neutral-500 pl-1">Guests</label>
                        <input {...register('guest_count')} type="number" placeholder="200" className="input-field-glass-split" />
                        {errors.guest_count && <p className="text-burgundy-650 text-xs mt-1 pl-1">{errors.guest_count.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-500 pl-1">Location State</label>
                      <select {...register('wedding_location')} className="input-field-glass-split">
                        <option value="">Select state</option>
                        {MY_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                      {errors.wedding_location && <p className="text-burgundy-650 text-xs mt-1 pl-1">{errors.wedding_location.message}</p>}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Tradition & Culture */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="space-y-3.5"
                  >
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-500 pl-1">Your Cultural Tradition</label>
                      <input
                        {...register('culture')}
                        placeholder="e.g. Malay, Chindian, Muslim + Christian, Tamil…"
                        className="input-field-glass-split"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['Malay', 'Chinese', 'Indian', 'Christian', 'Civil', 'Chindian', 'Malay + Chinese'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setValue('culture', s, { shouldValidate: true })}
                            className="px-2.5 py-1 rounded-full text-xs border transition-colors cursor-pointer"
                            style={{
                              borderColor: cultureWatch === s ? '#C08E3F' : 'rgba(123,31,42,0.15)',
                              backgroundColor: cultureWatch === s ? '#C08E3F' : 'rgba(255,255,255,0.4)',
                              color: cultureWatch === s ? '#fff' : '#4E1218',
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] pl-1" style={{ color: '#8A6A6E' }}>Be as specific as you like — Goldie AI reads this to tailor your checklist and budget.</p>
                      {errors.culture && <p className="text-burgundy-650 text-xs mt-1 pl-1">{errors.culture.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-500 pl-1">Partner Name (Optional)</label>
                      <input {...register('partner_name')} placeholder="Partner name" className="input-field-glass-split" />
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 border border-[#a55d07]/40 text-[#a54e07] rounded-full py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-neutral-50/50 transition cursor-pointer flex items-center justify-center"
                  >
                    Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 golden-button"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 golden-button disabled:opacity-60"
                  >
                    {isSubmitting ? 'Initializing...' : 'Start Planning'}
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="mt-8">
            {step === 1 && (
              <p className="text-center text-xs text-burgundy-900/60 mb-6">
                Already registered?{' '}
                <Link to="/login" className="text-burgundy-900 font-bold underline">Login</Link>
              </p>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Image / AI Prompt Card */}
        <div className="relative rounded-[28px] overflow-hidden hidden md:block h-full min-h-[580px]">
          <img
            src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=90"
            alt="Whimsical couple"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950/40 via-transparent to-transparent z-0" />
          
          {/* Floating AI Prompt Box */}
          <div className="absolute bottom-6 left-6 right-6 bg-white/75 backdrop-blur-md rounded-[24px] p-5 shadow-[0_20px_50px_rgba(78,18,24,0.15)] border border-white/60 z-10">
            <span className="text-[10px] font-mono tracking-widest text-burgundy-900/50 uppercase block mb-1">
              Active Session // Goldie AI
            </span>
            <div className="text-sm text-burgundy-950 font-medium leading-relaxed mb-4 min-h-[40px]">
              "Generate a custom RM {budgetWatch || '30,000'} budget breakdown and checklist planner for our {cultureWatch || 'Malay'} wedding of {guestWatch || '200'} guests..."
            </div>
            
            <div className="flex items-center justify-between">
              {/* Tool pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-burgundy-900/5 border border-burgundy-900/10 flex items-center justify-center text-burgundy-900 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                </span>
                <span className="px-2.5 py-1 rounded-full bg-burgundy-900/5 border border-burgundy-900/10 text-[10px] font-mono uppercase text-burgundy-900">
                  Budget & Checklist
                </span>
                <span className="px-2.5 py-1 rounded-full bg-burgundy-900 text-white text-[10px] font-mono uppercase">
                  {cultureWatch || 'Malay'} Tradition
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
