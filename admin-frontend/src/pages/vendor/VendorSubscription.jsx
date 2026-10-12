import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Check, ShieldCheck, Award, Sparkles, Building, Camera, MessageSquare, LineChart, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { VendorSidebar } from '../../components/VendorSidebar.jsx'
import { Reveal } from '../../components/Reveal.jsx'
import { api } from '../../api/client.js'

export default function VendorSubscription() {
  const qc = useQueryClient()
  const [sidebarOpen] = useState(() => localStorage.getItem('sidebar_left_open') !== 'false')
  const [showDowngradeModal, setShowDowngradeModal] = useState(false)

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['vendor-analytics-sub'],
    queryFn: async () => (await api.get('/vendor-portal/analytics')).data,
  })

  const downgradeFree = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/vendor-portal/select-plan', { tier: 'free' })
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Successfully downgraded to Free')
      qc.invalidateQueries({ queryKey: ['vendor-analytics-sub'] })
      qc.invalidateQueries({ queryKey: ['vendor-analytics-sidebar'] })
      qc.invalidateQueries({ queryKey: ['vendor-analytics'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Downgrade failed')
    }
  })

  const selectPlan = useMutation({
    mutationFn: async (tier) => {
      const { data } = await api.post('/vendor-portal/create-checkout-session', { tier })
      return data
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Upgrade failed')
    }
  })

  const currentTier = analytics?.subscription?.tier ?? 'free'

  const getButtonText = (planId) => {
    if (currentTier === planId) return 'Current Plan'
    
    const tiersOrder = ['free', 'premium', 'elite']
    const currentIndex = tiersOrder.indexOf(currentTier)
    const targetIndex = tiersOrder.indexOf(planId)
    
    if (targetIndex < currentIndex) {
      return planId === 'free' ? 'Downgrade to Free' : 'Downgrade to Premium'
    }
    
    return planId === 'elite' ? 'Upgrade to Elite' : 'Upgrade to Premium'
  }

  const isButtonDisabled = (planId) => {
    if (currentTier === planId) return true
    return selectPlan.isPending || downgradeFree.isPending
  }

  const handlePlanSelection = (planId) => {
    if (isButtonDisabled(planId)) return
    
    if (planId === 'free') {
      setShowDowngradeModal(true)
    } else {
      selectPlan.mutate(planId)
    }
  }

  const PLANS = [
    {
      id: 'free',
      name: 'Free Account',
      price: 'RM 0',
      period: 'lifetime',
      description: 'Perfect for listing a single service and testing out our directory.',
      features: [
        'List 1 wedding business',
        'Standard search ranking',
        'Upload up to 3 portfolio photos',
        'Basic profile contact form',
      ],
      icon: Building,
      accent: 'border-neutral-200 bg-white text-neutral-800',
      btnText: 'Current Plan',
    },
    {
      id: 'premium',
      name: 'Premium Member',
      price: 'RM 199',
      period: 'per year',
      description: 'Increase inquiries with direct WhatsApp contacts and featured placements.',
      features: [
        'List up to 3 wedding businesses',
        'Prioritized search placement',
        'Upload up to 10 portfolio photos',
        'Direct WhatsApp click-to-chat link',
        'Featured Gold Badge on search results',
        'Simple visitor analytics dashboard',
      ],
      icon: Award,
      accent: 'border-gold-300 bg-gradient-to-b from-gold-500/5 to-white text-burgundy-950',
      btnText: 'Upgrade to Premium',
    },
    {
      id: 'elite',
      name: 'Elite Partner',
      price: 'RM 499',
      period: 'per year',
      description: 'Maximum exposure. Get premium double badges and top-of-search boosts.',
      features: [
        'List up to 8 wedding businesses',
        'Top-of-Search Boost (absolute top)',
        'Upload up to 25 HD portfolio photos',
        'Direct WhatsApp click-to-chat link',
        'Double Badge (Featured + Verified)',
        'Detailed conversion analytics reports',
        'Custom suitability template messages',
      ],
      icon: ShieldCheck,
      accent: 'border-burgundy-700/30 bg-burgundy-900/[0.02] text-burgundy-950',
      btnText: 'Upgrade to Elite',
      highlighted: true,
    }
  ]

  if (isLoading) return <Loader />

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#2C2A29]">
      <VendorSidebar />

      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-[270px]' : 'lg:pl-0'
        } pl-4 pr-4 md:pl-10 md:pr-10 pt-28 pb-16 max-w-7xl mx-auto`}
      >
        <Reveal>
          <div className="flex items-center gap-2 text-burgundy-700 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4 text-gold-500" /> Subscription Plans
          </div>
          <h1 className="font-display text-4xl text-[#4E1218] font-bold tracking-tight">Upgrade Your Plan</h1>
          <p className="text-sm text-neutral-600 mt-1">Unlock premium directory boundaries to drive more direct WhatsApp bookings.</p>
        </Reveal>

        <div className="mt-10 grid md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => {
            const isCurrent = currentTier === plan.id
            const Icon = plan.icon

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                className={`flex flex-col justify-between p-6 rounded-2xl border shadow-xs relative transition ${plan.accent} ${
                  plan.highlighted ? 'ring-2 ring-burgundy-800' : ''
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-burgundy-800 text-white shadow-xs">
                    Best Value
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      plan.id === 'elite' ? 'bg-burgundy-900/10 text-burgundy-900' : plan.id === 'premium' ? 'bg-gold-500/10 text-gold-600' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-burgundy-950">{plan.name}</h3>
                  </div>

                  <p className="text-xs text-neutral-600 mt-3">{plan.description}</p>

                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-3xl font-display font-extrabold text-burgundy-950">{plan.price}</span>
                    <span className="text-[11px] text-neutral-500">/ {plan.period}</span>
                  </div>

                  <div className="mt-6 space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span className="text-neutral-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={isButtonDisabled(plan.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isCurrent
                        ? 'bg-neutral-100 text-neutral-500 border border-neutral-200 cursor-not-allowed'
                        : (selectPlan.isPending || downgradeFree.isPending)
                        ? `opacity-60 pointer-events-none cursor-wait ${
                            plan.id === 'elite'
                            ? 'bg-burgundy-800 text-white'
                            : plan.id === 'premium'
                            ? 'bg-gold-500 text-burgundy-950'
                            : 'bg-white border border-neutral-300 text-neutral-800'
                          }`
                        : plan.id === 'elite'
                        ? 'bg-burgundy-800 hover:bg-burgundy-950 text-white shadow-sm'
                        : plan.id === 'premium'
                        ? 'bg-gold-500 hover:bg-gold-600 text-burgundy-950'
                        : 'bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800'
                    }`}
                  >
                    {((selectPlan.isPending && selectPlan.variables === plan.id) || (downgradeFree.isPending && plan.id === 'free')) ? 'Processing...' : getButtonText(plan.id)}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <Reveal delay={0.15}>
          <div className="mt-14 border border-neutral-200 rounded-2xl bg-white p-6 shadow-xs overflow-hidden">
            <h3 className="font-display text-xl text-burgundy-950 font-bold mb-4">Detailed Plan Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-[10px] uppercase tracking-wider text-neutral-400 font-extrabold">
                    <th className="py-3 pr-4">Feature Details</th>
                    <th className="py-3 px-4">Free</th>
                    <th className="py-3 px-4">Premium (RM 199)</th>
                    <th className="py-3 px-4">Elite (RM 499)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-burgundy-950"><Building className="w-4 h-4 inline mr-1 text-burgundy-800" /> Max Listings Limit</td>
                    <td className="py-3 px-4">1 Business</td>
                    <td className="py-3 px-4">3 Businesses</td>
                    <td className="py-3 px-4">8 Businesses</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-burgundy-950"><Camera className="w-4 h-4 inline mr-1 text-burgundy-800" /> Portfolio Photo Gallery</td>
                    <td className="py-3 px-4">Max 3 pictures</td>
                    <td className="py-3 px-4">Max 10 pictures</td>
                    <td className="py-3 px-4 font-bold text-burgundy-800">Max 25 pictures (HD)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-burgundy-950"><MessageSquare className="w-4 h-4 inline mr-1 text-burgundy-800" /> Dynamic WhatsApp Inquiries</td>
                    <td className="py-3 px-4 text-neutral-400">❌ Standard Email form</td>
                    <td className="py-3 px-4">✔️ Click-to-Chat</td>
                    <td className="py-3 px-4 font-bold text-green-700">✔️ Category Booking Templates</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-burgundy-950"><Award className="w-4 h-4 inline mr-1 text-burgundy-800" /> Badges Enabled</td>
                    <td className="py-3 px-4 text-neutral-400">❌ None</td>
                    <td className="py-3 px-4">⭐ Featured Badge</td>
                    <td className="py-3 px-4 font-bold text-burgundy-800">⭐ Featured + Verified Badge</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-burgundy-950"><LineChart className="w-4 h-4 inline mr-1 text-burgundy-800" /> Analytics Access</td>
                    <td className="py-3 px-4 text-neutral-400">❌ None</td>
                    <td className="py-3 px-4">Simple Visited Count</td>
                    <td className="py-3 px-4">Rich Conversions Funnel</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </main>

      {/* Custom Downgrade Confirmation Modal */}
      {showDowngradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-neutral-100 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            
            <h3 className="font-display text-xl text-[#4E1218] font-bold text-center mb-2">
              Downgrade Subscription?
            </h3>
            
            <p className="text-xs text-neutral-500 text-center leading-relaxed mb-6">
              Are you sure you want to downgrade to the <span className="font-bold text-neutral-700">Free Starter</span> plan? Your social links, search priority, and advanced photo gallery slots will be locked immediately.
            </p>
            
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDowngradeModal(false)
                  downgradeFree.mutate()
                }}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Yes, Downgrade
              </button>
              
              <button
                type="button"
                onClick={() => setShowDowngradeModal(false)}
                className="w-full py-2.5 px-4 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Loader() {
  return <div className="min-h-screen grid place-items-center bg-[#FAF8F5]"><div className="w-10 h-10 rounded-full border-2 border-burgundy-300 border-t-burgundy-800 animate-spin" /></div>
}
