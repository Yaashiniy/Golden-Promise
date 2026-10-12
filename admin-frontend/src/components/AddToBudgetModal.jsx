import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { X, Wallet, Plus, Check } from 'lucide-react'
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
    enabled: open && !!user,
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
    if (user.role !== 'couple') { toast.error('Sign in as a couple'); return }

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
            className="bg-blush-50 rounded-2xl shadow-[var(--shadow-glow)] max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-blush-200 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-burgundy-800" />
            </button>

            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-burgundy-700" />
              <p className="font-script text-2xl text-burgundy-700">Shortlist for budget</p>
            </div>
            <h3 className="font-display text-2xl text-burgundy-900 mt-1">{item?.name}</h3>
            <p className="text-sm text-burgundy-700 mt-1">
              Add it to a category so you can compare options side-by-side.
            </p>

            <form onSubmit={submit} className="mt-5 space-y-4">
              {/* Mode switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-blush-100 rounded-full">
                <button
                  type="button"
                  onClick={() => setMode('existing')}
                  disabled={categories.length === 0}
                  className={`py-1.5 rounded-full text-xs font-medium transition disabled:opacity-40 ${
                    mode === 'existing' ? 'bg-burgundy-800 text-blush-100' : 'text-burgundy-800'
                  }`}
                >
                  Existing category
                </button>
                <button
                  type="button"
                  onClick={() => setMode('new')}
                  className={`py-1.5 rounded-full text-xs font-medium transition ${
                    mode === 'new' ? 'bg-burgundy-800 text-blush-100' : 'text-burgundy-800'
                  }`}
                >
                  + New category
                </button>
              </div>

              {mode === 'existing' ? (
                <label className="block">
                  <span className="block text-sm text-burgundy-700 mb-1">Budget category</span>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-blush-100 border border-burgundy-200/60 rounded-lg focus:outline-none focus:border-burgundy-800"
                  >
                    {categories.length === 0 && <option value="">No categories yet — create one →</option>}
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (RM {Number(c.estimated).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="block">
                  <span className="block text-sm text-burgundy-700 mb-1">New category name</span>
                  <input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Venue, Jewellery, Florist"
                    className="w-full px-4 py-2.5 bg-blush-100 border border-burgundy-200/60 rounded-lg focus:outline-none focus:border-burgundy-800"
                  />
                </label>
              )}

              <label className="block">
                <span className="block text-sm text-burgundy-700 mb-1">Estimated price (RM)</span>
                <input
                  type="number"
                  value={estimated}
                  onChange={(e) => setEstimated(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2.5 bg-blush-100 border border-burgundy-200/60 rounded-lg focus:outline-none focus:border-burgundy-800"
                />
              </label>

              <label className="block">
                <span className="block text-sm text-burgundy-700 mb-1">Notes (optional)</span>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Quote received, things to ask, etc."
                  className="w-full px-4 py-2.5 bg-blush-100 border border-burgundy-200/60 rounded-lg focus:outline-none focus:border-burgundy-800"
                />
              </label>

              <button
                type="submit"
                disabled={add.isPending}
                className="btn-primary w-full justify-center disabled:opacity-60"
              >
                {add.isPending ? 'Adding…' : (<><Plus className="w-4 h-4" /> Add to my budget</>)}
              </button>

              <p className="text-xs text-burgundy-600 text-center">
                It will appear in <Link to="/dashboard/budget" className="underline">your Smart Budget</Link>.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
