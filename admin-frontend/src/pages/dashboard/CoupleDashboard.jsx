import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Calendar, Heart, Check, X,
  Camera, Sparkles,
  Building2, UtensilsCrossed, Flower2, Shirt, Music, Gift, Pencil
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { DashboardSidebar } from '../../components/DashboardSidebar.jsx'
import { fetchBudget } from '../../api/budget.js'
import { fetchChecklist } from '../../api/checklist.js'
import { updateProfile, uploadProfilePhoto } from '../../api/profile.js'

const VENDOR_CATEGORIES = [
  { id: 'venue', label: 'Venue', Icon: Building2 },
  { id: 'catering', label: 'Catering', Icon: UtensilsCrossed },
  { id: 'photography', label: 'Photo & Video', Icon: Camera },
  { id: 'decor', label: 'Decor & Flowers', Icon: Flower2 },
  { id: 'attire', label: 'Bridal Attire', Icon: Shirt },
  { id: 'makeup', label: 'Makeup & Hair', Icon: Sparkles },
  { id: 'entertainment', label: 'Entertainment', Icon: Music },
  { id: 'favors', label: 'Door Gifts', Icon: Gift },
]

export default function CoupleDashboard() {
  const { user, refresh } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem('sidebar_left_open') !== 'false')

  useEffect(() => {
    const handle = () => setSidebarOpen(localStorage.getItem('sidebar_left_open') !== 'false')
    window.addEventListener('sidebar_left_toggle', handle)
    return () => window.removeEventListener('sidebar_left_toggle', handle)
  }, [])

  const initialized = useRef(false)
  const [partner, setPartner] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [culture, setCulture] = useState('')
  const [location, setLocation] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  useEffect(() => {
    if (initialized.current || !user) return
    setPartner(user.partner_name ?? '')
    setWeddingDate(user.wedding_date ? new Date(user.wedding_date).toISOString().split('T')[0] : '')
    setCulture(user.culture ?? 'Malay')
    setLocation(user.wedding_location ?? 'Johor Bahru')
    setGuestCount(user.guest_count ?? '100')
    setBudgetAmount(user.budget?.total_budget ? String(user.budget.total_budget) : '')
    initialized.current = true
  }, [user])

  const budgetQ = useQuery({ queryKey: ['dash', 'budget'], queryFn: fetchBudget, enabled: !!user })
  const checklistQ = useQuery({ queryKey: ['dash', 'checklist'], queryFn: fetchChecklist, enabled: !!user })

  const categories = useMemo(() => budgetQ.data?.categories ?? [], [budgetQ.data?.categories])
  const tasks = useMemo(() => checklistQ.data ?? [], [checklistQ.data])

  const saveMut = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      refresh()
      toast.success('Profile updated successfully')
      setEditModalOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not save profile')
  })

  const photoMut = useMutation({
    mutationFn: uploadProfilePhoto,
    onSuccess: () => {
      refresh()
      toast.success('Photo uploaded')
    },
    onError: () => toast.error('Could not upload photo')
  })

  function onPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
    photoMut.mutate(file)
  }

  function handleSaveDetails(e) {
    e.preventDefault()
    saveMut.mutate({
      partner_name: partner || null,
      wedding_date: weddingDate || null,
      culture: culture || null,
      wedding_location: location || null,
      guest_count: guestCount ? Number(guestCount) : null,
      budget: budgetAmount ? Number(budgetAmount) : null,
      onboarded: true,
    })
  }

  const coupleLabel = user?.name && partner
    ? `${user.name} & ${partner}`
    : user?.name
      ? `${user.name} & Partner`
      : 'Your Wedding'

  const photoUrl = photoPreview || (user?.photo_path ? `/storage/${user.photo_path}` : 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop')

  const daysUntil = useMemo(() => {
    if (!weddingDate && !user?.wedding_date) return null
    const target = new Date(weddingDate || user.wedding_date)
    const now = new Date()
    const diffTime = target.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }, [weddingDate, user])

  const completedTasks = useMemo(() => tasks.filter(t => t.is_completed).length, [tasks])
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#2C2A29]">
      <DashboardSidebar active="overview" />

      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-[286px]' : 'lg:pl-0'} pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1536px] mx-auto`}>
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
          <div>
            <h1 className="font-display text-4xl text-[#4E1218] font-bold tracking-tight">Your wedding</h1>
            <p className="text-sm text-neutral-600 mt-1">Manage your team, track budget, and plan your special day.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditModalOpen(true)}
              aria-label="Edit details"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#7B1F2A] text-white shadow-sm hover:bg-[#4E1218] transition"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Zola Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: Hero Photo & Couple Info */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group bg-neutral-100">
              <img
                src={photoUrl}
                alt="Couple"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Upload Hover Overlay */}
              <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <Camera className="w-8 h-8 mb-2 stroke-[1.5]" />
                <span className="text-xs font-semibold tracking-wider uppercase">Upload Photo</span>
                <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
              </label>

              {/* Days Countdown Overlay Banner */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-center text-white">
                <p className="font-display text-lg font-medium tracking-wide">
                  {daysUntil !== null
                    ? daysUntil > 0
                      ? `${daysUntil} days until "I do"`
                      : daysUntil === 0
                        ? 'Today is your wedding day!'
                        : 'Happily Married!'
                    : 'Set your wedding date'}
                </p>
              </div>
            </div>

            {/* Couple Title */}
            <div className="text-center pt-2">
              <h2 className="font-display text-3xl font-bold text-[#4E1218]">{coupleLabel}</h2>

              {/* Date & Location Pill Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FAEDE6] border border-burgundy-900/10 text-xs font-semibold text-[#4E1218]">
                  <Calendar className="w-3.5 h-3.5 text-[#C08E3F]" />
                  {weddingDate || user?.wedding_date
                    ? new Date(weddingDate || user.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : 'Add Date'}
                </span>

                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FAEDE6] border border-burgundy-900/10 text-xs font-semibold text-[#4E1218]">
                  <MapPin className="w-3.5 h-3.5 text-[#7B1F2A]" />
                  {location || user?.wedding_location || 'Johor Bahru'}
                </span>

                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FAEDE6] border border-burgundy-900/10 text-xs font-semibold text-[#4E1218]">
                  <Heart className="w-3.5 h-3.5 text-[#C08E3F]" />
                  {culture || user?.culture || 'Malay'}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Feature Sections */}
          <div className="lg:col-span-8 lg:border-l lg:border-neutral-200 lg:pl-10 flex flex-col divide-y divide-neutral-200">
            
            {/* Venue and Vendors Section */}
            <div className="pb-10 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-2xl font-bold text-[#4E1218]">Venue and vendors</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                      {categories.length}/10 Shortlisted
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">
                    Calendars book up quickly! Continue nailing down your vendor team.
                  </p>
                </div>

                <Link
                  to="/vendors"
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#7B1F2A] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#4E1218] transition"
                >
                  Explore
                </Link>
              </div>

              {/* Vendor Category Pills */}
              <div className="pt-2 flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
                {VENDOR_CATEGORIES.map((cat) => {
                  const isSaved = categories.some(c => c.name?.toLowerCase().includes(cat.id))
                  const IconComponent = cat.Icon
                  return (
                    <div
                      key={cat.id}
                      className="flex flex-col items-center gap-2 shrink-0 p-2 min-w-[80px] text-center"
                    >
                      <div className="relative w-14 h-14 rounded-full bg-white border border-neutral-200 grid place-items-center shadow-sm">
                        <IconComponent className="w-5 h-5 text-[#7B1F2A]" strokeWidth={1.8} />
                        {isSaved && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white grid place-items-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-[#4E1218] leading-tight">{cat.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Smart Budget Section */}
            <div className="py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display text-2xl font-bold text-[#4E1218]">Budget</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Active</span>
                  </div>
                  <p className="text-xs text-neutral-600 mb-6">
                    Review your budget from time to time to stay on track.
                  </p>

                  <div className="my-4">
                    <p className="text-[10px] uppercase font-bold text-neutral-400">Total Budget</p>
                    <p className="font-display text-4xl font-bold text-[#4E1218]">
                      RM {budgetQ.data?.total_budget?.toLocaleString() ?? '25,000'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    to="/dashboard/budget"
                    className="inline-flex items-center justify-center rounded-full bg-[#7B1F2A] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#4E1218] transition w-full sm:w-auto"
                  >
                    Track
                  </Link>
                </div>
              </div>

            {/* Smart Checklist Section */}
            <div className="py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display text-2xl font-bold text-[#4E1218]">Checklist</h3>
                    <span className="text-xs font-bold text-burgundy-800 bg-burgundy-50 px-2 py-0.5 rounded border border-burgundy-100">
                      {completedTasks} / {tasks.length} Done
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mb-6">
                    AI generated checklist tailored to your wedding date and tradition.
                  </p>

                  {/* Progress Bar */}
                  <div className="my-4">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-neutral-500">Progress</span>
                      <span className="text-[#4E1218]">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-neutral-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#7B1F2A] to-[#C08E3F] transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    to="/dashboard/checklist"
                    className="inline-flex items-center justify-center rounded-full bg-[#7B1F2A] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#4E1218] transition w-full sm:w-auto"
                  >
                    View
                  </Link>
                </div>
              </div>

          </div>

        </div>

      </main>

      {/* Edit Details Modal */}
      <AnimatePresence>
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-neutral-200 shadow-2xl relative"
            >
              <button
                onClick={() => setEditModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 grid place-items-center text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-display text-2xl font-bold text-[#4E1218] mb-1">Edit Wedding Details</h3>
              <p className="text-xs text-neutral-500 mb-6">Goldie AI uses this to tailor your checklist and budget — be as specific as you like.</p>

              <form onSubmit={handleSaveDetails} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Partner Name</label>
                  <input
                    type="text"
                    value={partner}
                    onChange={(e) => setPartner(e.target.value)}
                    placeholder="Enter partner name"
                    className="w-full px-4 py-2.5 rounded-full border border-neutral-300 text-sm focus:outline-none focus:border-burgundy-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Wedding Date</label>
                  <input
                    type="date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full border border-neutral-300 text-sm focus:outline-none focus:border-burgundy-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Cultural Tradition</label>
                  <input
                    type="text"
                    value={culture}
                    onChange={(e) => setCulture(e.target.value)}
                    placeholder="e.g. Malay, Chindian, Muslim + Christian, Tamil + Telugu…"
                    className="w-full px-4 py-2.5 rounded-full border border-neutral-300 text-sm focus:outline-none focus:border-burgundy-800"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['Malay', 'Chinese', 'Indian', 'Christian', 'Civil', 'Chindian', 'Malay + Chinese'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCulture(s)}
                        className="px-2.5 py-1 rounded-full text-xs border transition-colors cursor-pointer"
                        style={{
                          borderColor: culture === s ? '#7B1F2A' : '#e5e7eb',
                          backgroundColor: culture === s ? '#7B1F2A' : 'transparent',
                          color: culture === s ? '#fff' : '#6b7280',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Johor Bahru, KL"
                    className="w-full px-4 py-2.5 rounded-full border border-neutral-300 text-sm focus:outline-none focus:border-burgundy-800"
                  />
                </div>
 
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Guest Count</label>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-4 py-2.5 rounded-full border border-neutral-300 text-sm focus:outline-none focus:border-burgundy-800"
                  />
                </div>
  
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Budget Amount</label>
                  <input
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="RM 30,000"
                    className="w-full px-4 py-2.5 rounded-full border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-burgundy-800"
                  />
                </div>
 
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saveMut.isPending}
                    className="w-full py-3 rounded-full bg-[#4E1218] text-white text-xs font-bold hover:bg-burgundy-900 transition cursor-pointer"
                  >
                    {saveMut.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
