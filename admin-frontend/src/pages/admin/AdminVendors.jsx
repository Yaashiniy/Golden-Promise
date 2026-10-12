import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Trash2, Check, X, Filter } from 'lucide-react'
import { Reveal } from '../../components/Reveal.jsx'
import { getAdminVendors } from '../../api/admin.js'

export default function AdminVendors() {
  const [filters, setFilters] = useState({ category: '', tier: '', area: '', page: 1 })
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendors', filters],
    queryFn: () => getAdminVendors(filters),
    keepPreviousData: true,
  })

  return (
    <div className="bg-blush-100 min-h-[calc(100vh-5rem)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <Link to="/admin" className="inline-flex items-center gap-1 text-burgundy-700 hover:text-burgundy-900 text-sm mb-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
          <Reveal>
            <h1 className="font-display text-4xl text-burgundy-900">Vendors</h1>
          </Reveal>

          {/* Filters */}
          <Reveal delay={0.1}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blush-50 px-3 py-1.5 rounded-lg border border-burgundy-200/50">
                <Filter className="w-4 h-4 text-burgundy-700" />
                <select value={filters.tier} onChange={(e) => setFilters({ ...filters, tier: e.target.value, page: 1 })} className="bg-transparent text-sm text-burgundy-900 focus:outline-none">
                  <option value="">All Tiers</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="elite">Elite / GolPro</option>
                </select>
              </div>
              <div className="bg-blush-50 px-3 py-1.5 rounded-lg border border-burgundy-200/50">
                <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })} className="bg-transparent text-sm text-burgundy-900 focus:outline-none">
                  <option value="">All Categories</option>
                  <option value="venues">Venues</option>
                  <option value="photographers">Photographers</option>
                  <option value="videographers">Videographers</option>
                  <option value="makeup-artists">Makeup Artists</option>
                  <option value="caterers">Caterers</option>
                  <option value="planners">Planners</option>
                </select>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Stats */}
        {data && (
          <Reveal delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="card-surface !bg-blush-50 p-4">
                <p className="text-sm text-burgundy-700">Total Vendors</p>
                <p className="font-display text-3xl text-burgundy-900 mt-1">{data.stats.total}</p>
              </div>
              <div className="card-surface !bg-blush-50 p-4">
                <p className="text-sm text-burgundy-700">Elite / GolPro</p>
                <p className="font-display text-3xl text-burgundy-900 mt-1">{data.stats.by_tier['elite'] || data.stats.by_tier['golpro'] || 0}</p>
              </div>
              <div className="card-surface !bg-blush-50 p-4">
                <p className="text-sm text-burgundy-700">Premium</p>
                <p className="font-display text-3xl text-burgundy-900 mt-1">{data.stats.by_tier['premium'] || 0}</p>
              </div>
              <div className="card-surface !bg-blush-50 p-4">
                <p className="text-sm text-burgundy-700">Free</p>
                <p className="font-display text-3xl text-burgundy-900 mt-1">{data.stats.by_tier['free'] || 0}</p>
              </div>
            </div>
          </Reveal>
        )}

        {/* Table */}
        <Reveal delay={0.3}>
          <div className="mt-6 card-surface !bg-blush-50 overflow-x-auto relative">
            {isLoading && <div className="absolute inset-0 bg-blush-50/50 grid place-items-center"><span className="text-burgundy-800">Loading...</span></div>}
            <table className="w-full text-left min-w-[900px]">
              <thead className="border-b border-burgundy-200/60 text-burgundy-800 text-sm">
                <tr>
                  <th className="px-5 py-4 font-medium">Business Name</th>
                  <th className="px-5 py-4 font-medium">Category</th>
                  <th className="px-5 py-4 font-medium">Location</th>
                  <th className="px-5 py-4 font-medium">Starting Price</th>
                  <th className="px-5 py-4 font-medium">Business Type</th>
                  <th className="px-5 py-4 font-medium">Tier</th>
                  <th className="px-5 py-4 w-0" />
                </tr>
              </thead>
              <tbody className="text-sm">
                {data?.vendors?.data?.map((v) => (
                  <tr key={v.id} className="border-b border-burgundy-200/40 hover:bg-blush-100/60">
                    <td className="px-5 py-4 font-medium text-burgundy-900">{v.name}</td>
                    <td className="px-5 py-4 text-burgundy-700 capitalize">{v.category?.name || '-'}</td>
                    <td className="px-5 py-4 text-burgundy-700">{v.area || '-'}</td>
                    <td className="px-5 py-4 text-burgundy-700">{v.price_from ? `RM ${v.price_from}` : '-'}</td>
                    <td className="px-5 py-4 text-burgundy-700 capitalize">{v.business_type || 'Unverified'}</td>
                    <td className="px-5 py-4">
                      {v.subscription_tier === 'elite' || v.subscription_tier === 'golpro'
                        ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-500 text-burgundy-950 text-xs font-medium"><Check className="w-3 h-3" /> Elite</span>
                        : v.subscription_tier === 'premium'
                        ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-burgundy-200 text-burgundy-900 text-xs font-medium"><Check className="w-3 h-3" /> Premium</span>
                        : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blush-200 text-burgundy-700 text-xs"><X className="w-3 h-3" /> Free</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5">
                        <button className="p-2 rounded hover:bg-burgundy-100 text-burgundy-800" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                        <button className="p-2 rounded hover:bg-burgundy-100 text-burgundy-800" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.vendors?.data?.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-5 py-10 text-center text-burgundy-700">No vendors found matching your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination */}
            {data?.vendors?.last_page > 1 && (
              <div className="px-5 py-4 border-t border-burgundy-200/60 flex items-center justify-between">
                <span className="text-sm text-burgundy-700">
                  Showing {data.vendors.from} to {data.vendors.to} of {data.vendors.total} entries
                </span>
                <div className="flex gap-2">
                  <button 
                    disabled={filters.page === 1} 
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    className="px-3 py-1 text-sm bg-blush-200 text-burgundy-800 rounded disabled:opacity-50 hover:bg-blush-300"
                  >
                    Prev
                  </button>
                  <button 
                    disabled={filters.page === data.vendors.last_page} 
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    className="px-3 py-1 text-sm bg-blush-200 text-burgundy-800 rounded disabled:opacity-50 hover:bg-blush-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  )
}
