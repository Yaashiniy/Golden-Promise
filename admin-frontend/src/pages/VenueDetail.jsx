import { useParams, Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Star, MapPin, Users, Tag, Calendar, Heart, Sparkles,
  BadgeCheck, Award, Clock, Languages, Share2, ShieldCheck, Wallet,
  Mail, Globe, ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client.js'
import { fetchVenue } from '../api/venues.js'
import { Reveal } from '../components/Reveal.jsx'
import { LeafletMap } from '../components/LeafletMap.jsx'
import { AddToBudgetModal } from '../components/AddToBudgetModal.jsx'
import { useFavorite } from '../hooks/useFavorite.js'

function WhatsApp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

export default function VenueDetail() {
  const { slug } = useParams()
  const [active, setActive] = useState(0)
  const [budgetOpen, setBudgetOpen] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['venue', slug],
    queryFn: () => fetchVenue(slug),
  })

  const track = useMutation({
    mutationFn: () => api.post(`/venues/${slug}/track-whatsapp`).then((r) => r.data),
  })

  // Must run before the early returns below, so the hook order stays stable.
  const { isFavorited, toggle: toggleFavourite } = useFavorite('venue', (data?.venue ?? data)?.id)

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
    <div className="bg-[#FAF8F5]">
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
          <motion.div key={photos[active]} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="lg:col-span-3 aspect-[4/3] rounded-2xl overflow-hidden shadow-[var(--shadow-soft)] bg-blush-200">
            {photos[active] && <img src={photos[active]} alt="" className="w-full h-full object-cover" />}
          </motion.div>
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {photos.slice(0, 4).map((p, i) => (
              <button key={p} onClick={() => setActive(i)} className={`aspect-square rounded-xl overflow-hidden ${i === active ? 'ring-2 ring-burgundy-800' : ''}`}>
                <img src={p} alt="" className="w-full h-full object-cover" loading="lazy" />
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burgundy-900 text-blush-100 text-sm">
                    <svg className="w-3.5 h-3.5 shrink-0 filter drop-shadow-[0_1px_0.5px_#864307]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="goldStarGradDetail" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ffe57f" />
                          <stop offset="25%" stopColor="#bc881b" />
                          <stop offset="50%" stopColor="#fef1a2" />
                          <stop offset="75%" stopColor="#a54e07" />
                          <stop offset="100%" stopColor="#ffe57f" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill="url(#goldStarGradDetail)"
                        stroke="#ffd043"
                        strokeWidth="0.75"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{Number(venue.rating ?? 0).toFixed(1)}</span>
                  </span>
                  <span className="text-sm text-burgundy-700">{venue.review_count ?? 0} reviews · {stats.view_count ?? 0} views</span>
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

              {venue.whatsapp_link ? (
                <button onClick={openWhatsApp} className="w-full mt-5 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#25D366] text-white font-medium hover:bg-[#128C7E] transition shadow-[var(--shadow-soft)]">
                  <WhatsApp className="w-4 h-4" /> WhatsApp venue
                </button>
              ) : (
                <button disabled className="w-full mt-5 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blush-200 text-burgundy-500 font-medium cursor-not-allowed">
                  <WhatsApp className="w-4 h-4" /> No WhatsApp
                </button>
              )}
              <button onClick={() => setBudgetOpen(true)} className="btn-ghost w-full justify-center mt-3">
                <Wallet className="w-4 h-4" /> Add to my budget
              </button>

              {venue.email && (
                <a href={`mailto:${venue.email}`} className="mt-3 inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-blush-100 text-burgundy-800 text-sm hover:bg-blush-200 transition">
                  <Mail className="w-4 h-4" /> {venue.email}
                </a>
              )}
              {venue.website && (
                <a href={venue.website} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-blush-100 text-burgundy-800 text-sm hover:bg-blush-200 transition">
                  {venue.website.includes('maps') || venue.website.includes('google') ? (
                    <>
                      <MapPin className="w-4 h-4" /> Open in Google Maps <ExternalLink className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
                    </>
                  )}
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
