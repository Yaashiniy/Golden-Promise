import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, X, Wallet, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { addBudgetItem } from '../api/budgetItems.js'
import { fetchBudget } from '../api/budget.js'
import { useAuth } from '../contexts/AuthContext.jsx'

/**
 * Modal: "Add to Budget"
 * Used from Venue / Vendor / Product detail pages to shortlist items
 * into a budget category for side-by-side comparison.
 */
export function AddToBudgetModal({ open, onClose, item, type, price }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: budget } = useQuery({
    queryKey: ['budget'],
    queryFn: fetchBudget,
    enabled: open && user?.role === 'couple',
  })
  const categories = budget?.categories ?? []

  const defaultCategoryName = type === 'venue' ? 'Venue' : 'Vendors'

  const [mode, setMode] = useState('existing') // 'existing' | 'new'
  const [categoryId, setCategoryId] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [estimated, setEstimated] = useState(price ?? 0)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    // Sensible defaults each time the modal opens
    setEstimated(price ?? 0)
    setNotes('')
    // Try to auto-select an existing category that matches the type
    const match = categories.find((c) =>
      c.name.toLowerCase().includes(defaultCategoryName.toLowerCase()),
    )
    if (match) {
      setMode('existing')
      setCategoryId(String(match.id))
    } else if (categories.length > 0) {
      setMode('existing')
      setCategoryId(String(categories[0].id))
    } else {
      setMode('new')
      setNewCategoryName(defaultCategoryName)
    }
  }, [open, categories.length, price, type])

  const add = useMutation({
    mutationFn: addBudgetItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget'] })
      toast.success('Added to budget')
      onClose()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not add'),
  })

  function submit(e) {
    e.preventDefault()
    if (!user) { onClose(); navigate('/login'); return }
    if (user.role !== 'couple') {
      toast.error("This feature is only available to couples. You're currently signed in as a vendor.")
      return
    }

    const payload = {
      source_type: type,
      source_id: item.id,
      name: item.name,
      estimated: Number(estimated) || 0,
      notes: notes || null,
    }
    if (mode === 'existing' && categoryId) {
      payload.category_id = Number(categoryId)
    } else if (mode === 'new' && newCategoryName) {
      payload.category_name = newCategoryName
    }
    add.mutate(payload)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-burgundy-950/60 backdrop-blur-sm grid place-items-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_60px_-20px_rgba(56,10,16,0.38)] sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#7B1F2A] transition hover:bg-[#FAEDE6]"
            >
              <X className="w-4 h-4 text-burgundy-800" />
            </button>

            <div className="flex items-center gap-2.5 pr-10">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#FAEDE6] text-[#7B1F2A]">
                <Wallet className="h-4 w-4" />
              </span>
              <p className="font-script text-2xl text-[#7B1F2A]">Shortlist for budget</p>
            </div>
            <h3 className="mt-3 pr-8 font-display text-2xl font-medium leading-tight text-[#4E1218]">{item?.name}</h3>
            <p className="mt-2 text-sm leading-6 text-[#785A5E]">
              Add it to a category so you can compare options side-by-side.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-5">
              {/* Mode switcher */}
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#FAEDE6] p-1">
                <button
                  type="button"
                  onClick={() => setMode('existing')}
                  disabled={categories.length === 0}
                  className={`rounded-lg py-2 text-xs font-semibold transition disabled:opacity-40 ${
                    mode === 'existing' ? 'bg-[#7B1F2A] text-white shadow-sm' : 'text-[#7B1F2A] hover:bg-white/55'
                  }`}
                >
                  Existing category
                </button>
                <button
                  type="button"
                  onClick={() => setMode('new')}
                  className={`rounded-lg py-2 text-xs font-semibold transition ${
                    mode === 'new' ? 'bg-[#7B1F2A] text-white shadow-sm' : 'text-[#7B1F2A] hover:bg-white/55'
                  }`}
                >
                  + New category
                </button>
              </div>

              {mode === 'existing' ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#4E1218]">Budget category</span>
                  <span className="relative block">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#7B1F2A]/20 bg-white px-4 py-3 pr-12 text-sm text-[#4E1218] outline-none transition focus:border-[#7B1F2A] focus:ring-3 focus:ring-[#7B1F2A]/10"
                  >
                    {categories.length === 0 && <option value="">No categories yet — create one →</option>}
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (RM {Number(c.estimated).toLocaleString()})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B1F2A]" />
                  </span>
                </label>
              ) : (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#4E1218]">New category name</span>
                  <input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Venue, Jewellery, Florist"
                    className="w-full rounded-xl border border-[#7B1F2A]/20 bg-white px-4 py-3 text-sm text-[#4E1218] outline-none transition placeholder:text-[#9A777B] focus:border-[#7B1F2A] focus:ring-3 focus:ring-[#7B1F2A]/10"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#4E1218]">Estimated price (RM)</span>
                <input
                  type="number"
                  value={estimated}
                  onChange={(e) => setEstimated(e.target.value)}
                  min="0"
                  className="w-full rounded-xl border border-[#7B1F2A]/20 bg-white px-4 py-3 text-sm text-[#4E1218] outline-none transition focus:border-[#7B1F2A] focus:ring-3 focus:ring-[#7B1F2A]/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#4E1218]">Notes <span className="font-normal text-[#8A6A6E]">(optional)</span></span>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Quote received, things to ask, etc."
                  className="w-full resize-none rounded-xl border border-[#7B1F2A]/20 bg-white px-4 py-3 text-sm text-[#4E1218] outline-none transition placeholder:text-[#9A777B] focus:border-[#7B1F2A] focus:ring-3 focus:ring-[#7B1F2A]/10"
                />
              </label>

              <button
                type="submit"
                disabled={add.isPending}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#7B1F2A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#4E1218] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {add.isPending ? 'Adding…' : (<><Plus className="w-4 h-4" /> Add to my budget</>)}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
