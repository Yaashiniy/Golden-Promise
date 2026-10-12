import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { X, ExternalLink, Lock, Check, Eye, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Reveal } from '../../components/Reveal.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { api } from '../../api/client.js'
import { fetchVendor, fetchVendorCategories } from '../../api/vendors.js'
import { VendorSidebar } from '../../components/VendorSidebar.jsx'
import { PublishToggle } from '../../components/PublishToggle.jsx'

const RELIGIONS = ['Malay', 'Chinese', 'Indian', 'Christian', 'Sikh', 'Civil']
const LANGUAGES = ['Bahasa Malaysia', 'English', 'Mandarin', 'Cantonese', 'Hokkien', 'Tamil', 'Hindi']
const STATES = ['Johor','Kedah','Kelantan','Kuala Lumpur','Labuan','Melaka','Negeri Sembilan','Pahang','Penang','Perak','Perlis','Putrajaya','Sabah','Sarawak','Selangor','Terengganu']
const VENUE_TYPES = ['Indoor', 'Outdoor', 'Indoor / Outdoor', 'Beach']

export default function VendorProfile() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [sidebarOpen] = useState(() => window.innerWidth >= 1024)

  // Load current vendor profile via the couple-facing endpoint
  const { data, isLoading } = useQuery({
    queryKey: ['my-vendor'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me')
      return data
    },
    enabled: !!user,
  })

  const vendorSlug = data?.vendor?.slug
  const detailQ = useQuery({
    queryKey: ['my-vendor-detail', vendorSlug],
    queryFn: () => fetchVendor(vendorSlug),
    enabled: !!vendorSlug,
  })

  const categoriesQuery = useQuery({
    queryKey: ['vendor-categories'],
    queryFn: fetchVendorCategories,
  })
  const categories = categoriesQuery.data ?? []

  const v = detailQ.data?.vendor ?? detailQ.data
  const tier = v?.subscription_tier ?? 'free'
  const profileDraftKey = user?.id ? `golden-promise:vendor-profile-draft:${user.id}` : null

  const initialized = useRef(false)
  const [form, setForm] = useState({
    name: '', bio: '', area: '', state: '', address: '',
    price_from: 0, years_experience: 0, instagram: '', tiktok: '', facebook: '', response_time_hours: 24,
    whatsapp_phone: '', website: '',
    specialties: [], languages: [], religion_focus: [],
    vendor_category_id: '', business_type: 'ssm', custom_category: '',
    venue_type: '', style: '', capacity: '', map_url: '', is_all_inclusive: false, also_for: [],
  })

  useEffect(() => {
    if (!v || initialized.current) return
    const serverForm = {
      name: v.name ?? '',
      bio: v.bio ?? '',
      area: v.area ?? '',
      state: v.state ?? '',
      address: v.address ?? '',
      price_from: v.price_from ?? 0,
      years_experience: v.years_experience ?? 0,
      instagram: v.instagram ?? '',
      tiktok: v.tiktok ?? '',
      facebook: v.facebook ?? '',
      response_time_hours: v.response_time_hours ?? 24,
      whatsapp_phone: v.whatsapp_phone ?? '',
      website: v.website ?? '',
      specialties: v.specialties ?? [],
      languages: v.languages ?? [],
      religion_focus: v.religion_focus ?? [],
      vendor_category_id: (v.category?.slug === 'others' || v.category_slug === 'others') ? null : (v.vendor_category_id ?? ''),
      business_type: v.business_type ?? 'ssm',
      custom_category: v.custom_category ?? '',
      venue_type: v.venue_type ?? '',
      style: v.style ?? '',
      capacity: v.capacity ?? '',
      map_url: v.map_url ?? '',
      is_all_inclusive: v.is_all_inclusive ?? false,
      also_for: v.also_for ?? [],
    }

    let draft = null
    if (profileDraftKey) {
      try {
        draft = JSON.parse(localStorage.getItem(profileDraftKey))
      } catch {
        localStorage.removeItem(profileDraftKey)
      }
    }

    setForm(draft ? { ...serverForm, ...draft } : serverForm)
    initialized.current = true
  }, [profileDraftKey, v])

  useEffect(() => {
    if (!initialized.current || !profileDraftKey) return
    localStorage.setItem(profileDraftKey, JSON.stringify(form))
  }, [form, profileDraftKey])

  useEffect(() => {
    if (v?.business_type) {
      setForm((f) => ({ ...f, business_type: v.business_type }))
    }
  }, [v?.business_type])

  const handleUploadBrochure = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('brochure', file)

    try {
      toast.loading('Uploading brochure...', { id: 'brochure' })
      const { data: updatedVendor } = await api.post('/vendor-portal/upload-brochure', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      qc.setQueryData(['my-vendor-detail', vendorSlug], (old) => {
        if (!old) return old
        if (old.vendor) {
          return { ...old, vendor: { ...old.vendor, brochure_path: updatedVendor.brochure_path } }
        }
        return { ...old, brochure_path: updatedVendor.brochure_path }
      })
      toast.success('Brochure uploaded!', { id: 'brochure' })
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Upload failed', { id: 'brochure' })
    }
  }

  const handleDeleteBrochure = async () => {
    if (!window.confirm('Are you sure you want to delete this brochure?')) return

    try {
      toast.loading('Deleting brochure...', { id: 'delete-brochure' })
      const { data: updatedVendor } = await api.post('/vendor-portal/delete-brochure')
      qc.setQueryData(['my-vendor-detail', vendorSlug], (old) => {
        if (!old) return old
        if (old.vendor) {
          return { ...old, vendor: { ...old.vendor, brochure_path: null } }
        }
        return { ...old, brochure_path: null }
      })
      toast.success('Brochure deleted!', { id: 'delete-brochure' })
    } catch (err) {
      toast.error('Failed to delete brochure.', { id: 'delete-brochure' })
    }
  }

  const save = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.patch('/vendor-portal/profile', payload)
      return data
    },
    onSuccess: () => {
      if (profileDraftKey) localStorage.removeItem(profileDraftKey)
      qc.invalidateQueries({ queryKey: ['my-vendor-detail'] })
      qc.invalidateQueries({ queryKey: ['vendor', vendorSlug] })
      toast.success('Profile saved')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Save failed'),
  })

  const togglePublish = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/vendor-portal/toggle-publish')
      return data
    },
    onSuccess: (res) => {
      toast.success(res.message)
      qc.invalidateQueries({ queryKey: ['my-vendor-detail'] })
      qc.invalidateQueries({ queryKey: ['vendor-analytics-sidebar'] })
      qc.invalidateQueries({ queryKey: ['vendor-analytics'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Toggle failed')
    }
  })

  if (isLoading || detailQ.isLoading || categoriesQuery.isLoading) return <Loader />
  if (!v) {
    return (
      <div className="vendor-portal relative min-h-screen bg-[#FAF8F5] text-[#2C2A29]">
        <VendorSidebar />
        <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-[270px]' : 'lg:pl-0'} p-10 text-center`}>
          <p className="font-display text-2xl text-burgundy-900">No vendor profile linked to your account.</p>
          <p className="text-sm text-burgundy-700 mt-2">Contact admin if this is unexpected.</p>
        </main>
      </div>
    )
  }

  const set = (k, val) => setForm((p) => ({ ...p, [k]: val }))
  const isVenueCategory = categories.find(c => c.id === Number(form.vendor_category_id))?.slug === 'venues'
  let sectionNum = 0

  return (
    <div className="vendor-portal relative min-h-screen bg-[#FAF8F5] text-[#2C2A29]">
      <VendorSidebar />

      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-[270px]' : 'lg:pl-0'} px-4 sm:px-6 lg:px-8 pt-28 pb-16 max-w-[1536px] mx-auto`}>
        <div className="flex items-center justify-end gap-3 mb-2">
          {v.is_badge_claimed ? (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${v.is_approved ? 'text-green-700' : 'text-orange-700'}`}>
                {v.is_approved ? 'Live' : 'Hidden'}
              </span>
              <PublishToggle
                checked={v.is_approved}
                onChange={() => togglePublish.mutate()}
                disabled={togglePublish.isPending}
                title={v.is_approved ? 'Click to unpublish' : 'Click to publish'}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400">Claim Badge First</span>
              <PublishToggle
                checked={false}
                disabled
                title="You must claim your verified setup badge in My Application before you can publish your profile"
              />
            </div>
          )}

          {v.is_approved ? (
            <div className="flex items-center bg-white p-1 rounded-full border border-neutral-200 shadow-sm">
              <Link
                to={`/vendor/${v.slug}`}
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
        {!v.is_approved && !v.is_badge_claimed && (
          <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-sm flex items-start gap-3 shadow-xs">
            <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-700">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <p className="font-bold text-orange-900">Profile Unpublished (Hidden)</p>
              <p className="mt-0.5 text-xs text-orange-800 leading-relaxed">
                Your profile is currently hidden from the public directory. To publish it, please fill out your business details and submit your verification documents in the{' '}
                <Link to="/vendor-portal/application" className="font-bold underline hover:text-orange-950">
                  My Application
                </Link>{' '}
                tab. Once approved by the admin and your badge is claimed, it will instantly go live!
              </p>
            </div>
          </div>
        )}

        <Reveal>
          <h1 className="font-display text-4xl text-burgundy-900 font-bold">Edit your profile</h1>
          <p className="text-burgundy-700 mt-1">This is exactly what couples will see on your public page.</p>
        </Reveal>

        {/* Single unified card with all sections */}
        <div className="mt-8 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">

          {/* ── Business Basics ── */}
          <SectionBlock number={++sectionNum} title="Business Basics">
            <Grid>
              <Field label="Business name" value={form.name} onChange={(v) => set('name', v)} />
              <Select label="State" value={form.state} onChange={(v) => set('state', v)} options={STATES.map(s => ({ value: s, label: s }))} />
              <Field label="City / area" value={form.area} onChange={(v) => set('area', v)} placeholder="e.g. Petaling Jaya" />
              <Field label="Starting price (RM)" type="number" value={form.price_from} onChange={(v) => set('price_from', Number(v))} />
            </Grid>
            <Field label="Full address" value={form.address} onChange={(v) => set('address', v)} className="mt-4" />

            <Grid className="mt-4">
              <label className="block">
                <span className="block text-sm text-neutral-600 mb-1.5 font-medium">Business Category</span>
                <select
                  value={form.vendor_category_id || 'other'}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === 'other') {
                      setForm(f => ({ ...f, vendor_category_id: null, custom_category: '' }))
                    } else {
                      setForm(f => ({ ...f, vendor_category_id: Number(val), custom_category: '' }))
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-[#4E1218] text-neutral-800 text-sm"
                >
                  {categories.filter(c => c.slug !== 'others').map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="other">Other / Custom Service</option>
                </select>
              </label>

              <div>
                <label className="block">
                  <span className="block text-sm text-neutral-600 mb-1.5 font-medium flex items-center gap-1.5">
                    Business Setup Type
                    {v?.is_badge_claimed ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[#C08E3F] inline" />
                    )}
                  </span>
                  <input
                    type="text"
                    value={form.business_type === 'ssm' ? 'SSM Registered Company' : form.business_type === 'startup' ? 'Startup Team / Agency' : 'Homemade / Freelancer'}
                    disabled={true}
                    className="w-full px-4 py-2.5 bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed text-sm rounded-full"
                  />
                </label>
                {!v?.is_badge_claimed && (
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Managed by admin. Submit SSM documents in the{' '}
                    <Link to="/vendor-portal/application" className="text-[#4E1218] font-bold hover:underline">My Application</Link> tab.
                  </p>
                )}
              </div>
            </Grid>

            {(!form.vendor_category_id) && (
              <Field
                label="Specify your business/service type"
                value={form.custom_category}
                onChange={(val) => set('custom_category', val)}
                placeholder="e.g. Wedding Planner, Henna Troupe"
                className="mt-4"
              />
            )}
          </SectionBlock>

          {/* ── Venue Details (only for the Venues category) ── */}
          {isVenueCategory && (
            <SectionBlock number={++sectionNum} title="Venue Details">
              <Grid>
                <Select label="Venue Type" value={form.venue_type} onChange={(v) => set('venue_type', v)} options={VENUE_TYPES.map(t => ({ value: t, label: t }))} />
                <Field label="Style" value={form.style} onChange={(v) => set('style', v)} placeholder="e.g. Garden Wedding, Modern Ballroom" />
                <Field label="Capacity" value={form.capacity} onChange={(v) => set('capacity', v)} placeholder="e.g. 100–200 pax" />
                <Field
                  label="Map Link"
                  value={form.map_url}
                  onChange={(v) => set('map_url', v)}
                  placeholder="Google Maps link"
                  disabled={tier !== 'elite' && tier !== 'golpro'}
                  locked={tier !== 'elite' && tier !== 'golpro'}
                />
              </Grid>

              <label className="flex items-center gap-2.5 mt-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_all_inclusive}
                  onChange={(e) => set('is_all_inclusive', e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-[#4E1218] focus:ring-[#4E1218] cursor-pointer"
                />
                <span className="text-sm text-neutral-700 font-medium">All-inclusive package (venue + catering + decor)</span>
              </label>

              <div className="mt-4">
                <span className="block text-sm text-neutral-600 mb-1.5 font-medium">Also Suitable For</span>
                <TagInput value={form.also_for} onChange={(v) => set('also_for', v)} placeholder="e.g. Birthday Party, Dinner, Baby Shower" />
              </div>
            </SectionBlock>
          )}

          {/* ── Brochure & Price List ── */}
          <SectionBlock number={++sectionNum} title="Brochure & Price List">
            <p className="text-sm text-neutral-500 mb-4">
              Upload a brochure, rate sheet, or package details (PDF, images, doc) to show couples.
            </p>
            {tier === 'free' ? (
              <div className="p-4 rounded-xl border border-[#C08E3F]/30 bg-[#C08E3F]/5 text-center">
                <Lock className="w-5 h-5 text-[#C08E3F] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#4E1218]">Locked feature</p>
                <p className="text-xs text-neutral-500 mt-1">Upgrade to Premium or Elite to upload brochures and rate sheets.</p>
                <Link to="/vendor-portal/subscription" className="text-xs text-[#C08E3F] hover:underline font-bold mt-2 block">Upgrade Tier ↗</Link>
              </div>
            ) : (
              <div>
                {v?.brochure_path ? (
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 bg-neutral-50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="p-2 bg-[#4E1218]/5 text-[#4E1218] rounded-lg font-bold text-xs uppercase">File</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-neutral-800 truncate">Brochure / Package File</p>
                        <a href={`/storage/${v.brochure_path}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#4E1218] hover:underline font-bold inline-flex items-center gap-1 mt-0.5">
                          View Uploaded File <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <button type="button" onClick={handleDeleteBrochure} className="text-xs text-red-600 hover:text-red-800 font-semibold shrink-0 cursor-pointer">
                      Delete
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-300 hover:border-[#4E1218] rounded-xl cursor-pointer transition bg-neutral-50 hover:bg-white text-neutral-500 hover:text-[#4E1218]">
                    <span className="text-sm font-semibold">Upload Brochure (PDF, doc, img)</span>
                    <span className="text-xs text-neutral-400 mt-1">Max file size 10MB</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleUploadBrochure} className="hidden" />
                  </label>
                )}
              </div>
            )}
          </SectionBlock>

          {/* ── Inquiries & Contacts ── */}
          <SectionBlock number={++sectionNum} title="Inquiries & Contacts">
            <Grid>
              <Field
                label="WhatsApp Phone"
                value={form.whatsapp_phone}
                onChange={(val) => set('whatsapp_phone', val)}
                placeholder="e.g. 60123456789"
              />
              <Field
                label="Business Website URL"
                value={form.website}
                onChange={(val) => set('website', val)}
                disabled={tier !== 'elite' && tier !== 'golpro'}
                placeholder="e.g. https://mybusiness.com"
                locked={tier !== 'elite' && tier !== 'golpro'}
              />
              <Field
                label="Instagram Handle"
                value={form.instagram}
                onChange={(val) => set('instagram', val)}
                disabled={tier !== 'elite' && tier !== 'golpro'}
                placeholder="handle (no @)"
                locked={tier !== 'elite' && tier !== 'golpro'}
              />
              <Field
                label="TikTok Handle"
                value={form.tiktok}
                onChange={(val) => set('tiktok', val)}
                disabled={tier !== 'elite' && tier !== 'golpro'}
                placeholder="handle (no @)"
                locked={tier !== 'elite' && tier !== 'golpro'}
              />
              <Field
                label="Facebook Handle"
                value={form.facebook}
                onChange={(val) => set('facebook', val)}
                disabled={tier !== 'elite' && tier !== 'golpro'}
                placeholder="Page or username"
                locked={tier !== 'elite' && tier !== 'golpro'}
              />
            </Grid>
            {tier !== 'elite' && tier !== 'golpro' && (
              <div className="mt-4 p-3.5 rounded-xl border border-[#C08E3F]/30 bg-[#C08E3F]/5 text-xs text-[#4E1218] font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#C08E3F] shrink-0" />
                <span>Website, Instagram, TikTok, and Facebook are locked. Upgrade to Elite to enable these social links.</span>
              </div>
            )}
          </SectionBlock>

          {/* ── Your Story ── */}
          <SectionBlock number={++sectionNum} title="Your Story">
            <label className="block">
              <span className="block text-sm text-neutral-600 mb-1.5 font-medium">Bio</span>
              <textarea
                rows={6}
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-2xl focus:outline-none focus:border-[#4E1218] text-neutral-800 text-sm resize-none"
              />
            </label>
            <Grid className="mt-4">
              <Field label="Years of experience" type="number" value={form.years_experience} onChange={(v) => set('years_experience', Number(v))} />
              <Field label="Response time (hours)" type="number" value={form.response_time_hours} onChange={(v) => set('response_time_hours', Number(v))} />
            </Grid>
          </SectionBlock>

          {/* ── Specialties & Tags ── */}
          <SectionBlock number={++sectionNum} title="Specialties & Tags">
            <TagInput value={form.specialties} onChange={(v) => set('specialties', v)} placeholder="e.g. Outdoor weddings, Drone shots" />
          </SectionBlock>

          {/* ── Cultures You Serve ── */}
          <SectionBlock number={++sectionNum} title="Cultures You Serve">
            <ChipPicker options={RELIGIONS} value={form.religion_focus} onChange={(v) => set('religion_focus', v)} allowCustom customButtonLabel="Other culture" customPlaceholder="Enter another culture" />
          </SectionBlock>

          {/* ── Languages ── */}
          <SectionBlock number={++sectionNum} title="Languages">
            <ChipPicker options={LANGUAGES} value={form.languages} onChange={(v) => set('languages', v)} allowCustom customButtonLabel="Other language" customPlaceholder="Enter another language" />
          </SectionBlock>

          {/* Save footer */}
          <div className="px-8 py-6 bg-neutral-50 border-t border-neutral-200 flex justify-end">
            <button
              onClick={() => save.mutate(form)}
              disabled={save.isPending}
              className="golden-button"
              style={{ height: '2.75em', fontSize: '0.9rem', padding: '0 2.5rem', borderRadius: '9999px' }}
            >
              {save.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

function SectionBlock({ number, title, children }) {
  return (
    <div className="px-8 py-8 border-b border-neutral-100 last:border-b-0">
      <h2 className="text-lg font-bold text-neutral-800 mb-6">
        <span className="text-[#C08E3F] mr-2">{number}.</span>{title}
      </h2>
      {children}
    </div>
  )
}
function Grid({ children, className = '' }) {
  return <div className={`grid sm:grid-cols-2 gap-4 ${className}`}>{children}</div>
}
function Field({ label, value, onChange, type = 'text', placeholder, disabled = false, locked = false, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm text-neutral-600 mb-1.5 font-medium flex items-center gap-1.5">
        {label}
        {locked && <Lock className="w-3.5 h-3.5 text-[#C08E3F] inline" />}
      </span>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border rounded-full focus:outline-none transition text-sm ${
          disabled
            ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed'
            : 'bg-white border-neutral-300 focus:border-[#4E1218] text-neutral-800'
        }`}
      />
    </label>
  )
}
function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-sm text-neutral-600 mb-1.5 font-medium">{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-[#4E1218] text-neutral-800 text-sm"
      >
        <option value="">Select…</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}
function ChipPicker({ options, value, onChange, allowCustom = false, customButtonLabel = 'Other option', customPlaceholder = 'Enter another option' }) {
  const [customOpen, setCustomOpen] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const customSelections = value.filter((item) => !options.includes(item))

  const addCustomValue = () => {
    const nextValue = customValue.trim()
    if (!nextValue || value.some((item) => item.toLowerCase() === nextValue.toLowerCase())) return
    onChange([...value, nextValue])
    setCustomValue('')
    setCustomOpen(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = value.includes(o)
          return (
            <button key={o} type="button" onClick={() => onChange(active ? value.filter(v => v !== o) : [...value, o])}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                active ? 'bg-burgundy-800 text-blush-100' : 'bg-blush-100 text-burgundy-800 border border-burgundy-200/60 hover:bg-blush-200'
              }`}>{o}</button>
          )
        })}
        {allowCustom && (
          <button type="button" onClick={() => setCustomOpen((open) => !open)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${customOpen ? 'border-[#7B1F2A] bg-[#7B1F2A] text-white' : 'border-dashed border-[#C08E3F] bg-white text-[#7B1F2A] hover:bg-[#FAEDE6]'}`}>
            + {customButtonLabel}
          </button>
        )}
      </div>

      {customSelections.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customSelections.map((culture) => (
            <span key={culture} className="flex items-center gap-1 rounded-full bg-[#4E1218] px-3 py-1.5 text-xs font-semibold text-white">
              {culture}
              <button type="button" onClick={() => onChange(value.filter((item) => item !== culture))} aria-label={`Remove ${culture}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {allowCustom && customOpen && (
        <div className="flex max-w-md gap-2">
          <input
            value={customValue}
            onChange={(event) => setCustomValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addCustomValue()
              }
            }}
            placeholder={customPlaceholder}
            className="min-w-0 flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-800 outline-none focus:border-[#7B1F2A]"
          />
          <button type="button" onClick={addCustomValue} className="rounded-full bg-[#7B1F2A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4E1218]">
            Add
          </button>
        </div>
      )}
    </div>
  )
}
function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState('')
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((t, i) => (
          <span key={i} className="px-2.5 py-1 rounded-full bg-burgundy-800 text-blush-100 text-xs flex items-center gap-1">
            {t} <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))}><X className="w-3 h-3 cursor-pointer" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (input.trim()) { onChange([...value, input.trim()]); setInput('') } } }}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 bg-white border border-neutral-300 rounded-full text-sm focus:outline-none focus:border-[#4E1218] text-neutral-800"
        />
        <button type="button" onClick={() => { if (input.trim()) { onChange([...value, input.trim()]); setInput('') } }} className="px-5 py-2 rounded-full bg-[#4E1218] text-white text-sm cursor-pointer font-semibold hover:bg-[#7B1F2A] transition">Add</button>
      </div>
    </div>
  )
}
function Loader() {
  return <div className="min-h-screen grid place-items-center bg-[#FAF8F5]"><div className="w-10 h-10 rounded-full border-2 border-burgundy-300 border-t-burgundy-800 animate-spin" /></div>
}
