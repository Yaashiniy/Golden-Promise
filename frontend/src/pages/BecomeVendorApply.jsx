import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ChevronDown, CreditCard, Eye, EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { fetchVendorCategories } from '../api/vendors.js'

const TIERS = [
  {
    value: 'free',
    name: 'Free Starter',
    price: 'RM 0/mo',
    desc: 'Perfect for freelancers & home-based startups.',
    color: 'bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
    pill: 'bg-neutral-100 text-neutral-600',
    perks: ['Basic Listing', 'Standard Ranking', 'Direct Client WhatsApp Option']
  },
  {
    value: 'premium',
    name: 'Premium Member',
    price: 'RM 299/mo',
    desc: 'Add more portfolio content and package details.',
    color: 'bg-white shadow-[0_8px_24px_rgba(192,142,63,0.12)] hover:shadow-[0_12px_32px_rgba(192,142,63,0.18)]',
    pill: 'bg-[#C08E3F]/10 text-[#C08E3F]',
    perks: ['10 Portfolio Photos', 'Brochures / Pricing Sheet Upload', 'Direct WhatsApp Enquiries']
  },
  {
    value: 'elite',
    name: 'Elite Partner',
    price: 'RM 399/mo',
    desc: 'Maximum visibility with GolPro top placement.',
    color: 'bg-[#FAF8F6] shadow-[0_12px_32px_rgba(123,31,42,0.12)] hover:shadow-[0_16px_40px_rgba(123,31,42,0.18)]',
    pill: 'bg-burgundy-950 text-white',
    perks: ['25 Portfolio Photos', 'GolPro Badge & Top Placement', 'Brochures & Packages Upload', 'Google Maps Location', 'Instagram, TikTok & Facebook Links']
  }
]

const TESTIMONIALS = [
  {
    text: "Golden Promise has completely transformed our booking process. It is direct, transparent, and connects us with high-value couples across Malaysia without any middleman commissions.",
    author: "Fiona Yeoh",
    role: "Creative Owner of The Bridal Suite",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80"
  },
  {
    text: "We've seen a 300% increase in inquiries since joining. The couples are serious, and being able to chat directly on WhatsApp makes closing the deal effortless.",
    author: "Ahmad Rizwan",
    role: "Lead Photographer, Riz Photography",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80"
  },
  {
    text: "The platform's premium design attracts exactly the type of clientele we want. It feels exclusive and the flat subscription model is incredibly fair.",
    author: "Sarah Lee",
    role: "Founder, Bloom Decor",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
  }
]

