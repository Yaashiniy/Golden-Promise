import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, MapPin, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Reveal } from '../../components/Reveal.jsx'
import { DashboardSidebar } from '../../components/DashboardSidebar.jsx'
import { fetchFavorites, toggleFavorite } from '../../api/favorites.js'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'

const formatPhotoUrl = (p) => {
  if (typeof p !== 'string' || !p) return FALLBACK_IMAGE
  if (p.startsWith('http://') || p.startsWith('https://')) return p
  if (p.startsWith('/storage') || p.startsWith('storage/')) return p.startsWith('/') ? p : `/${p}`
  return `/storage/${p}`
}

function FavoriteCard({ type, item, onRemove, removing }) {
  // 'Venue' | 'Vendor' from the API's class basename.
  const isVenue = type?.toLowerCase() === 'venue'
  // Routes are asymmetric: venues are plural, vendors singular.
  const to = isVenue ? `/venues/${item.slug}` : `/vendor/${item.slug}`
  const location = [item.area, item.state].filter(Boolean).join(', ')

  return (
    <div className="group relative bg-white rounded-[22px] overflow-hidden border border-burgundy-900/10 shadow-[0_18px_45px_-28px_rgba(78,18,24,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(78,18,24,0.4)]">
      <Link to={to} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          <img
            src={formatPhotoUrl(item.image)}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#4E1218] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
            {isVenue ? 'Venue' : item.category?.name || 'Vendor'}
          </span>
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg font-bold text-[#4E1218] leading-snug line-clamp-2">
            {item.name}
          </h3>
          {location && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#7A5A5E]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {location}
            </p>
          )}
        </div>
      </Link>

      <button
        onClick={() => onRemove(isVenue ? 'venue' : 'vendor', item.id)}
        disabled={removing}
        aria-label={`Remove ${item.name} from favourites`}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-burgundy-800 flex items-center justify-center shadow-sm transition hover:bg-burgundy-800 hover:text-white disabled:opacity-50 cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function Favorites() {
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem('sidebar_left_open') !== 'false')
  useEffect(() => {
    const handleToggle = () => setSidebarOpen(localStorage.getItem('sidebar_left_open') !== 'false')
    window.addEventListener('sidebar_left_toggle', handleToggle)
    return () => window.removeEventListener('sidebar_left_toggle', handleToggle)
  }, [])

  const qc = useQueryClient()

  const { data: favorites = [], isLoading, isError } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
  })

  const remove = useMutation({
    mutationFn: ({ type, id }) => toggleFavorite(type, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] })
      toast.success('Removed from favourites')
    },
    onError: () => toast.error('Could not remove favourite'),
  })

  // Entries whose underlying venue/vendor was deleted come back with a null item.
  const items = favorites.filter((f) => f?.item)

  return (
    <div className="relative bg-white min-h-[calc(100vh-5rem)] overflow-hidden">
      <style>{`
        @keyframes mesh-blob-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.15); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
        }
        @keyframes mesh-blob-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-50px, 50px) scale(1.08); }
        }
        @keyframes mesh-blob-3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-35px, -40px) scale(0.92); }
          66% { transform: translate(50px, 30px) scale(1.12); }
        }
        .animate-mesh-blob-1 { animation: mesh-blob-1 25s ease-in-out infinite; }
        .animate-mesh-blob-2 { animation: mesh-blob-2 28s ease-in-out infinite; }
        .animate-mesh-blob-3 { animation: mesh-blob-3 22s ease-in-out infinite; }
      `}</style>

      {/* Moving liquid mesh gradient background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#FFF0EE] blur-[120px] lg:blur-[160px] opacity-80 animate-mesh-blob-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#FFF2F0] blur-[130px] lg:blur-[180px] opacity-70 animate-mesh-blob-2" />
        <div className="absolute top-[30%] left-[30%] w-[45%] h-[45%] rounded-full bg-[#FCF5F2] blur-[100px] lg:blur-[150px] opacity-60 animate-mesh-blob-3" />
      </div>

      <div className="relative z-10">
        <DashboardSidebar />
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-[270px]' : 'lg:pl-0'}`}>
          <div className="max-w-5xl mx-auto px-6 lg:px-10 py-12 w-full min-w-0">
            <Reveal>
              <h1 className="font-display text-4xl text-[#4E1218] font-medium">Saved venues & vendors</h1>
              {items.length > 0 && (
                <p className="text-burgundy-700 mt-2">
                  {items.length} saved {items.length === 1 ? 'listing' : 'listings'}
                </p>
              )}
            </Reveal>

            {isLoading && (
              <div className="mt-10 grid place-items-center py-20">
                <div className="w-10 h-10 rounded-full border-2 border-burgundy-300 border-t-burgundy-800 animate-spin" />
              </div>
            )}

            {isError && !isLoading && (
              <Reveal delay={0.1}>
                <div className="mt-10 bg-white/95 rounded-[28px] border border-burgundy-900/10 shadow-[0_25px_55px_rgba(78,18,24,0.12)] p-12 text-center">
                  <p className="font-display text-2xl text-burgundy-900">Couldn't load your favourites</p>
                  <p className="text-burgundy-700 mt-2">Please refresh the page and try again.</p>
                </div>
              </Reveal>
            )}

            {!isLoading && !isError && items.length === 0 && (
              <Reveal delay={0.1}>
                <div className="mt-10 bg-white/95 rounded-[28px] border border-burgundy-900/10 shadow-[0_25px_55px_rgba(78,18,24,0.12)] p-12 text-center">
                  <Heart className="w-12 h-12 text-burgundy-700 mx-auto" />
                  <p className="font-display text-2xl text-burgundy-900 mt-4">No favourites yet</p>
                  <p className="text-burgundy-700 mt-2 max-w-md mx-auto">
                    Browse venues and vendors and tap the heart icon to save the ones you love right
                    here.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 justify-center">
                    <Link to="/venues" className="btn-primary">
                      Browse venues
                    </Link>
                    <Link to="/vendors" className="btn-ghost">
                      Find vendors
                    </Link>
                  </div>
                </div>
              </Reveal>
            )}

            {!isLoading && !isError && items.length > 0 && (
              <Reveal delay={0.1}>
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((f) => (
                    <FavoriteCard
                      key={f.id}
                      type={f.type}
                      item={f.item}
                      removing={remove.isPending}
                      onRemove={(type, id) => remove.mutate({ type, id })}
                    />
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
