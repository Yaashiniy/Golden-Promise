import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Wallet, ShoppingBag, Award, FileCheck } from 'lucide-react'
import { api } from '../../api/client.js'
import { Reveal } from '../../components/Reveal.jsx'

export default function AdminRevenue() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: async () => (await api.get('/admin/revenue')).data,
  })

  return (
    <div className="bg-blush-100 min-h-[calc(100vh-5rem)]">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10">
        <Link to="/admin" className="inline-flex items-center gap-1 text-burgundy-700 hover:text-burgundy-900 text-sm mb-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <Reveal>
          <h1 className="font-display text-4xl text-burgundy-900">Advertising Revenue</h1>
          <p className="text-burgundy-700 mt-2">
            Monthly recurring revenue from verified vendor subscriptions.
          </p>
        </Reveal>

        {isLoading ? (
          <div className="mt-10 min-h-[30vh] grid place-items-center"><div className="w-10 h-10 rounded-full border-2 border-burgundy-300 border-t-burgundy-800 animate-spin" /></div>
        ) : (
          <>
            <Reveal delay={0.05}>
              <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat Icon={TrendingUp} tone="gold" label="Monthly Recurring Revenue" value={`RM ${Number(data?.monthly_recurring_revenue ?? 0).toLocaleString()}`} highlight />
                <Stat Icon={Wallet} tone="blush" label="Annualised" value={`RM ${Number(data?.annualised ?? 0).toLocaleString()}`} />
                <Stat Icon={ShoppingBag} tone="salmon" label="Paying vendors" value={`${data?.paying_vendors ?? 0} / ${data?.total_vendors ?? 0}`} />
                <Stat Icon={FileCheck} tone="blush" label="Applications pending" value={data?.pending_applications ?? 0} />
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-6 card-surface !bg-blush-50 p-6">
                <h2 className="font-display text-xl text-burgundy-900 mb-4">Revenue by tier</h2>
                <div className="space-y-3">
                  {(data?.by_tier ?? []).map((t) => {
                    const max = Math.max(...(data.by_tier ?? []).map((r) => r.revenue), 1)
                    const pct = (t.revenue / max) * 100
                    return (
                      <div key={t.tier}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-burgundy-900 capitalize">{t.tier} <span className="text-burgundy-600">· RM {t.price}/mo · {t.vendors} vendor{t.vendors === 1 ? '' : 's'}</span></span>
                          <span className="font-medium text-burgundy-900">RM {Number(t.revenue).toLocaleString()}</span>
                        </div>
                        <div className="h-2.5 bg-blush-200 rounded-full overflow-hidden">
                          <div style={{ width: `${pct}%` }} className={`h-full ${t.tier === 'golpro' ? 'bg-gradient-to-r from-gold-500 to-gold-400' : t.tier === 'premium' ? 'bg-gradient-to-r from-burgundy-800 to-burgundy-600' : 'bg-blush-400'}`} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div className="card-surface !bg-blush-50 p-6">
                  <p className="text-sm text-burgundy-700">New vendors this month</p>
                  <p className="font-display text-3xl text-burgundy-900 mt-1">+{data?.growth?.this_month ?? 0}</p>
                  <p className="text-xs text-burgundy-600 mt-1">Last month: +{data?.growth?.last_month ?? 0}</p>
                </div>
                <div className="card-surface !bg-burgundy-900 text-blush-100 p-6">
                  <p className="text-sm opacity-80">Revenue model</p>
                  <p className="font-display text-xl mt-1">Classifieds / directory</p>
                  <p className="text-sm opacity-90 mt-2">Vendors pay to be listed. Couples browse & contact via WhatsApp. No transaction commission — pure subscription revenue.</p>
                </div>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </div>
  )
}

function Stat({ Icon, label, value, tone, highlight }) {
  const tones = {
    blush: 'bg-blush-200 text-burgundy-900',
    salmon: 'bg-salmon-300 text-burgundy-900',
    gold: 'bg-gold-400/30 text-burgundy-900',
  }
  return (
    <div className={`${tones[tone]} rounded-2xl p-5 shadow-[var(--shadow-soft)] ${highlight ? 'ring-2 ring-gold-500' : ''}`}>
      <span className="w-11 h-11 rounded-full bg-burgundy-900 text-blush-100 grid place-items-center"><Icon className="w-4 h-4" /></span>
      <p className="text-xs uppercase tracking-wider opacity-80 mt-3">{label}</p>
      <p className="font-display text-2xl mt-1">{value}</p>
    </div>
  )
}
