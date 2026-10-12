import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Heart, MapPin, Search, Trash2, X } from 'lucide-react'
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

function FavoriteCard({ item, onRemove, removing }) {
  // Venues and vendors are both stored as Vendor rows (the API's type field
  // is always 'Vendor'), so tell them apart by category instead.
  const isVenue = item.category?.slug === 'venues'
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
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
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
  const categoryName = (item) => item.category?.slug === 'venues' ? 'Venues' : (item.category?.name || 'Vendors')
  const categories = useMemo(
    () => [...new Set(items.map((favorite) => categoryName(favorite.item)))].sort((a, b) => a.localeCompare(b)),
    [items],
  )
  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    return items.filter((favorite) => {
      const item = favorite.item
      const itemCategory = categoryName(item)
      const matchesCategory = category === 'all' || itemCategory === category
      const searchable = [item.name, item.area, item.state, itemCategory].filter(Boolean).join(' ').toLocaleLowerCase()
      return matchesCategory && (!term || searchable.includes(term))
    })
  }, [items, search, category])
  const hasActiveFilters = search.trim() !== '' || category !== 'all'
  const clearFilters = () => {
    setSearch('')
    setCategory('all')
  }

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

            {!isLoading && !isError && (
              <Reveal delay={0.06}>
                <div className="mt-12 flex flex-col gap-3 sm:mt-14 sm:flex-row sm:items-center">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A6A6E]" />
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search saved listings…"
                      aria-label="Search saved listings"
                      className="h-11 w-full rounded-full border border-[#7B1F2A]/20 bg-white pl-11 pr-10 text-sm text-[#4E1218] outline-none transition focus:border-[#7B1F2A] focus:ring-3 focus:ring-[#7B1F2A]/10 placeholder:text-[#8A6A6E]"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        aria-label="Clear search"
                        className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#8A6A6E] transition hover:bg-[#FAEDE6] hover:text-[#4E1218]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative w-full overflow-hidden rounded-full sm:w-56">
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      aria-label="Filter favourites by category"
                      className="h-11 w-full appearance-none rounded-full border border-[#7B1F2A]/20 bg-white px-5 pr-11 text-sm font-medium text-[#4E1218] outline-none transition focus:border-[#7B1F2A] focus:ring-3 focus:ring-[#7B1F2A]/10"
                    >
                      <option value="all">All categories</option>
                      {categories.map((name) => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B1F2A]" />
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="whitespace-nowrap text-xs font-semibold text-[#785A5E]">
                      {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'}
                    </span>
                    {hasActiveFilters && (
                      <button type="button" onClick={clearFilters} className="whitespace-nowrap text-xs font-bold text-[#7B1F2A] hover:underline">
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              </Reveal>
            )}

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

            {!isLoading && !isError && items.length > 0 && filteredItems.length > 0 && (
              <Reveal delay={0.1}>
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((f) => (
                    <FavoriteCard
                      key={f.id}
                      item={f.item}
                      removing={remove.isPending}
                      onRemove={(type, id) => remove.mutate({ type, id })}
                    />
                  ))}
                </div>
              </Reveal>
            )}

            {!isLoading && !isError && items.length > 0 && filteredItems.length === 0 && (
              <Reveal delay={0.1}>
                <div className="mt-10 rounded-2xl bg-white/95 px-6 py-14 text-center shadow-[0_18px_45px_-28px_rgba(78,18,24,0.35)] ring-1 ring-[#7B1F2A]/10">
                  <Search className="mx-auto h-9 w-9 text-[#C08E3F]" />
                  <p className="mt-4 font-display text-2xl text-[#4E1218]">No saved listings match</p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#785A5E]">Try another search term or select a different category.</p>
                  <button type="button" onClick={clearFilters} className="mt-5 rounded-full bg-[#7B1F2A] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4E1218]">
                    Clear filters
                  </button>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
