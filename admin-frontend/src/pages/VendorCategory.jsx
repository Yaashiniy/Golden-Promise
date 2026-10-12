import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, ChevronDown, ChevronUp, X, Building2, SlidersHorizontal,
  RotateCcw
} from 'lucide-react'
import { fetchVendors, fetchVendorCategories, fetchVendorFilters } from '../api/vendors.js'

const formatPhotoUrl = (p) => {
  if (typeof p !== 'string') return ''
  if (p.startsWith('http://') || p.startsWith('https://')) return p
  if (p.startsWith('/storage') || p.startsWith('storage/')) {
    return p.startsWith('/') ? p : `/${p}`
  }
  return `/storage/${p}`
}

const STATES = [
  'Kuala Lumpur', 'Selangor', 'Penang', 'Johor', 'Melaka', 'Negeri Sembilan',
  'Perak', 'Kedah', 'Pahang', 'Kelantan', 'Terengganu', 'Sabah', 'Sarawak', 'Putrajaya', 'Labuan', 'Perlis'
]

const CULTURES = [
  'Malay', 'Chinese', 'Indian', 'Christian', 'Sikh', 'Civil', 'Iban', 'Kadazan'
]

export default function VendorCategory() {
  const { category: categorySlug } = useParams()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ state: '', religion: '', min_price: '', max_price: '' })
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Accordion section states
  const [openSections, setOpenSections] = useState({
    categories: true,
    location: true,
    culture: true,
    price: true,
  })

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }))
  }

  const categoriesQ = useQuery({ queryKey: ['vendor-categories'], queryFn: fetchVendorCategories })
  const filtersQ = useQuery({ queryKey: ['vendor-filters'], queryFn: fetchVendorFilters })

  const categories = categoriesQ.data ?? []
  const activeCategoryObj = categories.find((c) => c.slug === categorySlug)

  const vendorsQ = useQuery({
    queryKey: ['vendors', { category: categorySlug, query, ...filters }],
    queryFn: () => fetchVendors({
      category: categorySlug || undefined,
      q: query || undefined,
      state: filters.state || undefined,
      religion: filters.religion || undefined,
      min_price: filters.min_price || undefined,
      max_price: filters.max_price || undefined,
    }),
  })

  const vendors = vendorsQ.data ?? []
  const states = filtersQ.data?.states?.length ? filtersQ.data.states : STATES
  const religions = filtersQ.data?.religions?.length ? filtersQ.data.religions : CULTURES

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }))
  const resetAll = () => {
    setFilters({ state: '', religion: '', min_price: '', max_price: '' })
    setQuery('')
  }

  const activeCount = [
    categorySlug ? 1 : 0,
    filters.state ? 1 : 0,
    filters.religion ? 1 : 0,
    filters.min_price ? 1 : 0,
    filters.max_price ? 1 : 0,
    query ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const selectCategory = (slug) => {
    if (slug) {
      navigate(`/vendors/${slug}`)
    } else {
      navigate('/vendors')
    }
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#2C2A29] flex flex-col relative">
      
      {/* LEFT SIDEBAR (Desktop) — Anchored flush against the screen's left boundary (left-0 top-0 bottom-0) */}
      <aside className="hidden lg:block w-72 shrink-0 bg-white border-r border-neutral-200/80 fixed left-0 top-0 bottom-0 z-30 pt-24 p-6 space-y-7 overflow-y-auto custom-scrollbar shadow-xs">
        
        {/* Clear Action (if active) */}
        {activeCount > 0 && (
          <div className="flex justify-end pb-2 border-b border-neutral-100">
            <button
              onClick={resetAll}
              className="text-xs font-bold text-[#C08E3F] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear all filters
            </button>
          </div>
        )}

            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4.5 h-4.5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vendor name or area..."
                className="w-full pl-11 pr-9 py-3 bg-[#FAF8F5] border border-neutral-200 rounded-2xl text-sm font-medium outline-none focus:border-[#4E1218] transition"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Categories Accordion */}
            <div className="border-b border-neutral-100 pb-6">
              <button
                onClick={() => toggleSection('categories')}
                className="w-full flex items-center justify-between py-1 text-sm font-bold uppercase tracking-wider text-[#4E1218]"
              >
                <span>Categories</span>
                {openSections.categories ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {openSections.categories && (
                <div className="mt-3.5 space-y-1.5">
                  <button
                    onClick={() => selectCategory('')}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-between cursor-pointer ${
                      !categorySlug ? 'bg-burgundy-900/10 text-[#7B1F2A] font-bold' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${!categorySlug ? 'bg-[#7B1F2A]' : 'bg-transparent'}`} />
                      All Categories
                    </span>
                  </button>

                  {categories.map((cat) => {
                    const active = categorySlug === cat.slug
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => selectCategory(cat.slug)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-between cursor-pointer ${
                          active ? 'bg-burgundy-900/10 text-[#7B1F2A] font-bold' : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-[#7B1F2A]' : 'bg-neutral-300'}`} />
                          <span className="truncate">{cat.name}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Location / State Accordion */}
            <div className="border-b border-neutral-100 pb-6">
              <button
                onClick={() => toggleSection('location')}
                className="w-full flex items-center justify-between py-1 text-sm font-bold uppercase tracking-wider text-[#4E1218]"
              >
                <span>State / Region</span>
                {openSections.location ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {openSections.location && (
                <div className="mt-3.5 space-y-2">
                  <select
                    value={filters.state}
                    onChange={(e) => setFilter('state', e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-neutral-200 rounded-2xl text-sm font-semibold text-[#4E1218] outline-none focus:border-[#4E1218]"
                  >
                    <option value="">All Malaysian States</option>
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Cultural Tradition Accordion */}
            <div className="border-b border-neutral-100 pb-6">
              <button
                onClick={() => toggleSection('culture')}
                className="w-full flex items-center justify-between py-1 text-sm font-bold uppercase tracking-wider text-[#4E1218]"
              >
                <span>Tradition & Culture</span>
                {openSections.culture ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {openSections.culture && (
                <div className="mt-3.5 flex flex-wrap gap-2">
                  {religions.map((r) => {
                    const active = filters.religion === r
                    return (
                      <button
                        key={r}
                        onClick={() => setFilter('religion', active ? '' : r)}
                        className={`px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer border ${
                          active
                            ? 'bg-[#7B1F2A] text-white border-[#7B1F2A] shadow-xs'
                            : 'bg-[#FAF8F5] border-neutral-200 text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        {r}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Price Range Accordion */}
            <div>
              <button
                onClick={() => toggleSection('price')}
                className="w-full flex items-center justify-between py-1 text-sm font-bold uppercase tracking-wider text-[#4E1218]"
              >
                <span>Starting Price (RM)</span>
                {openSections.price ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {openSections.price && (
                <div className="mt-3.5 space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="number"
                      placeholder="Min RM"
                      value={filters.min_price}
                      onChange={(e) => setFilter('min_price', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-neutral-200 rounded-xl text-sm font-medium outline-none focus:border-[#4E1218]"
                    />
                    <input
                      type="number"
                      placeholder="Max RM"
                      value={filters.max_price}
                      onChange={(e) => setFilter('max_price', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-neutral-200 rounded-xl text-sm font-medium outline-none focus:border-[#4E1218]"
                    />
                  </div>

                  {/* Preset Price Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '< RM 1k', min: '', max: '1000' },
                      { label: 'RM 1k–3k', min: '1000', max: '3000' },
                      { label: 'RM 3k–5k', min: '3000', max: '5000' },
                      { label: 'RM 5k+', min: '5000', max: '' },
                    ].map((p) => {
                      const active = filters.min_price === p.min && filters.max_price === p.max
                      return (
                        <button
                          key={p.label}
                          onClick={() => {
                            setFilter('min_price', active ? '' : p.min)
                            setFilter('max_price', active ? '' : p.max)
                          }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                            active ? 'bg-[#4E1218] text-white border-[#4E1218]' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          {p.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>

      {/* MAIN RESULTS CONTENT (Right) — Padded to clear the fixed left sidebar */}
      <main className="flex-1 min-w-0 w-full lg:pl-72 pt-28 pb-20 px-6 sm:px-10 lg:px-12">
        <div className="max-w-[1248px] mx-auto">
          
          {/* Page Top Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 mb-8 border-b border-neutral-200">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-[#C08E3F] uppercase block mb-1">
                Malaysian Vendor Directory
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#4E1218] tracking-tight">
                {activeCategoryObj ? `${activeCategoryObj.name}` : 'All Verified Vendors'}
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 mt-3 max-w-2xl leading-relaxed italic">
                Browse verified wedding vendors, filter by region & budget, and connect directly on WhatsApp with zero commission.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Dynamic Hamburger Filter Button for Minimized / Mobile Screens */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#4E1218] text-white shadow-md text-xs font-bold uppercase tracking-wider hover:bg-burgundy-900 transition cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#C08E3F]" />
                <span>Filters</span>
                {activeCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#C08E3F] text-white text-[10px] font-bold grid place-items-center">
                    {activeCount}
                  </span>
                )}
              </button>

              <div className="bg-white border border-neutral-200 px-6 py-3 rounded-full text-xs font-bold text-[#4E1218] shadow-xs">
                <span className="text-[#C08E3F] text-sm">{vendorsQ.isLoading ? '...' : vendors.length}</span> Vendors Found
              </div>
            </div>
          </div>

          {/* Active Filters Badges */}
          {activeCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6 bg-white rounded-2xl p-3.5 border border-neutral-200/80 shadow-xs">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider pl-1">Active:</span>
                
                {categorySlug && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAEDE6] text-[#7B1F2A] border border-[#E8C7BD] text-xs font-semibold">
                    Category: {activeCategoryObj?.name || categorySlug}
                    <button onClick={() => selectCategory('')} className="hover:text-black cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {filters.state && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 text-neutral-800 text-xs font-semibold">
                    State: {filters.state}
                    <button onClick={() => setFilter('state', '')} className="hover:text-black cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {filters.religion && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 text-neutral-800 text-xs font-semibold">
                    Culture: {filters.religion}
                    <button onClick={() => setFilter('religion', '')} className="hover:text-black cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {(filters.min_price || filters.max_price) && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 text-neutral-800 text-xs font-semibold">
                    Price: {filters.min_price ? `> RM${filters.min_price}` : ''} {filters.max_price ? `< RM${filters.max_price}` : ''}
                    <button onClick={() => { setFilter('min_price', ''); setFilter('max_price', '') }} className="hover:text-black cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {query && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 text-neutral-800 text-xs font-semibold">
                    "{query}"
                    <button onClick={() => setQuery('')} className="hover:text-black cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                <button
                  onClick={resetAll}
                  className="text-xs font-bold text-[#C08E3F] hover:underline ml-auto pr-1 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Vendor Cards Grid */}
            <ResultsGrid vendors={vendors} loading={vendorsQ.isLoading} onReset={resetAll} />

          </div>
        </main>

      {/* DYNAMIC FILTER OVERLAY DRAWER FOR MINIMIZED / MOBILE / TABLET SCREENS */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute left-0 top-0 h-full w-full max-w-sm bg-white p-6 sm:p-8 overflow-y-auto flex flex-col justify-between shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100">
                  <h3 className="font-display text-2xl font-bold text-[#4E1218]">Filter Vendors</h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-9 h-9 rounded-full bg-neutral-100 grid place-items-center text-neutral-500 hover:text-neutral-900 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">Search</label>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Vendor name or area..."
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-neutral-300 rounded-xl text-sm outline-none"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">Category</label>
                    <select
                      value={categorySlug || ''}
                      onChange={(e) => selectCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-neutral-300 rounded-xl text-sm font-semibold"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">State / Region</label>
                    <select
                      value={filters.state}
                      onChange={(e) => setFilter('state', e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-neutral-300 rounded-xl text-sm font-semibold"
                    >
                      <option value="">All States</option>
                      {states.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Culture */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">Culture & Tradition</label>
                    <div className="flex flex-wrap gap-2">
                      {religions.map((r) => {
                        const active = filters.religion === r
                        return (
                          <button
                            key={r}
                            onClick={() => setFilter('religion', active ? '' : r)}
                            className={`px-3.5 py-2 rounded-full text-xs font-bold cursor-pointer border ${
                              active ? 'bg-[#7B1F2A] text-white border-[#7B1F2A]' : 'bg-white border-neutral-300 text-neutral-700'
                            }`}
                          >
                            {r}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">Starting Price (RM)</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="number"
                        placeholder="Min RM"
                        value={filters.min_price}
                        onChange={(e) => setFilter('min_price', e.target.value)}
                        className="px-3.5 py-2.5 bg-[#FAF8F5] border border-neutral-300 rounded-xl text-sm outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Max RM"
                        value={filters.max_price}
                        onChange={(e) => setFilter('max_price', e.target.value)}
                        className="px-3.5 py-2.5 bg-[#FAF8F5] border border-neutral-300 rounded-xl text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100 flex gap-3 mt-6">
                <button
                  onClick={resetAll}
                  className="flex-1 py-3.5 rounded-full border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-3.5 rounded-full bg-[#4E1218] text-white text-xs font-bold hover:bg-burgundy-900 transition cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────── RESULTS GRID ────────── */

function ResultsGrid({ vendors, loading, onReset }) {
  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-burgundy-300 border-t-burgundy-900 animate-spin mx-auto mb-4" />
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Loading verified vendors...</p>
      </div>
    )
  }

  if (!vendors.length) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 shadow-xs max-w-lg mx-auto my-12">
        <Building2 className="w-12 h-12 text-[#C08E3F] mx-auto mb-4" />
        <h3 className="font-display text-2xl font-bold text-[#4E1218]">No Vendors Found</h3>
        <p className="text-xs text-neutral-600 mt-2 mb-6 leading-relaxed">
          No vendors match your search filters. Try clearing some options or searching a different area.
        </p>
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-full bg-[#4E1218] text-white text-xs font-bold hover:bg-burgundy-900 transition cursor-pointer"
        >
          Reset Filters
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
      {vendors.map((v) => (
        <VendorCard key={v.slug || v.id} vendor={v} />
      ))}
    </div>
  )
}

function VendorCard({ vendor: v }) {
  const religions = v.religion_focus?.slice(0, 3) ?? []
  const displayImage = v.image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'

  return (
    <Link
      to={`/vendor/${v.slug}`}
      className="group rounded-[28px] p-4 border border-transparent transition-all duration-300 flex flex-col justify-between h-full cursor-pointer hover:bg-white hover:border-[#7B1F2A] hover:shadow-2xl hover:scale-[1.02]"
    >
      <div>
        {/* Cover Photo */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-neutral-100">
          <img
            src={formatPhotoUrl(displayImage)}
            alt={v.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Category Tag */}
          {v.category?.name && (
            <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-[#4E1218] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
              {v.category.name}
            </span>
          )}

          {/* Badges */}
          {v.is_golpro && (
            <span className="absolute top-3 left-3 text-neutral-900 text-[9px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full shadow-md border border-[#fef1a2]/60 bg-gradient-to-r from-[#a54e07] via-[#fef1a2] to-[#bc881b] select-none">
              GolPro
            </span>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1.5 px-1">
          <h3 className="font-display text-lg font-bold text-[#4E1218] group-hover:text-[#7B1F2A] transition leading-snug line-clamp-2 min-h-[52px]">
            {v.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-[#7B1F2A] font-semibold">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{v.area ? `${v.area}, ${v.state}` : v.state || 'Malaysia'}</span>
          </div>

          {religions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {religions.map((r) => (
                <span key={r} className="text-[9px] font-extrabold uppercase tracking-wider text-[#7B1F2A] bg-[#FAEDE6]/60 border border-[#7B1F2A]/10 px-3 py-1 rounded-full shadow-3xs">
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Row */}
      <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700">
          <svg className="w-4 h-4 shrink-0 filter drop-shadow-[0_1px_0.5px_#864307] drop-shadow-[0_1.5px_2px_rgba(78,18,24,0.25)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe57f" />
                <stop offset="25%" stopColor="#bc881b" />
                <stop offset="50%" stopColor="#fef1a2" />
                <stop offset="75%" stopColor="#a54e07" />
                <stop offset="100%" stopColor="#ffe57f" />
              </linearGradient>
            </defs>
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="url(#goldStarGrad)"
              stroke="#ffd043"
              strokeWidth="0.75"
              strokeLinejoin="round"
            />
          </svg>
          <span>{v.rating ? Number(v.rating).toFixed(1) : '4.9'}</span>
          <span className="text-[11px] font-semibold text-neutral-400">
            {Number(v.rating) >= 4.8 || !v.rating ? 'Superb' : 'Popular'}
          </span>
        </div>

        <div className="text-right">
          <span className="font-display text-xl font-bold text-[#7B1F2A]">
            {v.price_from ? `RM ${Number(v.price_from).toLocaleString()}` : 'Inquire'}
          </span>
        </div>
      </div>
    </Link>
  )
}
