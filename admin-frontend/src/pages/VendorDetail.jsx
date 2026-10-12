import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Star, MapPin, Briefcase, Tag, Heart, Wallet,
  ShieldCheck, BadgeCheck, MessageCircle, Languages, Sparkles, Share2,
  Clock, Award, Phone, Mail, Globe, ExternalLink, ChevronLeft, ChevronRight, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client.js'
import { fetchVendor } from '../api/vendors.js'
import { Reveal } from '../components/Reveal.jsx'
import { AddToBudgetModal } from '../components/AddToBudgetModal.jsx'
import { useFavorite } from '../hooks/useFavorite.js'

const formatPhotoUrl = (p) => {
  if (typeof p !== 'string') return ''
  if (p.startsWith('http://') || p.startsWith('https://')) return p
  if (p.startsWith('/storage') || p.startsWith('storage/')) {
    return p.startsWith('/') ? p : `/${p}`
  }
  return `/storage/${p}`
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

function WhatsApp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

export default function VendorDetail() {
  const { slug } = useParams()
  const [active, setActive] = useState(0)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['vendor', slug],
    queryFn: () => fetchVendor(slug),
  })

  const trackClick = useMutation({
    mutationFn: (platform) => api.post(`/vendors/${slug}/track-social-click`, { platform }).then((r) => r.data),
  })

  // Track view once when loaded successfully
  useEffect(() => {
    if (data?.vendor && slug) {
      api.post(`/vendors/${slug}/track-view`).catch(() => {})
    }
  }, [slug, data?.vendor])

  const carouselRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const v = data?.vendor ?? data
  const stats = data?.stats ?? {}
  const similar = data?.similar ?? []
  const photos = v?.photos?.length ? v.photos : v?.image ? [v.image] : []
  const backTo = v?.category?.slug ? `/vendors/${v.category.slug}` : '/vendors'
  const { isFavorited, toggle: toggleFavourite } = useFavorite('vendor', v?.id)

  useEffect(() => {
    if (isHovered || !carouselRef.current || similar.length <= 1) return

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
        // Only auto-scroll if the items actually overflow the container
        if (scrollWidth > clientWidth) {
          if (scrollLeft + clientWidth >= scrollWidth - 15) {
            carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' })
          } else {
            carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' })
          }
        }
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [isHovered, similar])

  const scrollCarouselLeft = () => {
    carouselRef.current?.scrollBy({ left: -320, behavior: 'smooth' })
  }

  const scrollCarouselRight = () => {
    carouselRef.current?.scrollBy({ left: 320, behavior: 'smooth' })
  }

  function openSocial(url, platform) {
    if (!url) return
    trackClick.mutate(platform)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function openWhatsApp() {
    if (!v?.whatsapp_link) { toast.error('This vendor has not set up WhatsApp'); return }
    openSocial(v.whatsapp_link, 'whatsapp')
  }

  if (isLoading) return <div className="min-h-[60vh] grid place-items-center"><div className="w-10 h-10 rounded-full border-2 border-burgundy-300 border-t-burgundy-800 animate-spin" /></div>
  if (isError || !data) return <Navigate to="/vendors" replace />

  async function share() {
    const url = window.location.href
    const text = `Check out ${v?.name} on Golden Promise`
    if (navigator.share) { try { await navigator.share({ title: v?.name, text, url }); return } catch {} }
    await navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  return (
    <div className="bg-[#FAF8F5]">
      <div className="max-w-[1536px] mx-auto px-6 lg:px-10 pt-8 pb-12">
        <div className="flex items-center justify-end gap-3 mb-6">
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
              <button key={i} onClick={() => { setActive(i); setLightboxOpen(true); }} className={`aspect-square rounded-xl overflow-hidden cursor-pointer transition ${i === active ? 'ring-2 ring-burgundy-800' : ''}`}>
                <img src={formatPhotoUrl(p)} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Reveal>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-burgundy-800 text-blush-100 grid place-items-center font-display text-2xl shrink-0">{v.name?.[0]}</div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-display text-4xl text-burgundy-900 leading-tight">{v.name}</h1>
                  <p className="text-burgundy-700 mt-1 flex items-center gap-1.5"><MapPin className="w-4 h-4" />{v.address ?? v.area}{v.state ? `, ${v.state}` : ''}</p>
                  <p className="text-burgundy-800/80 mt-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"><Briefcase className="w-3.5 h-3.5" />{v.custom_category || v.category?.name || 'Wedding Service'}</p>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-burgundy-900 text-blush-100 text-sm">
                      <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />{Number(v.rating ?? 0).toFixed(1)}
                    </span>
                    <span className="text-sm text-burgundy-700">{v.review_count ?? 0} reviews · {stats.view_count ?? 0} views</span>
                    {v.is_golpro && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-500 text-burgundy-950 text-xs font-bold"><Award className="w-3 h-3" /> GolPro</span>}
                    {v.is_verified && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-burgundy-100 text-burgundy-900 text-xs font-medium"><BadgeCheck className="w-3 h-3" /> Verified</span>}
                    {v.is_badge_claimed && v.business_type === 'ssm' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-semibold"><ShieldCheck className="w-3 h-3" /> SSM Registered</span>}
                    {v.is_badge_claimed && v.business_type === 'startup' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold"><Sparkles className="w-3 h-3" /> Startup Team</span>}
                    {v.is_badge_claimed && v.business_type === 'homemade' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-semibold"><Building2 className="w-3.5 h-3.5" /> Homemade / Freelancer</span>}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <TrustStat Icon={Clock} value={`< ${v.response_time_hours ?? 24}h`} label="response time" />
                <TrustStat Icon={Award} value={v.years_experience ? `${v.years_experience} yrs` : '—'} label="experience" />
                <TrustStat Icon={Sparkles} value={stats.member_since_label ?? '—'} label="member since" />
                <TrustStat Icon={BadgeCheck} value={v.is_verified ? 'Yes' : 'No'} label="SSM verified" />
              </div>
            </Reveal>

            {v.religion_focus?.length > 0 && (
              <Reveal delay={0.08}>
                <div>
                  <h2 className="font-display text-2xl text-burgundy-900 mb-3">Suitable for</h2>
                  <div className="flex flex-wrap gap-2">
                    {v.religion_focus.map((r) => <span key={r} className="px-3 py-1.5 rounded-full bg-burgundy-800/10 text-burgundy-800 text-sm font-medium">{r} weddings</span>)}
                  </div>
                </div>
              </Reveal>
            )}

            {v.specialties?.length > 0 && (
              <Reveal delay={0.1}>
                <div>
                  <h2 className="font-display text-2xl text-burgundy-900 mb-3">Specialties</h2>
                  <div className="flex flex-wrap gap-2">
                    {v.specialties.map((s) => <span key={s} className="px-3 py-1.5 rounded-full bg-blush-200 text-burgundy-800 text-sm">{s}</span>)}
                  </div>
                </div>
              </Reveal>
            )}

            <Reveal delay={0.12}>
              <div>
                <h2 className="font-display text-2xl text-burgundy-900 mb-3">About {v.name}</h2>
                <p className="text-burgundy-800/85 leading-relaxed whitespace-pre-line">
                  {v.bio ?? `${v.name} is a trusted ${v.category?.name?.toLowerCase() ?? 'vendor'} on Golden Promise.`}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="grid sm:grid-cols-3 gap-5">
                <DetailRow Icon={MapPin} label="Locations served" value={v.area} />
                {v.languages?.length > 0 && <DetailRow Icon={Languages} label="Languages" value={v.languages.join(', ')} />}
                <DetailRow Icon={Tag} label="Starts from" value={`RM ${Number(v.price_from ?? 0).toLocaleString()}`} />
              </div>
            </Reveal>
          </div>

          {/* Contact sidebar */}
          <aside className="lg:col-span-1">
            <div className="card-surface !bg-blush-50 p-6 sticky top-28">
              <p className="text-sm text-burgundy-700">Starts from</p>
              <p className="font-display text-3xl text-burgundy-900 mt-1">RM {Number(v.price_from ?? 0).toLocaleString()}</p>

              {/* Primary CTA — WhatsApp */}
              {v.whatsapp_link ? (
                <button onClick={openWhatsApp} className="w-full mt-5 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#25D366] text-white font-medium hover:bg-[#128C7E] transition shadow-[var(--shadow-soft)]">
                  <WhatsApp className="w-4 h-4" /> WhatsApp
                </button>
              ) : (
                <button disabled className="w-full mt-5 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blush-200 text-burgundy-500 font-medium cursor-not-allowed">
                  <WhatsApp className="w-4 h-4" /> No WhatsApp
                </button>
              )}

               <button onClick={() => setBudgetOpen(true)} className="btn-ghost w-full justify-center mt-3">
                <Wallet className="w-4 h-4" /> Add to my budget
              </button>

              {v?.brochure_path && (
                <a
                  href={`/storage/${v.brochure_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-burgundy-900 hover:bg-burgundy-855 text-white text-sm font-medium transition shadow-xs cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" /> View Brochure / Pricing
                </a>
              )}

              {v.instagram && (
                <button onClick={() => openSocial(`https://instagram.com/${v.instagram}`, 'instagram')} className="mt-3 inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-blush-100 text-burgundy-800 text-sm hover:bg-blush-200 transition">
                  <Instagram className="w-4 h-4" /> @{v.instagram}
                </button>
              )}
              {v.tiktok && (
                <button onClick={() => openSocial(`https://tiktok.com/@${v.tiktok}`, 'tiktok')} className="mt-2 inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-blush-100 text-burgundy-800 text-sm hover:bg-blush-200 transition">
                  <TikTok className="w-4 h-4" /> @{v.tiktok}
                </button>
              )}
              {v.facebook && (
                <button onClick={() => openSocial(`https://facebook.com/${v.facebook}`, 'facebook')} className="mt-2 inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-blush-100 text-burgundy-800 text-sm hover:bg-blush-200 transition">
                  <Facebook className="w-4 h-4" /> {v.facebook}
                </button>
              )}
              {v.email && (
                <a href={`mailto:${v.email}`} className="mt-2 inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-blush-100 text-burgundy-800 text-sm hover:bg-blush-200 transition">
                  <Mail className="w-4 h-4" /> {v.email}
                </a>
              )}
              {v.website && (
                <button onClick={() => openSocial(v.website, 'website')} className="mt-2 inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-blush-100 text-burgundy-800 text-sm hover:bg-blush-200 transition">
                  {v.website.includes('maps') || v.website.includes('google') ? (
                    <>
                      <MapPin className="w-4 h-4" /> Open in Google Maps <ExternalLink className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}

              <hr className="my-5 border-burgundy-200/60" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-burgundy-800">
                  <ShieldCheck className="w-4 h-4 text-burgundy-700" />
                  <span>SSM-verified vendor</span>
                </div>
                <div className="flex items-center gap-2 text-burgundy-800">
                  <MessageCircle className="w-4 h-4 text-burgundy-700" />
                  <span>{v.response_rate_percent ?? 95}% response rate</span>
                </div>
              </div>

              <p className="text-xs text-burgundy-600 text-center mt-5 italic">
                Contact and payment happen directly with the vendor. Golden Promise verifies vendors but doesn't handle transactions.
              </p>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <Reveal>
            <div 
              className="mt-20"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#4E1218] tracking-tight">Similar vendors you may like</h2>
                  <p className="text-xs text-neutral-500 mt-1">Explore other highly recommended wedding options in this category.</p>
                </div>

                {similar.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={scrollCarouselLeft}
                      className="w-10 h-10 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-center transition shadow-sm text-neutral-600 hover:text-neutral-900 cursor-pointer"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={scrollCarouselRight}
                      className="w-10 h-10 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-center transition shadow-sm text-neutral-600 hover:text-neutral-900 cursor-pointer"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-none py-4 select-none scrollbar-none scrollbar-hide no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {similar.map((s) => {
                  const displayImage = s.image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'
                  return (
                    <Link
                      key={s.id}
                      to={`/vendor/${s.slug}`}
                      className="group rounded-[28px] p-4 border border-neutral-200/55 bg-white transition-all duration-300 flex flex-col justify-between h-full cursor-pointer hover:border-[#7B1F2A] hover:shadow-xl hover:scale-[1.02] shrink-0 w-[290px] sm:w-[320px]"
                    >
                      <div>
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-neutral-100">
                          <img
                            src={formatPhotoUrl(displayImage)}
                            alt={s.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {s.is_golpro && (
                            <span className="absolute top-3 left-3 text-neutral-900 text-[8px] uppercase font-black tracking-widest px-2.5 py-1.5 rounded-full shadow-md border border-[#fef1a2]/60 bg-gradient-to-r from-[#a54e07] via-[#fef1a2] to-[#bc881b] select-none">
                              GolPro
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 px-1">
                          <h3 className="font-display text-base font-bold text-[#4E1218] group-hover:text-[#7B1F2A] transition leading-snug line-clamp-1">
                            {s.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-[#7B1F2A] font-semibold">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{s.area || 'Malaysia'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between px-1">
                        <div className="flex items-center gap-1 text-xs font-bold text-neutral-700">
                          <svg className="w-3.5 h-3.5 shrink-0 filter drop-shadow-[0_1px_0.5px_#864307] drop-shadow-[0_1.5px_2px_rgba(78,18,24,0.25)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <linearGradient id="goldStarGradSimilar" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ffe57f" />
                                <stop offset="25%" stopColor="#bc881b" />
                                <stop offset="50%" stopColor="#fef1a2" />
                                <stop offset="75%" stopColor="#a54e07" />
                                <stop offset="100%" stopColor="#ffe57f" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                              fill="url(#goldStarGradSimilar)"
                              stroke="#ffd043"
                              strokeWidth="0.75"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>{s.rating ? Number(s.rating).toFixed(1) : '4.8'}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-display text-base font-bold text-[#7B1F2A]">
                            From RM {Number(s.price_from ?? 0).toLocaleString()}
                          </span>
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

      <AddToBudgetModal open={budgetOpen} onClose={() => setBudgetOpen(false)} item={v} type="vendor" price={v.price_from} />

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

          <div className="absolute bottom-6 text-white/60 text-xs font-mono select-none">
            {active + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  )
}

function TrustStat({ Icon, value, label }) {
  return (
    <div className="card-surface !bg-blush-50 p-4 flex items-center gap-3">
      <span className="w-10 h-10 rounded-full bg-burgundy-800/10 grid place-items-center shrink-0"><Icon className="w-4 h-4 text-burgundy-800" /></span>
      <div className="min-w-0">
        <p className="font-display text-lg text-burgundy-900 leading-tight truncate">{value}</p>
        <p className="text-[11px] uppercase tracking-wider text-burgundy-700 truncate">{label}</p>
      </div>
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
