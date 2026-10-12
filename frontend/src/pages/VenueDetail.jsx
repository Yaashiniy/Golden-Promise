import { useParams, Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Star, MapPin, Users, Tag, Calendar, Heart, Sparkles,
  BadgeCheck, Award, Clock, Languages, Share2, ShieldCheck, Wallet,
  Mail, Globe, ExternalLink, Building2, Briefcase, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client.js'
import { fetchVenue } from '../api/venues.js'
import { GoldProBadge } from '../components/GoldProBadge.jsx'
import { useFavorite } from '../hooks/useFavorite.js'
import { Reveal } from '../components/Reveal.jsx'
import { LeafletMap } from '../components/LeafletMap.jsx'
import { AddToBudgetModal } from '../components/AddToBudgetModal.jsx'

const formatPhotoUrl = (p) => {
  if (typeof p !== 'string') return ''
  if (p.startsWith('http://') || p.startsWith('https://')) return p
  if (p.startsWith('/storage') || p.startsWith('storage/')) {
    return p.startsWith('/') ? p : `/${p}`
  }
  return p.startsWith('/') ? p : `/${p}`
}

function WhatsApp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function Instagram(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function TikTok(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}

function Facebook(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

export default function VenueDetail() {
  const { slug } = useParams()
  const [active, setActive] = useState(0)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['venue', slug],
    queryFn: () => fetchVenue(slug),
  })

  const track = useMutation({
    mutationFn: () => api.post(`/venues/${slug}/track-whatsapp`).then((r) => r.data),
  })

  const venueId = data?.venue?.id ?? data?.id
  const { isFavorited, toggle: toggleFavourite } = useFavorite('venue', venueId)

  if (isLoading) return <div className="min-h-[60vh] grid place-items-center"><div className="w-10 h-10 rounded-full border-2 border-burgundy-300 border-t-burgundy-800 animate-spin" /></div>
  if (isError || !data) return <Navigate to="/venues" replace />

  const venue = data.venue ?? data
  const stats = data.stats ?? {}
  const similar = data.similar ?? []
  const photos = venue.photos?.length ? venue.photos : venue.image ? [venue.image] : []
  const alsoFor = venue.also_for ?? []
  const religionFocus = venue.religion_focus ?? []
  const specialties = venue.specialties ?? []
  const languages = venue.languages ?? []

  async function share() {
    const url = window.location.href
    const text = `Check out ${venue.name} on Golden Promise`
    if (navigator.share) { try { await navigator.share({ title: venue.name, text, url }); return } catch {} }
    await navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  function openWhatsApp() {
    if (!venue.whatsapp_link) { toast.error('This venue has not set up WhatsApp'); return }
    track.mutate()
    window.open(venue.whatsapp_link, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen -mt-24 pt-24">
      <div className="max-w-[1536px] mx-auto px-6 lg:px-10 pt-8 pb-12">
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link to="/venues" className="inline-flex items-center gap-1 text-burgundy-700 hover:text-burgundy-900 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to venues
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={share} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-blush-50 border border-burgundy-200/60 text-burgundy-800 text-sm hover:bg-blush-200 transition">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button onClick={toggleFavourite} className={`w-9 h-9 rounded-full flex items-center justify-center transition ${isFavorited ? 'bg-burgundy-800 text-blush-100' : 'bg-blush-50 text-burgundy-800 border border-burgundy-200/60 hover:bg-blush-200'}`} aria-label={isFavorited ? 'Remove from favourites' : 'Save to favourites'}>
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-blush-100' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <motion.div key={photos[active]} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="lg:col-span-3 aspect-[4/3] rounded-2xl overflow-hidden shadow-[var(--shadow-soft)] bg-blush-200 cursor-pointer" onClick={() => setLightboxOpen(true)}>
            {photos[active] && <img src={formatPhotoUrl(photos[active])} alt="" className="w-full h-full object-cover animate-fade-in" />}
          </motion.div>
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {photos.slice(0, 4).map((p, i) => (
              <button key={i} onClick={() => { setActive(i); setLightboxOpen(true); }} className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition group ${i === active ? 'ring-2 ring-burgundy-800' : ''}`}>
                <img src={formatPhotoUrl(p)} alt="" className="w-full h-full object-cover transition duration-300 group-hover:scale-110" loading="lazy" />
                {i === 3 && photos.length > 4 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] transition duration-300 group-hover:bg-black/50">
                    <span className="text-white font-display text-3xl font-medium tracking-tight">+{photos.length - 4}</span>
                  </div>
                )}
                {i === 3 && photos.length <= 4 && (
                  <div className="absolute inset-0 bg-black/0 flex items-center justify-center transition duration-300 group-hover:bg-black/20">
                    <span className="text-white font-display text-3xl font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"><Sparkles className="w-8 h-8" /></span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Reveal>
              <div>
                <h1 className="font-display text-4xl text-burgundy-900 leading-tight">{venue.name}</h1>
                <p className="text-burgundy-700 mt-2 flex items-center gap-1.5"><MapPin className="w-4 h-4" />{venue.address ?? venue.area}{venue.state ? `, ${venue.state}` : ''}</p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-burgundy-900 text-blush-100 text-sm">
                    <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />{Number(venue.rating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-sm text-burgundy-700">{venue.review_count ?? 0} reviews · {stats.view_count ?? 0} views</span>
                  {venue.is_featured && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-500 text-burgundy-950 text-xs font-bold"><Award className="w-3 h-3" /> Featured</span>}
                  {venue.is_verified && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-burgundy-100 text-burgundy-900 text-xs font-medium"><BadgeCheck className="w-3 h-3" /> Verified</span>}
                  {venue.is_all_inclusive && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-salmon-300 text-burgundy-900 text-xs font-medium"><Sparkles className="w-3 h-3" /> All-Inclusive</span>}
                </div>
              </div>
            </Reveal>

            {religionFocus.length > 0 && (
              <Reveal delay={0.08}>
                <div>
                  <h2 className="font-display text-2xl text-burgundy-900 mb-3">Suitable for</h2>
                  <div className="flex flex-wrap gap-2">
                    {religionFocus.map((r) => <span key={r} className="px-3 py-1.5 rounded-full bg-burgundy-800/10 text-burgundy-800 text-sm font-medium">{r} weddings</span>)}
                  </div>
                </div>
              </Reveal>
            )}

            {specialties.length > 0 && (
              <Reveal delay={0.1}>
                <div>
                  <h2 className="font-display text-2xl text-burgundy-900 mb-3">Specialties</h2>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((s) => <span key={s} className="px-3 py-1.5 rounded-full bg-blush-200 text-burgundy-800 text-sm">{s}</span>)}
                  </div>
                </div>
              </Reveal>
            )}

            <Reveal delay={0.12}>
              <div>
                <h2 className="font-display text-2xl text-burgundy-900 mb-3">About this venue</h2>
                <p className="text-burgundy-800/85 leading-relaxed whitespace-pre-line">
                  {venue.description ?? `${venue.name} is a beautiful ${venue.style?.toLowerCase() ?? 'venue'} in ${venue.area}, ${venue.state ?? 'Malaysia'}.`}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="grid sm:grid-cols-2 gap-5">
                <DetailRow Icon={Sparkles} label={venue.is_all_inclusive ? 'All-Inclusive' : 'Venue type'} value={venue.is_all_inclusive ? 'Catering, decor, photography included.' : (venue.venue_type ?? 'Wedding venue')} />
                <DetailRow Icon={Tag} label="Pricing" value={`Starting from RM ${Number(venue.price_from ?? 0).toLocaleString()}`} />
                <DetailRow Icon={Users} label="Guest Capacity" value={venue.capacity ?? '—'} />
                {languages.length > 0 && <DetailRow Icon={Languages} label="Languages" value={languages.join(', ')} />}
                {alsoFor.length > 0 && <DetailRow Icon={Calendar} label="Also available for" value={alsoFor.join(', ')} />}
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div>
                <h2 className="font-display text-2xl text-burgundy-900 mb-3">Location</h2>
                <LeafletMap lat={Number(venue.latitude)} lng={Number(venue.longitude)} label={venue.name} height={300} />
                <p className="text-sm text-burgundy-700 mt-2">{venue.address ?? venue.area}{venue.state ? `, ${venue.state}` : ''}</p>
              </div>
            </Reveal>
          </div>

          <aside className="lg:col-span-1">
            <div className="card-surface !bg-blush-50 p-6 sticky top-28">
              <p className="text-sm text-burgundy-700">Starting from</p>
              <p className="font-display text-3xl text-burgundy-900 mt-1">RM {Number(venue.price_from ?? 0).toLocaleString()}</p>
              <p className="text-sm text-burgundy-700 mt-1">All-in package</p>

              <div className="space-y-3 mt-5">
                {venue.whatsapp_link ? (
                  <button onClick={openWhatsApp} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#25D366] text-white font-bold hover:bg-[#128C7E] transition shadow-sm">
                    <WhatsApp className="w-5 h-5" /> WhatsApp
                  </button>
                ) : (
                  <button disabled className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-neutral-100 text-neutral-400 font-bold cursor-not-allowed">
                    <WhatsApp className="w-5 h-5" /> No WhatsApp
                  </button>
                )}
                {venue.brochure_path && (
                  <a
                    href={`/storage/${venue.brochure_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-burgundy-900 text-white font-bold hover:bg-burgundy-950 transition shadow-sm cursor-pointer"
                  >
                    <Briefcase className="w-5 h-5" /> View Brochure
                  </a>
                )}
                <button onClick={() => setBudgetOpen(true)} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border-2 border-burgundy-900 text-burgundy-900 hover:bg-burgundy-50 font-bold transition">
                  <Wallet className="w-5 h-5" /> Add to my budget
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                {venue.instagram && (
                  <button onClick={() => window.open(`https://instagram.com/${venue.instagram}`, '_blank', 'noopener,noreferrer')} className="relative w-10 h-10 rounded-full bg-blush-100 text-burgundy-800 hover:bg-blush-200 transition flex items-center justify-center group">
                    <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-3 py-1 bg-burgundy-900 text-white text-[11px] font-medium rounded-[8px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">@{venue.instagram}</span>
                  </button>
                )}
                {venue.tiktok && (
                  <button onClick={() => window.open(`https://tiktok.com/@${venue.tiktok}`, '_blank', 'noopener,noreferrer')} className="relative w-10 h-10 rounded-full bg-blush-100 text-burgundy-800 hover:bg-blush-200 transition flex items-center justify-center group">
                    <TikTok className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-3 py-1 bg-burgundy-900 text-white text-[11px] font-medium rounded-[8px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">@{venue.tiktok}</span>
                  </button>
                )}
                {venue.facebook && (
                  <button onClick={() => window.open(`https://facebook.com/${venue.facebook}`, '_blank', 'noopener,noreferrer')} className="relative w-10 h-10 rounded-full bg-blush-100 text-burgundy-800 hover:bg-blush-200 transition flex items-center justify-center group">
                    <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-3 py-1 bg-burgundy-900 text-white text-[11px] font-medium rounded-[8px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">{venue.facebook}</span>
                  </button>
                )}
              </div>

              {venue.email && (
                <a href={`mailto:${venue.email}`} className="mt-6 inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-blush-100 text-burgundy-800 text-sm hover:bg-blush-200 transition">
                  <Mail className="w-4 h-4" /> {venue.email}
                </a>
              )}
              {venue.website && (
                <a href={venue.website} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-blush-100 text-burgundy-800 text-sm hover:bg-blush-200 transition">
                  <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <hr className="my-5 border-burgundy-200/60" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-burgundy-800">
                  <ShieldCheck className="w-4 h-4 text-burgundy-700" />
                  <span>SSM-verified listing</span>
                </div>
                <div className="flex items-center gap-2 text-burgundy-800">
                  <Clock className="w-4 h-4 text-burgundy-700" />
                  <span>Responds within {venue.response_time_hours ?? 24} hours</span>
                </div>
              </div>

              <p className="text-xs text-burgundy-600 text-center mt-5 italic">
                Contact and payment happen directly with the venue.
              </p>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <Reveal>
            <div className="mt-16">
              <h2 className="font-display text-3xl text-burgundy-900 mb-6">More venues in {venue.state ?? 'Malaysia'}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similar.map((s) => {
                  const img = s.photos?.[0]
                  return (
                    <Link key={s.id} to={`/venues/${s.slug}`} className="card-surface group block">
                      <div className="aspect-[4/3] overflow-hidden relative bg-blush-200">
                        {img && <motion.img whileHover={{ scale: 1.06 }} transition={{ duration: 0.6 }} src={img} alt={s.name} className="w-full h-full object-cover" loading="lazy" />}
                        {s.is_featured && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gold-500 text-burgundy-950 text-[10px] uppercase tracking-wider font-bold">Featured</span>}
                      </div>
                      <div className="p-4">
                        <p className="font-display text-lg text-burgundy-900 leading-tight">{s.name}</p>
                        <p className="text-sm text-burgundy-700 mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {s.area}{s.state ? `, ${s.state}` : ''}</p>
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="inline-flex items-center gap-1 text-sm text-burgundy-800"><Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />{Number(s.rating ?? 0).toFixed(1)}</span>
                          <span className="text-sm font-medium text-burgundy-900">From RM {Number(s.price_from ?? 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </Reveal>
        )}
      </div>

      <AddToBudgetModal open={budgetOpen} onClose={() => setBudgetOpen(false)} item={venue} type="venue" price={venue.price_from} />

      {/* Full Screen Lightbox Modal */}
      {lightboxOpen && photos.length > 0 && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-4 animate-fade-in" onClick={() => setLightboxOpen(false)}>
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition z-10"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setActive((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
              }}
              className="absolute left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition"
              title="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="max-w-4xl max-h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={formatPhotoUrl(photos[active])}
              alt=""
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl select-none"
            />
          </div>

          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setActive((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
              }}
              className="absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition"
              title="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div className="absolute bottom-6 left-0 right-0 px-4 flex flex-col items-center">
            <div className="text-white/60 text-xs font-mono select-none mb-4">
              {active + 1} / {photos.length}
            </div>
            {photos.length > 1 && (
              <div 
                className="flex gap-2 overflow-x-auto max-w-full md:max-w-3xl pb-2 px-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" 
                onClick={(e) => e.stopPropagation()}
              >
                {photos.map((p, i) => (
                  <button 
                    key={i}
                    onClick={() => setActive(i)}
                    className={`relative shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all duration-300 snap-center ${
                      i === active ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105 opacity-100 z-10' : 'opacity-40 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img src={formatPhotoUrl(p)} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-burgundy-800 mb-1"><Icon className="w-4 h-4" /><p className="font-medium">{label}</p></div>
      <p className="text-burgundy-800/85 text-sm leading-relaxed">{value}</p>
    </div>
  )
}
