import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Filter, X, Tag } from 'lucide-react'

/**
 * Reusable filter strip: state dropdown + religion chips + budget slider.
 * `value` shape: { state, religion, min_price, max_price }
 * `filters` from /api/.../filters: { states: [], religions: [], price_min, price_max }
 */
export function FilterPanel({ value, onChange, filters, resultCount }) {
  const [open, setOpen] = useState(false)
  const states = filters?.states ?? []
  const religions = filters?.religions ?? []
  const priceMin = filters?.price_min ?? 0
  const priceMax = filters?.price_max ?? 50000

  const set = (k, v) => onChange({ ...value, [k]: v })
  const reset = () => onChange({ state: '', religion: '', min_price: '', max_price: '' })
  const activeCount = [value.state, value.religion, value.min_price, value.max_price].filter(Boolean).length

  return (
    <div className="bg-blush-50 rounded-2xl border border-burgundy-200/50 overflow-hidden">
      {/* Top row */}
      <div className="px-5 py-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            activeCount > 0 ? 'bg-burgundy-800 text-blush-100' : 'bg-blush-100 text-burgundy-800 hover:bg-blush-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blush-100/30 text-[11px] font-bold">{activeCount}</span>
          )}
        </button>

        <select
          value={value.state ?? ''}
          onChange={(e) => set('state', e.target.value)}
          className="px-4 py-2 bg-blush-100 border border-burgundy-200/60 rounded-full text-sm text-burgundy-900 focus:outline-none focus:border-burgundy-800"
        >
          <option value="">📍 All states (Malaysia)</option>
          {states.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>

        {/* Religion quick chips */}
        <div className="flex flex-wrap gap-1.5">
          {religions.slice(0, 4).map((r) => (
            <button
              key={r}
              onClick={() => set('religion', value.religion === r ? '' : r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                value.religion === r ? 'bg-burgundy-800 text-blush-100' : 'bg-blush-100 text-burgundy-800 hover:bg-blush-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {resultCount != null && (
          <span className="ml-auto text-sm text-burgundy-700">{resultCount} result{resultCount === 1 ? '' : 's'}</span>
        )}
        {activeCount > 0 && (
          <button onClick={reset} className="text-xs text-burgundy-700 hover:text-burgundy-900 underline">Clear all</button>
        )}
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-burgundy-200/40 grid md:grid-cols-2 gap-6">
              {/* All religions */}
              <div>
                <p className="text-xs uppercase tracking-wider text-burgundy-700 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Culture / Religion
                </p>
                <div className="flex flex-wrap gap-2">
                  {religions.map((r) => (
                    <button
                      key={r}
                      onClick={() => set('religion', value.religion === r ? '' : r)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        value.religion === r ? 'bg-burgundy-800 text-blush-100' : 'bg-blush-100 text-burgundy-800 border border-burgundy-200/60 hover:bg-blush-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-burgundy-600 mt-2 italic">
                  Filter venues/vendors that cater to specific religious traditions.
                </p>
              </div>

              {/* Budget */}
              <div>
                <p className="text-xs uppercase tracking-wider text-burgundy-700 mb-2 flex items-center gap-1.5">
                  💰 Budget (RM)
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={`Min ${priceMin.toLocaleString()}`}
                    value={value.min_price ?? ''}
                    onChange={(e) => set('min_price', e.target.value)}
                    className="flex-1 px-3 py-2 bg-blush-100 border border-burgundy-200/60 rounded-lg text-sm focus:outline-none focus:border-burgundy-800"
                  />
                  <span className="text-burgundy-500">—</span>
                  <input
                    type="number"
                    placeholder={`Max ${priceMax.toLocaleString()}`}
                    value={value.max_price ?? ''}
                    onChange={(e) => set('max_price', e.target.value)}
                    className="flex-1 px-3 py-2 bg-blush-100 border border-burgundy-200/60 rounded-lg text-sm focus:outline-none focus:border-burgundy-800"
                  />
                </div>
                {/* Quick budget presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[[0, 5000], [5000, 15000], [15000, 30000], [30000, '']].map(([min, max]) => {
                    const label = max ? `RM ${(min / 1000)|0}k–${(max / 1000)|0}k` : `RM ${(min / 1000)|0}k+`
                    const isActive = String(value.min_price ?? '') === String(min) && String(value.max_price ?? '') === String(max)
                    return (
                      <button
                        key={label}
                        onClick={() => onChange({ ...value, min_price: min, max_price: max })}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                          isActive ? 'bg-burgundy-800 text-blush-100' : 'bg-blush-100 text-burgundy-700 hover:bg-blush-200'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
