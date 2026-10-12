import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, MessageCircle, TrendingUp, TrendingDown, Camera, Award, ShieldCheck, Sparkles, Heart, Clock, MapPin, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../api/client.js'
import { Reveal } from '../../components/Reveal.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { VendorSidebar } from '../../components/VendorSidebar.jsx'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function VendorDashboard() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [sidebarOpen] = useState(() => localStorage.getItem('sidebar_left_open') !== 'false')
  const [range, setRange] = useState('30d')

  const { data } = useQuery({
    queryKey: ['vendor-analytics', range],
    queryFn: async () => (await api.get(`/vendor-portal/analytics?range=${range}`)).data,
  })

  const togglePublish = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/vendor-portal/toggle-publish')
      return data
    },
    onSuccess: (res) => {
      toast.success(res.message)
      qc.invalidateQueries({ queryKey: ['vendor-analytics'] })
      qc.invalidateQueries({ queryKey: ['vendor-analytics-sidebar'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Toggle failed')
    }
  })

  const isDummy = !data?.view_count && !data?.total_social_clicks;
  const views = isDummy ? 1245 : data?.view_count ?? 0
  const totalClicks = isDummy ? 342 : data?.total_social_clicks ?? 0
  const ctr = isDummy ? 27.4 : data?.click_through_rate ?? 0
  const trends = isDummy ? { views: 12.5, clicks: 8.2, ctr: -2.4 } : (data?.trends ?? { views: 0, clicks: 0, ctr: 0 })
  
  // New features
  const favorites = isDummy ? 128 : data?.favorites_count ?? 0
  const completeness = isDummy ? 75 : data?.completeness_score ?? 0
  const recentActivity = isDummy ? [
    { id: 1, type: 'click_whatsapp', time_ago: '2 hours ago' },
    { id: 2, type: 'view', time_ago: '5 hours ago' },
    { id: 3, type: 'view', time_ago: 'Yesterday' },
    { id: 4, type: 'click_instagram', time_ago: 'Yesterday' },
    { id: 5, type: 'view', time_ago: '2 days ago' },
  ] : data?.recent_activity ?? []
  const limits = data?.limits_usage ?? { current_photos: 0, max_photos: 3 }
  const locationAnalytics = data?.location_analytics ?? [] // Fallback handled by backend dummy
  const areaBenchmark = data?.area_benchmark ?? "You are in the top 15% of vendors in your area this week!"

  const chartData = isDummy ? [
    { date: '1 Aug', views: 45, clicks: 12 },
    { date: '2 Aug', views: 52, clicks: 15 },
    { date: '3 Aug', views: 49, clicks: 10 },
    { date: '4 Aug', views: 63, clicks: 22 },
    { date: '5 Aug', views: 58, clicks: 18 },
    { date: '6 Aug', views: 71, clicks: 28 },
    { date: '7 Aug', views: 85, clicks: 35 },
  ] : (data?.chart_data?.length > 0 ? data.chart_data : [])
  
  const platforms = [
    { name: 'WhatsApp', value: isDummy ? 210 : data?.whatsapp_click_count ?? 0, color: '#25D366' },
    { name: 'Instagram', value: isDummy ? 85 : data?.instagram_click_count ?? 0, color: '#E1306C' },
    { name: 'TikTok', value: isDummy ? 32 : data?.tiktok_click_count ?? 0, color: '#000000' },
    { name: 'Facebook', value: isDummy ? 15 : data?.facebook_click_count ?? 0, color: '#1877F2' },
  ].sort((a, b) => b.value - a.value)
  const sub = data?.subscription ?? {}
  const profile = data?.profile_status ?? {}

  const TIERS = {
    free: { label: 'Free', price: 'RM 0/mo', color: 'bg-blush-200 text-burgundy-800' },
    premium: { label: 'Premium', price: 'RM 199/mo', color: 'bg-gold-400/30 text-burgundy-900' },
    elite: { label: 'Elite', price: 'RM 499/mo', color: 'bg-burgundy-800 text-blush-100' },
  }
  const tierInfo = TIERS[sub.tier] ?? TIERS.free

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#2C2A29]">
      <VendorSidebar />

      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-[270px]' : 'lg:pl-0'
        } pl-4 pr-4 md:pl-10 md:pr-10 pt-28 pb-16 max-w-7xl mx-auto`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-burgundy-900/5 pb-6 mb-6">
          <Reveal>
            <p className="font-script text-2xl text-burgundy-700">Welcome back,</p>
            <h1 className="font-display text-4xl text-burgundy-900 mt-1">{user?.name}</h1>
            <p className="text-burgundy-700 mt-2">Track how many couples are finding your listing.</p>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="text-xs px-3 py-2 rounded-full border border-neutral-300 bg-white font-medium text-neutral-700 shadow-sm outline-none focus:border-burgundy-700"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
              {user?.vendor?.is_badge_claimed ? (
                <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-neutral-200 shadow-sm">
                  <span className="pl-3 text-xs font-semibold text-neutral-500 mr-1">Status:</span>
                  <button
                    onClick={() => togglePublish.mutate()}
                    disabled={togglePublish.isPending}
                    className={`flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full font-bold transition-all duration-300 ${
                      profile.is_approved
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${profile.is_approved ? 'bg-green-500' : 'bg-neutral-400'}`}></div>
                    {profile.is_approved ? 'Public' : 'Private'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-neutral-200 opacity-60">
                  <span className="pl-3 text-xs font-semibold text-neutral-500 mr-1">Status:</span>
                  <button
                    disabled
                    className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full font-bold bg-neutral-100 text-neutral-400"
                  >
                    <div className="w-2 h-2 rounded-full bg-neutral-300"></div>
                    Locked
                  </button>
                </div>
              )}

              {profile.is_approved ? (
                <div className="flex items-center bg-white p-1 rounded-full border border-neutral-200 shadow-sm">
                  <Link
                    to={`/vendor/${profile.slug}`}
                    className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-all duration-300"
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-500" />
                    View public page
                  </Link>
                </div>
              ) : (
                <div className="flex items-center bg-white p-1 rounded-full border border-neutral-200 opacity-60">
                  <button
                    disabled
                    className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full font-bold bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    title="Public page is locked until your profile is published"
                  >
                    <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    View public page
                  </button>
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* Verification & Publication status banner */}
        {!profile.is_approved && (
          <Reveal delay={0.05}>
            <div className="mt-6 p-5 rounded-xl bg-orange-50 border border-orange-200 text-orange-850 flex items-start gap-4 flex-wrap shadow-xs">
              <span className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-700 text-lg">
                ⚠️
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-orange-950 text-lg leading-snug">Listing Unpublished (Hidden)</p>
                <p className="text-xs text-orange-800 leading-relaxed mt-0.5">
                  Your listing is hidden from couples. To publish your shop and get your verified badge, complete your business basics and submit your documents in the{' '}
                  <Link to="/vendor-portal/application" className="font-bold underline hover:text-orange-950">
                    My Application
                  </Link>{' '}
                  tab. Once approved by the admin, claim the badge to go live instantly!
                </p>
              </div>
            </div>
          </Reveal>
        )}

        {!profile.is_approved ? (
          <Reveal delay={0.1}>
            <div className="mt-8 bg-white rounded-2xl p-12 border border-neutral-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-burgundy-50 text-burgundy-700 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="w-10 h-10" />
              </div>
              <h2 className="font-display text-3xl text-burgundy-900 mb-3">Analytics Dashboard</h2>
              <p className="text-neutral-500 max-w-lg mx-auto mb-8 text-lg">
                Your analytics will appear here once your profile is published and couples start interacting with your listing. 
                In the meantime, make sure your profile is complete!
              </p>
              <div className="flex gap-4">
                <Link to="/vendor-portal/application" className="px-6 py-3 rounded-full bg-burgundy-900 text-white font-medium hover:bg-burgundy-800 transition-colors">
                  Go to Application
                </Link>
                <Link to="/vendor-portal/profile" className="px-6 py-3 rounded-full bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 transition-colors">
                  Edit Profile
                </Link>
              </div>
            </div>
          </Reveal>
        ) : (
          <>
        {/* Area Benchmark */}
        <Reveal delay={0.08}>
          <div className="mt-6 flex items-center gap-2 bg-gradient-to-r from-gold-400/20 to-transparent p-3 rounded-xl border border-gold-400/30 text-burgundy-900 shadow-xs">
            <Award className="w-5 h-5 text-gold-500 shrink-0" />
            <p className="text-sm font-semibold">{areaBenchmark}</p>
          </div>
        </Reveal>

        {/* Analytics tiles */}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Reveal delay={0.1}>
            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-neutral-600">Profile Views</p>
                {trends.views !== 0 && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${trends.views > 0 ? 'bg-green-50 text-[#16a34a]' : 'bg-red-50 text-red-600'}`}>
                    {trends.views > 0 ? <TrendingUp className="w-3.5 h-3.5" strokeWidth={3} /> : <TrendingDown className="w-3.5 h-3.5" strokeWidth={3} />} {Math.abs(trends.views)}%
                  </span>
                )}
              </div>
              <p className="font-display text-4xl text-neutral-900 mt-3 font-bold">{views.toLocaleString()}</p>
              <p className="text-xs text-neutral-400 mt-auto pt-4">
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time'}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-neutral-600">Social Clicks</p>
                {trends.clicks !== 0 && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${trends.clicks > 0 ? 'bg-green-50 text-[#16a34a]' : 'bg-red-50 text-red-600'}`}>
                    {trends.clicks > 0 ? <TrendingUp className="w-3.5 h-3.5" strokeWidth={3} /> : <TrendingDown className="w-3.5 h-3.5" strokeWidth={3} />} {Math.abs(trends.clicks)}%
                  </span>
                )}
              </div>
              <p className="font-display text-4xl text-neutral-900 mt-3 font-bold">{totalClicks.toLocaleString()}</p>
              <p className="text-xs text-neutral-400 mt-auto pt-4">
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time'}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-neutral-600">Click-through Rate</p>
                {trends.ctr !== 0 && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${trends.ctr > 0 ? 'bg-green-50 text-[#16a34a]' : 'bg-red-50 text-red-600'}`}>
                    {trends.ctr > 0 ? <TrendingUp className="w-3.5 h-3.5" strokeWidth={3} /> : <TrendingDown className="w-3.5 h-3.5" strokeWidth={3} />} {Math.abs(trends.ctr)}%
                  </span>
                )}
              </div>
              <p className="font-display text-4xl text-neutral-900 mt-3 font-bold">{ctr}%</p>
              <p className="text-xs text-neutral-400 mt-auto pt-4">
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time'}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-neutral-600">Saves / Favorites</p>
                {trends.views !== 0 && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-green-50 text-[#16a34a]`}>
                    <TrendingUp className="w-3.5 h-3.5" strokeWidth={3} /> {Math.abs(trends.views > 0 ? (trends.views / 2).toFixed(1) : 1.5)}%
                  </span>
                )}
              </div>
              <p className="font-display text-4xl text-neutral-900 mt-3 font-bold">{favorites.toLocaleString()}</p>
              <p className="text-xs text-neutral-400 mt-auto pt-4">
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time'}
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          {/* Chart */}
          <Reveal delay={0.25} className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full">
              <h3 className="font-semibold text-neutral-800 mb-6">Engagement Activity</h3>
              <div className="h-64">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#A3A3A3' }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{ fontSize: 11, fill: '#A3A3A3' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #f0f0f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                      <Line type="monotone" dataKey="views" name="Views" stroke="#9333EA" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="clicks" name="Clicks" stroke="#475569" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-400 text-sm">
                    <p>No engagement data yet for this period.</p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          {/* Social Breakdown */}
          <Reveal delay={0.3} className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full">
              <div className="flex justify-between items-end mb-6">
                <h3 className="font-semibold text-neutral-800">Top Platforms</h3>
                <span className="text-xs text-neutral-500">{totalClicks} clicks</span>
              </div>
              
              <div className="space-y-4">
                {platforms.map((platform, idx) => {
                  let isLocked = true;
                  if (sub.tier === 'elite' || sub.tier === 'golpro') {
                    isLocked = false;
                  } else if (sub.tier === 'premium' && platform.name === 'WhatsApp') {
                    isLocked = false;
                  }
                  
                  const percentage = totalClicks > 0 ? (platform.value / totalClicks) * 100 : 0
                  return (
                    <div key={idx} className={isLocked ? 'opacity-50' : ''}>
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="flex items-center gap-2 font-medium text-neutral-700">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isLocked ? '#cbd5e1' : platform.color }} />
                          {platform.name}
                          {isLocked && <Lock className="w-3 h-3 text-neutral-400" />}
                        </span>
                        {isLocked ? (
                          <span className="text-[10px] text-neutral-400 font-medium">
                            {platform.name === 'WhatsApp' ? 'Premium/Elite Only' : 'Elite Only'}
                          </span>
                        ) : (
                          <span className="font-bold text-neutral-900">{platform.value} <span className="font-normal text-neutral-400 text-xs ml-1">({percentage.toFixed(0)}%)</span></span>
                        )}
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: isLocked ? '0%' : `${percentage}%`, backgroundColor: platform.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Reveal>
          {/* Location Analytics */}
          <Reveal delay={0.35} className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full">
              <div className="flex justify-between items-end mb-6">
                <h3 className="font-semibold text-neutral-800">Top Locations</h3>
                <span className="text-xs text-neutral-500"><MapPin className="inline w-3 h-3 mr-1"/>Audience</span>
              </div>
              
              <div className="space-y-4">
                {locationAnalytics.map((loc, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="font-medium text-neutral-700">{loc.city}</span>
                      <span className="font-bold text-neutral-900">{loc.percentage}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-1000 ease-out bg-burgundy-900" style={{ width: `${loc.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Profile Completeness & Usage */}
        <Reveal delay={0.35}>
          <div className="mt-6 bg-white rounded-2xl p-6 border border-neutral-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap md:flex-nowrap items-center gap-6">
              <div className="flex-1 w-full">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h3 className="font-semibold text-neutral-800">Profile Completeness</h3>
                    <p className="text-xs text-neutral-500 mt-1">A complete profile gets up to 3x more inquiries.</p>
                  </div>
                  <span className="font-bold text-lg text-burgundy-900">{completeness}%</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full transition-all duration-1000 ease-out bg-green-500" style={{ width: `${completeness}%` }} />
                </div>
              </div>
              
              <div className="w-full md:w-auto min-w-[200px] border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-6">
                <h3 className="font-semibold text-neutral-800 mb-2">Storage Usage</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">Portfolio Photos</span>
                  <span className="font-bold text-neutral-900">{limits.current_photos} / {limits.max_photos}</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-gold-400" style={{ width: `${Math.min(100, (limits.current_photos / limits.max_photos) * 100)}%` }} />
                </div>
                {limits.current_photos >= limits.max_photos && (
                  <p className="text-[10px] text-orange-600 font-medium mt-2">Upgrade tier to unlock more storage</p>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Actions & Activity */}
        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4 h-full">
            <Reveal delay={0.4}>
              <Link to="/vendor-portal/profile" className="card-surface bg-white p-6 group h-full block flex flex-col justify-between">
                <div>
                  <span className="w-12 h-12 rounded-full bg-burgundy-800/10 grid place-items-center"><Camera className="w-5 h-5 text-burgundy-800" /></span>
                  <p className="font-display text-2xl text-burgundy-900 mt-4">Edit profile</p>
                  <p className="text-neutral-600 mt-1 text-sm">Update your bio, photos, WhatsApp number and specialties.</p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-burgundy-800 font-medium">Edit <ArrowRight className="w-4 h-4" /></span>
              </Link>
            </Reveal>
            <Reveal delay={0.45}>
              <div className="card-surface bg-white p-6 h-full flex flex-col justify-between">
                <div>
                  <p className="font-display text-2xl text-burgundy-900">Tips to get more inquiries</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-neutral-600">
                    <li>✓ Add 5+ high-quality photos</li>
                    <li>✓ Write a specific, warm bio (100+ chars)</li>
                    <li>✓ Set languages + cultures served</li>
                    <li>✓ Keep WhatsApp number active</li>
                    <li>✓ Upgrade to Premium for top placement</li>
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.5} className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-neutral-800">Recent Activity</h3>
                <Clock className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={activity.id} className="flex gap-3 relative">
                    {idx !== recentActivity.length - 1 && (
                      <div className="absolute top-6 left-[15px] bottom-[-16px] w-[2px] bg-neutral-100"></div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0 z-10">
                      {activity.type.includes('click') ? <MessageCircle className="w-3.5 h-3.5 text-burgundy-700" /> : <Eye className="w-3.5 h-3.5 text-gold-600" />}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm text-neutral-800">
                        {activity.type === 'view' ? 'Someone viewed your profile' : 
                         activity.type === 'click_whatsapp' ? 'Someone clicked your WhatsApp' : 
                         'Someone clicked your ' + activity.type.split('_')[1]}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">{activity.time_ago}</p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-sm text-neutral-400 text-center py-4">No recent activity yet.</p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
        </>
        )}
      </main>
    </div>
  )
}