export default function BecomeVendorApply() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const catsQ = useQuery({ queryKey: ['vendor-categories'], queryFn: fetchVendorCategories })
  
  const [searchParams, setSearchParams] = useSearchParams()
  const step = parseInt(searchParams.get('step') || '1', 10)
  const selectedTier = searchParams.get('tier') || 'free'

  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const categoryDropdownRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const closeCategoryMenu = (event) => {
      if (!categoryDropdownRef.current?.contains(event.target)) setCategoryOpen(false)
    }
    document.addEventListener('pointerdown', closeCategoryMenu)
    return () => document.removeEventListener('pointerdown', closeCategoryMenu)
  }, [])

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    business_name: '',
    vendor_category_id: '',
    custom_category: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  })

  const categories = catsQ.data ?? []
  const standardCategories = categories.filter((category) =>
    !['other', 'others'].includes(String(category.slug || category.name).toLowerCase())
  )
  const otherCategory = categories.find((category) =>
    ['other', 'others'].includes(String(category.slug || category.name).toLowerCase())
  )
  const selectedCategoryLabel = form.vendor_category_id === 'other'
    ? 'Other'
    : standardCategories.find((category) => String(category.id) === String(form.vendor_category_id))?.name

  const registerVendor = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        whatsapp_phone: form.phone,
        business_name: form.business_name,
        vendor_category_id: form.vendor_category_id === 'other' ? (otherCategory?.id ?? null) : form.vendor_category_id,
        custom_category: form.vendor_category_id === 'other' ? form.custom_category.trim() : null,
        subscription_tier: selectedTier,
      }
      const { data } = await api.post('/auth/register-vendor', payload)
      return data
    },
    onSuccess: async (data) => {
      localStorage.setItem('auth_token', data.token)
      await refresh()
      
      if (data.checkout_url) {
        toast.success('Account created! Redirecting to Stripe for payment...')
        window.location.href = data.checkout_url
      } else {
        toast.success('Account created successfully! Complete your application.')
        navigate('/vendor-portal/application')
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Registration failed. Please check inputs.')
    }
  })

  const handleChoosePlan = (tierVal) => {
    setSearchParams({ step: '2', tier: tierVal })
  }

  const handleFormChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.password || !form.business_name || !form.vendor_category_id) {
      toast.error('All fields marked with * are required')
      return
    }
    if (form.vendor_category_id === 'other' && !form.custom_category.trim()) {
      toast.error('Please state your business category')
      return
    }
    if (form.password !== form.password_confirmation) {
      toast.error('Passwords do not match')
      return
    }
    registerVendor.mutate()
  }

  return (
    <>
      <style>{`
        .golden-button {
          touch-action: manipulation;
          display: inline-block;
          outline: none;
          font-family: inherit;
          font-size: 14px;
          font-weight: bold;
          box-sizing: border-box;
          border-radius: 99px;
          height: 3.2em;
          line-height: 1;
          text-transform: uppercase;
          padding: 0 1.5em;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(110, 80, 20, 0.4),
            inset 0 -2px 5px 1px rgba(139, 66, 8, 1),
            inset 0 -1px 1px 3px rgba(250, 227, 133, 1);
          background-image: linear-gradient(
            160deg,
            #a54e07,
            #b47e11,
            #fef1a2,
            #bc881b,
            #a54e07
          );
          border: 1px solid #a55d07;
          color: rgb(120, 50, 5);
          text-shadow: 0 2px 2px rgba(250, 227, 133, 1);
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          background-size: 100% 100%;
          background-position: center;
        }

        .golden-button:focus,
        .golden-button:hover {
          background-size: 150% 150%;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23),
            inset 0 -2px 5px 1px #b17d10, inset 0 -1px 1px 3px rgba(250, 227, 133, 1);
          border: 1px solid rgba(165, 93, 7, 0.6);
          color: rgba(120, 50, 5, 0.8);
        }

        .golden-button:active {
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(110, 80, 20, 0.4),
            inset 0 -2px 5px 1px #b17d10, inset 0 -1px 1px 3px rgba(250, 227, 133, 1);
        }
        
        .golden-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
      <section className="relative min-h-screen flex items-center justify-center p-4 lg:p-8 overflow-hidden bg-[#FAF8F6]">
      <div className="relative z-10 w-full max-w-6xl bg-white/70 backdrop-blur-2xl rounded-[36px] border border-white/80 shadow-[0_35px_80px_-20px_rgba(78,18,24,0.12)] p-5 lg:p-8 grid md:grid-cols-2 gap-8 items-stretch">
        
        {/* LEFT COLUMN: Form steps */}
        <div className="flex flex-col justify-between p-4 lg:p-8 min-w-0">
          <div>
            <div className="relative flex justify-center items-center mb-10">

              {/* Timeline */}
              <div className="flex items-center justify-center gap-3">
                <div className={`flex flex-col items-center gap-1.5 transition ${step >= 1 ? 'text-burgundy-900' : 'text-neutral-300'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 transition ${step >= 1 ? 'bg-burgundy-900 text-white border-burgundy-900' : 'bg-transparent border-neutral-300'}`}>
                    1
                  </div>
                  <span className="text-[9px] font-mono tracking-widest uppercase font-bold">Plan</span>
                </div>
                <div className={`h-px w-10 transition ${step >= 2 ? 'bg-burgundy-900' : 'bg-neutral-200'}`} />
                <div className={`flex flex-col items-center gap-1.5 transition ${step >= 2 ? 'text-burgundy-900' : 'text-neutral-300'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 transition ${step >= 2 ? 'bg-burgundy-900 text-white border-burgundy-900' : 'bg-transparent border-neutral-300'}`}>
                    2
                  </div>
                  <span className="text-[9px] font-mono tracking-widest uppercase font-bold">Details</span>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: Plan Selection */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="text-center w-full mb-6">
                    <h1 className="text-4xl text-burgundy-900 font-display font-medium">Select a Listing Tier</h1>
                  </div>

                  <div className="space-y-4 pt-2">
                    {TIERS.map((t) => (
                      <div
                        key={t.value}
                        className={`rounded-2xl p-5 flex items-center justify-between transition duration-300 cursor-pointer ${t.color}`}
                        onClick={() => handleChoosePlan(t.value)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-bold text-lg text-burgundy-950">{t.name}</h3>
                          </div>
                          <p className="text-[13px] text-neutral-500 max-w-sm">{t.desc}</p>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end gap-2">
                          <span className="text-xl font-bold text-burgundy-900 font-display">{t.price}</span>
                          <button
                            type="button"
                            className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#C08E3F] to-[#D8AB5A] text-white font-bold text-[10px] uppercase tracking-wider hover:brightness-105 transition cursor-pointer shadow-sm active:scale-[0.98] flex items-center gap-1 group"
                          >
                            Select Plan <ArrowRight className="w-3 h-3 transition group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Registration Details & Payment */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-4"
                >
                  <div className="mb-6 text-center">
                    <h2 className="text-4xl text-burgundy-900 font-display font-medium">Business Account Details</h2>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4 pr-1">
                    <div className="space-y-3">
                      <input type="text" required value={form.name} onChange={(e) => handleFormChange('name', e.target.value)} placeholder="Full Name *" className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-burgundy-800 text-neutral-800 text-sm placeholder-neutral-400" />
                      
                      <input type="email" required value={form.email} onChange={(e) => handleFormChange('email', e.target.value)} placeholder="Email Address *" className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-burgundy-800 text-neutral-800 text-sm placeholder-neutral-400" />
                      
                      <input type="text" required value={form.phone} onChange={(e) => handleFormChange('phone', e.target.value)} placeholder="WhatsApp Phone Number *" className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-burgundy-800 text-neutral-800 text-sm placeholder-neutral-400" />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={(e) => handleFormChange('password', e.target.value)} placeholder="Password (Min 8 chars) *" className="w-full rounded-full border border-neutral-300 bg-white px-4 py-3 pr-12 text-sm text-neutral-800 placeholder-neutral-400 focus:border-burgundy-800 focus:outline-none" />
                          <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-neutral-500 transition hover:text-burgundy-900" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="relative">
                          <input type={showConfirmPassword ? 'text' : 'password'} required value={form.password_confirmation} onChange={(e) => handleFormChange('password_confirmation', e.target.value)} placeholder="Confirm Password *" className="w-full rounded-full border border-neutral-300 bg-white px-4 py-3 pr-12 text-sm text-neutral-800 placeholder-neutral-400 focus:border-burgundy-800 focus:outline-none" />
                          <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-neutral-500 transition hover:text-burgundy-900" aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}>
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input type="text" required value={form.business_name} onChange={(e) => handleFormChange('business_name', e.target.value)} placeholder="Shop / Business Name *" className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-burgundy-800 text-neutral-800 text-sm placeholder-neutral-400" />
                      
                      <div ref={categoryDropdownRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setCategoryOpen((open) => !open)}
                          onKeyDown={(event) => {
                            if (event.key === 'Escape') setCategoryOpen(false)
                          }}
                          aria-haspopup="listbox"
                          aria-expanded={categoryOpen}
                          className={`flex w-full items-center justify-between rounded-full border bg-white py-3 pl-4 pr-3 text-left text-sm font-semibold transition ${categoryOpen ? 'border-[#7B1F2A] ring-4 ring-[#7B1F2A]/10' : 'border-neutral-300 hover:border-[#C08E3F]'}`}
                        >
                          <span className={selectedCategoryLabel ? 'text-neutral-800' : 'text-neutral-500'}>
                            {selectedCategoryLabel || 'Select Business Category... *'}
                          </span>
                          <span className={`ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FAEDE6] text-[#7B1F2A] transition-transform duration-200 ${categoryOpen ? 'rotate-180' : ''}`}>
                            <ChevronDown className="h-4 w-4" />
                          </span>
                        </button>

                        {categoryOpen && (
                          <div
                            role="listbox"
                            aria-label="Business category"
                            className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-[#E8C7BD] bg-white p-2 shadow-[0_16px_36px_-16px_rgba(78,18,24,0.45)]"
                          >
                            {[...standardCategories, { id: 'other', name: 'Other' }].map((category) => {
                              const value = String(category.id)
                              const selected = String(form.vendor_category_id) === value
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  role="option"
                                  aria-selected={selected}
                                  onClick={() => {
                                    handleFormChange('vendor_category_id', value)
                                    setCategoryOpen(false)
                                  }}
                                  className={`flex w-full items-center rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors ${selected ? 'bg-[#7B1F2A] font-semibold text-white' : 'text-neutral-700 hover:bg-[#FAEDE6] hover:text-[#4E1218]'}`}
                                >
                                  {category.name}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {form.vendor_category_id === 'other' && (
                        <input
                          type="text"
                          required
                          value={form.custom_category}
                          onChange={(e) => handleFormChange('custom_category', e.target.value)}
                          placeholder="State your business category *"
                          className="w-full rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:border-burgundy-800 focus:outline-none"
                        />
                      )}

                      {selectedTier !== 'free' && (
                        <div className="space-y-3 border-t border-neutral-200/60 pt-3">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase font-semibold flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-[#C08E3F]" /> Plan Checkout</h3>
                            <span className="text-xs font-bold text-burgundy-900 font-display">{TIERS.find(t => t.value === selectedTier)?.price}</span>
                          </div>
                          <p className="text-[11.5px] text-neutral-500 leading-relaxed pl-1">
                            You will be redirected securely to **Stripe Checkout** to finalize your subscription payment immediately after submitting.
                          </p>
                        </div>
                      )}


                      <div className="pt-4 flex justify-center">
                        <button
                          type="submit"
                          disabled={registerVendor.isPending}
                          className="golden-button flex items-center justify-center gap-2"
                        >
                          <span className="golden-text">{registerVendor.isPending ? 'CREATING...' : 'CREATE ACCOUNT'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 border-t border-burgundy-900/5 pt-4">
            <p className="text-center text-sm text-[#7B1F2A]/75">
              Already a partner?{' '}
              <Link to="/vendor-login" className="font-semibold text-[#4E1218] underline decoration-[#C08E3F] underline-offset-4 transition hover:text-[#7B1F2A]">Login</Link>
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Premium burgundy testimonial column */}
        <div className="relative rounded-[28px] overflow-hidden hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-[#4E1218] to-[#7B1F2A] text-white min-h-[580px]">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="https://assets.mixkit.co/videos/5217/5217-720.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2A0B10]/80 via-[#4E1218]/72 to-[#4E1218]/90" />

          <div className="relative z-10">
            <h2 className="text-4xl font-display font-medium tracking-tight mt-6 leading-tight">
              Grow your wedding business without limits
            </h2>
            <p className="text-sm text-[#FAEDE6]/70 mt-2 leading-relaxed">
              Register as a verified partner and connect with thousands of couples across Malaysia directly on WhatsApp.
            </p>
          </div>

          {/* Testimonial Block */}
          <div className="relative z-10 my-8 min-h-[180px] rounded-2xl bg-white p-6 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.65)]">
            <span className="absolute left-2 top-2 font-serif text-5xl leading-none text-[#C08E3F]/25">"</span>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <p className="pl-6 text-sm italic leading-relaxed text-[#4E1218]">
                  "{TESTIMONIALS[activeTestimonial].text}"
                </p>
                <div className="flex items-center gap-3 mt-4 pl-6">
                  <img
                    src={TESTIMONIALS[activeTestimonial].image}
                    alt={TESTIMONIALS[activeTestimonial].author}
                    className="w-10 h-10 rounded-full object-cover border border-[#C08E3F]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#4E1218]">{TESTIMONIALS[activeTestimonial].author}</p>
                    <p className="text-[10px] font-medium text-[#A07229]">{TESTIMONIALS[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
    </>
  )
}
