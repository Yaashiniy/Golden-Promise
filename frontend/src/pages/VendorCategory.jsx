import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, ChevronDown, ChevronUp, X, Building2,
  RotateCcw
} from 'lucide-react'
import { fetchVendors, fetchVendorCategories, fetchVendorFilters } from '../api/vendors.js'
import { GoldProBadge } from '../components/GoldProBadge.jsx'

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
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false)
  const [mobileStateOpen, setMobileStateOpen] = useState(false)
  const [openCategoryLetter, setOpenCategoryLetter] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

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

  const categoriesQ = useQuery({
    queryKey: ['vendor-categories'],
    queryFn: fetchVendorCategories,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
  const filtersQ = useQuery({ queryKey: ['vendor-filters'], queryFn: fetchVendorFilters })

  const categories = [...(categoriesQ.data ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
  )
  const groupedCategories = Object.entries(
    categories.reduce((groups, category) => {
      const firstLetter = category.name.trim().charAt(0).toUpperCase()
      const letter = /[A-Z]/.test(firstLetter) ? firstLetter : '#'
      groups[letter] = [...(groups[letter] ?? []), category]
      return groups
    }, {}),
  ).sort(([a], [b]) => a.localeCompare(b))
  const activeCategoryObj = categories.find((c) => c.slug === categorySlug)

  const vendorsQ = useQuery({
    queryKey: ['vendors', { category: categorySlug, query, ...filters, page: currentPage }],
    queryFn: () => fetchVendors({
      category: categorySlug || undefined,
      q: query || undefined,
      state: filters.state || undefined,
      religion: filters.religion || undefined,
      min_price: filters.min_price || undefined,
      max_price: filters.max_price || undefined,
      page: currentPage,
    }),
  })

  const vendors = vendorsQ.data?.data ?? []
  const totalVendors = vendorsQ.data?.total ?? 0
  const totalPages = vendorsQ.data?.last_page ?? 1
  const states = [...(filtersQ.data?.states?.length ? filtersQ.data.states : STATES)].sort((a, b) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' }),
  )
  const religions = [...(filtersQ.data?.religions?.length ? filtersQ.data.religions : CULTURES)].sort((a, b) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' }),
  )

  const setFilter = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setCurrentPage(1) }
  const resetAll = () => {
    setFilters({ state: '', religion: '', min_price: '', max_price: '' })
    setQuery('')
    setCurrentPage(1)
  }

  useEffect(() => setCurrentPage(1), [categorySlug, query, filters.state, filters.religion, filters.min_price, filters.max_price])

  const activeCount = [
    categorySlug ? 1 : 0,
    filters.state ? 1 : 0,
    filters.religion ? 1 : 0,
    filters.min_price ? 1 : 0,
    filters.max_price ? 1 : 0,
    query ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('listing_filter_count', { detail: activeCount }))
  }, [activeCount])

  useEffect(() => {
    const handleOpen = () => setMobileFilterOpen(true)
    window.addEventListener('open_listing_filters', handleOpen)
    return () => window.removeEventListener('open_listing_filters', handleOpen)
  }, [])

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
      <aside className="hidden xl:block w-72 shrink-0 bg-white border-r border-neutral-200/80 fixed left-0 top-0 bottom-0 z-30 pt-24 p-6 space-y-7 overflow-y-auto custom-scrollbar shadow-xs">
        
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
                className="w-full pl-11 pr-9 py-3 bg-[#FAF8F5] border border-neutral-200 rounded-2xl text-[13px] font-medium outline-none focus:border-[#4E1218] transition"
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
                className="w-full flex items-center justify-between py-1 text-xs font-bold uppercase tracking-wider text-[#4E1218]"
              >
                <span>Categories</span>
                {openSections.categories ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {openSections.categories && (
                <div className="mt-3.5 space-y-1.5">
                  <button
                    onClick={() => selectCategory('')}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition flex items-center justify-between cursor-pointer ${
                      !categorySlug ? 'bg-burgundy-900/10 text-[#7B1F2A] font-bold' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${!categorySlug ? 'bg-[#7B1F2A]' : 'bg-transparent'}`} />
                      All Categories
                    </span>
                  </button>

                  {groupedCategories.map(([letter, letterCategories]) => (
                    <div
                      key={letter}
                      className="pt-2 first:pt-1"
                      onMouseEnter={() => setOpenCategoryLetter(letter)}
                      onMouseLeave={() => setOpenCategoryLetter(null)}
                      onFocus={() => setOpenCategoryLetter(letter)}
                      onBlur={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) {
                          setOpenCategoryLetter(null)
                        }
                      }}
                    >
                      <button
                        type="button"
                        aria-expanded={openCategoryLetter === letter}
                        className="w-full px-4 py-2 rounded-lg flex items-center justify-between text-sm font-bold uppercase tracking-[0.18em] text-[#C08E3F] hover:bg-[#FAF8F5] transition cursor-default"
                      >
                        <span>{letter}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openCategoryLetter === letter ? 'rotate-180' : ''}`} />
                      </button>
                      {openCategoryLetter === letter && (
                        <div className="mt-1 space-y-1">
                          {letterCategories.map((cat) => {
                            const active = categorySlug === cat.slug
                            return (
                              <button
                                key={cat.slug}
                                onClick={() => selectCategory(cat.slug)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition flex items-center justify-between cursor-pointer ${
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
                  ))}
                </div>
              )}
            </div>

            {/* Location / State Accordion */}
            <div className="border-b border-neutral-100 pb-6">
              <button
                onClick={() => toggleSection('location')}
                className="w-full flex items-center justify-between py-1 text-xs font-bold uppercase tracking-wider text-[#4E1218]"
              >
                <span>State / Region</span>
                {openSections.location ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
              </button>

              {openSections.location && (
                <div className="mt-3.5 space-y-2 relative">
                  <select
                    value={filters.state}
                    onChange={(e) => setFilter('state', e.target.value)}
                    className="w-full pl-4 pr-11 py-3 appearance-none bg-[#FAF8F5] border border-neutral-200 rounded-2xl text-[13px] font-semibold text-[#4E1218] outline-none focus:border-[#4E1218]"
                  >
                    <option value="">All Malaysian States</option>
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4E1218]" />
                </div>
              )}
            </div>

            {/* Cultural Tradition Accordion */}
            <div className="border-b border-neutral-100 pb-6">
              <button
                onClick={() => toggleSection('culture')}
                className="w-full flex items-center justify-between py-1 text-xs font-bold uppercase tracking-wider text-[#4E1218]"
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
                        className={`px-3.5 py-2 rounded-full text-[11px] font-bold transition cursor-pointer border ${
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
                className="w-full flex items-center justify-between py-1 text-xs font-bold uppercase tracking-wider text-[#4E1218]"
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
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-neutral-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#4E1218]"
                    />
                    <input
                      type="number"
                      placeholder="Max RM"
                      value={filters.max_price}
                      onChange={(e) => setFilter('max_price', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-neutral-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#4E1218]"
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
      <main className="flex-1 min-w-0 w-full xl:ml-72 xl:w-[calc(100%-18rem)] pt-28 pb-20 px-6 sm:px-10 lg:px-12">
        <div className="max-w-[1248px] mx-auto">
          
          {/* Page Top Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 mb-8 border-b border-neutral-200">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#4E1218] tracking-tight">
                {activeCategoryObj ? `${activeCategoryObj.name}` : 'All Verified Vendors'}
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 mt-3 max-w-2xl leading-relaxed italic">
                Browse verified wedding vendors, filter by region & budget, and connect directly on WhatsApp with zero commission.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white border border-neutral-200 px-6 py-3 rounded-full text-xs font-bold text-[#4E1218] shadow-xs">
                <span className="text-[#C08E3F] text-sm">{vendorsQ.isLoading ? '...' : totalVendors}</span> Vendors Found
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
            <ResultsGrid vendors={vendors} loading={vendorsQ.isLoading} onReset={resetAll} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />

          </div>
        </main>

      {/* DYNAMIC FILTER OVERLAY DRAWER FOR MINIMIZED / MOBILE / TABLET SCREENS */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs xl:hidden"
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
                    <button
                      type="button"
                      onClick={() => setMobileCategoryOpen((open) => !open)}
                      aria-haspopup="listbox"
                      aria-expanded={mobileCategoryOpen}
                      className={`flex min-h-12 w-full items-center justify-between rounded-2xl border bg-[#FAF8F5] py-3 pl-4 pr-3 text-left text-sm font-semibold text-neutral-800 transition ${mobileCategoryOpen ? 'border-[#7B1F2A] ring-4 ring-[#7B1F2A]/10' : 'border-neutral-300 hover:border-[#C08E3F]'}`}
                    >
                      <span className="truncate">{activeCategoryObj?.name ?? 'All Categories'}</span>
                      <span className={`ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FAEDE6] text-[#7B1F2A] transition-transform duration-200 ${mobileCategoryOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {mobileCategoryOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div role="listbox" aria-label="Vendor category" className="max-h-72 overflow-y-auto rounded-2xl border border-[#E8C7BD] bg-white p-2 shadow-[0_8px_20px_-12px_rgba(78,18,24,0.45)] custom-scrollbar">
                            <button
                              type="button"
                              role="option"
                              aria-selected={!categorySlug}
                              onClick={() => {
                                setMobileCategoryOpen(false)
                                setMobileFilterOpen(false)
                                selectCategory('')
                              }}
                              className={`flex w-full items-center rounded-xl px-3.5 py-2.5 text-left text-sm transition ${!categorySlug ? 'bg-[#7B1F2A] font-semibold text-white' : 'text-neutral-700 hover:bg-[#FAEDE6] hover:text-[#4E1218]'}`}
                            >
                              All Categories
                            </button>

                            {groupedCategories.map(([letter, letterCategories]) => (
                              <div key={letter} className="pt-2">
                                <p className="px-3.5 pb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#C08E3F]">{letter}</p>
                                {letterCategories.map((category) => {
                                  const selected = categorySlug === category.slug
                                  return (
                                    <button
                                      key={category.slug}
                                      type="button"
                                      role="option"
                                      aria-selected={selected}
                                      onClick={() => {
                                        setMobileCategoryOpen(false)
                                        setMobileFilterOpen(false)
                                        selectCategory(category.slug)
                                      }}
                                      className={`flex w-full items-center rounded-xl px-3.5 py-2.5 text-left text-sm transition ${selected ? 'bg-[#7B1F2A] font-semibold text-white' : 'text-neutral-700 hover:bg-[#FAEDE6] hover:text-[#4E1218]'}`}
                                    >
                                      {category.name}
                                    </button>
                                  )
                                })}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">State / Region</label>
                    <button
                      type="button"
                      onClick={() => setMobileStateOpen((open) => !open)}
                      aria-haspopup="listbox"
                      aria-expanded={mobileStateOpen}
                      className={`flex min-h-12 w-full items-center justify-between rounded-2xl border bg-[#FAF8F5] py-3 pl-4 pr-3 text-left text-sm font-semibold text-neutral-800 transition ${mobileStateOpen ? 'border-[#7B1F2A] ring-4 ring-[#7B1F2A]/10' : 'border-neutral-300 hover:border-[#C08E3F]'}`}
                    >
                      <span className="truncate">{filters.state || 'All States'}</span>
                      <span className={`ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FAEDE6] text-[#7B1F2A] transition-transform duration-200 ${mobileStateOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {mobileStateOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div role="listbox" aria-label="State or region" className="max-h-64 overflow-y-auto rounded-2xl border border-[#E8C7BD] bg-white p-2 shadow-[0_8px_20px_-12px_rgba(78,18,24,0.45)] custom-scrollbar">
                            <button
                              type="button"
                              role="option"
                              aria-selected={!filters.state}
                              onClick={() => {
                                setFilter('state', '')
                                setMobileStateOpen(false)
                              }}
                              className={`flex w-full items-center rounded-xl px-3.5 py-2.5 text-left text-sm transition ${!filters.state ? 'bg-[#7B1F2A] font-semibold text-white' : 'text-neutral-700 hover:bg-[#FAEDE6] hover:text-[#4E1218]'}`}
                            >
                              All States
                            </button>
                            {states.map((stateName) => {
                              const selected = filters.state === stateName
                              return (
                                <button
                                  key={stateName}
                                  type="button"
                                  role="option"
                                  aria-selected={selected}
                                  onClick={() => {
                                    setFilter('state', stateName)
                                    setMobileStateOpen(false)
                                  }}
                                  className={`flex w-full items-center rounded-xl px-3.5 py-2.5 text-left text-sm transition ${selected ? 'bg-[#7B1F2A] font-semibold text-white' : 'text-neutral-700 hover:bg-[#FAEDE6] hover:text-[#4E1218]'}`}
                                >
                                  {stateName}
                                </button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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

function ResultsGrid({ vendors, loading, onReset, currentPage, setCurrentPage, totalPages }) {
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

  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {vendors.map((v) => (
          <VendorCard key={v.slug || v.id} vendor={v} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Vendor listing pages" className="mt-16 flex flex-wrap items-center justify-center gap-2 border-t border-neutral-100 pt-8">
          <button type="button" disabled={currentPage === 1} onClick={() => goToPage(Math.max(currentPage - 1, 1))} className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:border-[#7B1F2A] hover:text-[#7B1F2A] disabled:cursor-not-allowed disabled:opacity-40">
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button key={page} type="button" aria-current={currentPage === page ? 'page' : undefined} onClick={() => goToPage(page)} className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${currentPage === page ? 'bg-[#7B1F2A] text-white' : 'border border-neutral-300 text-neutral-700 hover:border-[#7B1F2A] hover:text-[#7B1F2A]'}`}>
              {page}
            </button>
          ))}
          <button type="button" disabled={currentPage === totalPages} onClick={() => goToPage(Math.min(currentPage + 1, totalPages))} className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:border-[#7B1F2A] hover:text-[#7B1F2A] disabled:cursor-not-allowed disabled:opacity-40">
            Next
          </button>
        </nav>
      )}
    </section>
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
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Category Tag */}
          {v.category?.name && (
            <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-[#4E1218] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
              {v.category.name}
            </span>
          )}

          {/* Badges */}
          {v.is_golpro && <GoldProBadge className="absolute top-3 left-3 golpro-badge--compact" />}
        </div>

        {/* Info */}
        <div className="space-y-1.5 px-1">
          <h3 className="font-display text-lg font-bold text-[#4E1218] group-hover:text-[#7B1F2A] transition leading-snug line-clamp-2 min-h-[52px]">
            {v.name}
          </h3>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#7B1F2A] font-semibold">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{v.area ? `${v.area}, ${v.state}` : v.state || 'Malaysia'}</span>
            </div>
            {v.slug?.startsWith('test-') && (
              <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-amber-100 text-amber-800 rounded-sm">
                Test
              </span>
            )}
            {v.subscription_tier && (
              <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-[#7B1F2A]/10 text-[#7B1F2A] rounded-sm">
                {v.subscription_tier === 'golpro' ? 'Elite' : v.subscription_tier}
              </span>
            )}
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
