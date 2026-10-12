import { useState, useMemo, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2, Check, X,
  ArrowLeft, Sparkles, Wand2, MessageCircle, Send,
  MapPin, Briefcase, Settings,
  ExternalLink, Star, Pencil, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { DashboardSidebar } from '../../components/DashboardSidebar.jsx'
import { WeddingDatePicker } from '../../components/WeddingDatePicker.jsx'
import * as budgetApi from '../../api/budget.js'
import * as catApi from '../../api/budgetCategories.js'
import * as itemApi from '../../api/budgetItems.js'
import { sendBudgetChat, applyBudgetProposal } from '../../api/aiChat.js'
import { api } from '../../api/client.js'

export default function Budget() {
  const { user } = useAuth()

  const { data } = useQuery({ queryKey: ['budget'], queryFn: budgetApi.fetchBudget })
  const total       = Number(data?.total_budget ?? 0)
  const categories  = useMemo(() => data?.categories ?? [], [data?.categories])

  const { actualCost, paid } = useMemo(() => {
    let act = 0, pd = 0
    categories.forEach((c) => {
      const items = c.items ?? []
      items.forEach((it) => {
        act += Number(it.actual_cost ?? 0)
        pd  += Number(it.paid_amount ?? 0)
      })
    })
    return { actualCost: act, paid: pd }
  }, [categories])
  const [drawerCatId, setDrawerCatId] = useState(null) // null | '__new__' | id
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [compareCatId, setCompareCatId] = useState(null)
  const [topMatchesModalData, setTopMatchesModalData] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem('sidebar_left_open') !== 'false')

  useEffect(() => {
    const handleToggle = () => setSidebarOpen(localStorage.getItem('sidebar_left_open') !== 'false')
    window.addEventListener('sidebar_left_toggle', handleToggle)
    return () => window.removeEventListener('sidebar_left_toggle', handleToggle)
  }, [])

  const compareCat = useMemo(() => {
    if (compareCatId === null) return null
    return categories.find((c) => c.id === compareCatId) ?? null
  }, [compareCatId, categories])
  
  const navigate = useNavigate()

  function helpMeBudget() {
    if (!user?.culture) { toast.error('Set your culture in your profile first'); return }
    if (!total)        { toast.error('Set your total budget first');     return }
    setAddMenuOpen(false)
    navigate('/dashboard/goldie')
  }

  return (
    <div className="relative bg-[#FAF8F5] min-h-screen text-[#2C2A29]">
      <DashboardSidebar />

      <div
        className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-[270px]' : 'lg:pl-0'}`}
      >
        <main className="px-5 lg:px-10 pt-28 pb-16 min-w-0 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-8 flex-wrap justify-between">
              <h1 className="font-display text-4xl text-[#4E1218] font-medium">
                Budget
              </h1>
            </div>

            <div className="mb-6 w-full">
              <BudgetOverviewHeader
                total={total}
                actualCost={actualCost}
                paid={paid}
              />
              {data?.intelligence && <BudgetHealth intelligence={data.intelligence} />}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <button
                type="button"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4E1218] hover:text-[#7B1F2A] transition"
              >
                Manage groups
              </button>
              <AddBudgetItemButton
                open={addMenuOpen}
                setOpen={setAddMenuOpen}
                onAddCategory={() => { setAddMenuOpen(false); setCategoryModalOpen(true) }}
                onAddVendor={() => { setAddMenuOpen(false); setDrawerCatId('__new__') }}
                onHelpAI={helpMeBudget}
                aiPending={false}
              />
            </div>

            {/* Table (Ayyala projects style) */}
            <BudgetTable
              categories={categories}
              onAddVendor={(catId) => setDrawerCatId(catId)}
              onHelpAI={helpMeBudget}
              aiPending={false}
              hasBudget={!!total}
              hasCulture={!!user?.culture}
              onOpenCompare={setCompareCatId}
              onOpenTopMatches={setTopMatchesModalData}
            />

          </main>


        </div>

      {/* Slide-in drawers */}
      <AnimatePresence>
        {drawerCatId !== null && (
          <AddVendorDrawer
            categoryId={drawerCatId === '__new__' ? null : drawerCatId}
            categories={categories}
            close={() => setDrawerCatId(null)}
          />
        )}
        {categoryModalOpen && (
          <AddCategoryDrawer close={() => setCategoryModalOpen(false)} />
        )}

        {compareCat && (
          <ComparisonModal
            cat={compareCat}
            close={() => setCompareCatId(null)}
          />
        )}
        {topMatchesModalData && (
          <TopMatchesModal
            data={topMatchesModalData}
            close={() => setTopMatchesModalData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function BudgetOverviewHeader({ total, actualCost, paid }) {
  return (
    <div className="grid gap-4">
      <div className="rounded-[28px] bg-[#E7F3E7] p-6 shadow-sm border border-[#D0E6D0]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] font-semibold text-[#4E1218]/80">Total budget</p>
            <p className="mt-3 text-4xl font-semibold text-[#4E1218]">RM {Number(total).toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] bg-white p-4 border border-[#D8E6D8] shadow-sm">
            <div className="flex gap-4 items-center">
              <div className="h-16 w-2 rounded-full bg-[#7B1F2A]" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] font-semibold text-[#8A6A6E]">Total actual cost</p>
                <p className="mt-3 text-2xl font-semibold text-[#4E1218]">RM {Number(actualCost).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-4 border border-[#D8E6D8] shadow-sm">
            <div className="flex gap-4 items-center">
              <div className="h-16 w-2 rounded-full bg-[#10B981]" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] font-semibold text-[#8A6A6E]">Total paid</p>
                <p className="mt-3 text-2xl font-semibold text-[#4E1218]">RM {Number(paid).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BudgetHealth({ intelligence }) {
  const health = intelligence.health ?? {}
  const warnings = intelligence.warnings ?? []
  const breakdown = health.breakdown ?? {}
  return (
    <div className="mt-3 flex flex-col gap-3 rounded-2xl bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FAEDE6] font-display text-lg font-semibold text-[#7B1F2A]">
          {health.score ?? 0}
        </span>
        <div>
          <p className="text-sm font-semibold text-[#4E1218]">Budget health</p>
          <p className="mt-0.5 text-xs text-[#6B3E44]">{health.explanation}</p>
          <p className="mt-1 text-[10px] text-[#8A6A6E]">
            Allocation {breakdown.allocation ?? 0}/30 · Essentials {breakdown.essentials ?? 0}/25 · Vendors {breakdown.vendors ?? 0}/20 · Reserve {breakdown.reserve ?? 0}/15 · Details {breakdown.profile ?? 0}/10
          </p>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-xs font-semibold text-[#4E1218]">RM {Number(intelligence.remaining ?? 0).toLocaleString()} remaining</p>
        <p className="mt-0.5 text-[11px] text-[#7B1F2A]">{warnings.length} item{warnings.length === 1 ? '' : 's'} need attention</p>
      </div>
    </div>
  )
}

/* ─────────────────────────── ADD BUDGET ITEM BUTTON ─────────── */

function AddBudgetItemButton({ open, setOpen, onAddCategory, onAddVendor, onHelpAI, aiPending }) {
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-[#7B1F2A] text-white shadow-lg transition hover:bg-[#4E1218]"
        aria-label="Add budget item"
      >
        <Pencil className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl z-20 overflow-hidden border border-burgundy-200/5"
            >
              <MenuItem onClick={onAddVendor} label="Add a booked vendor" />
              <MenuItem onClick={onAddCategory} label="Add a category" />
              <div className="h-px" style={{ backgroundColor: 'rgba(123, 31, 42, 0.08)' }} />
              <MenuItem onClick={onHelpAI} disabled={aiPending} Icon={Wand2} label={aiPending ? 'Goldie is thinking…' : 'Ask Goldie to build my budget'} gold />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({ onClick, label, gold, disabled, Icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-2.5 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-left transition hover:bg-blush-100 disabled:opacity-60 cursor-pointer"
      style={{ color: '#4E1218' }}
    >
      {Icon && <Icon className="w-3.5 h-3.5" style={{ color: gold ? '#C08E3F' : '#4E1218' }} />}
      {label}
    </button>
  )
}

/* ─────────────────────────── BUDGET TABLE ──────────────────── */

function BudgetTable({ categories, onAddVendor, onHelpAI, aiPending, hasBudget, hasCulture, onOpenCompare, onOpenTopMatches }) {
  if (categories.length === 0) {
    return (
      <div className="rounded-[28px] p-12 text-center bg-white/35 backdrop-blur-md border border-white/50 shadow-sm">
        <Wand2 className="w-10 h-10 mx-auto mb-3" style={{ color: '#C08E3F' }} />
        <p className="font-display text-2xl mb-2 font-medium" style={{ color: '#4E1218' }}>No budget yet</p>
        <p className="text-sm mb-5" style={{ color: '#7A5A5E' }}>
          {!hasCulture && (<><Link to="/dashboard" className="underline font-semibold">Set your culture</Link> first, then </>)}
          {!hasBudget && 'set a total budget above, then '}
          let Goldie draft a culture-aware breakdown.
        </p>
        <button
          onClick={onHelpAI}
          disabled={aiPending || !hasBudget || !hasCulture}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider disabled:opacity-60 cursor-pointer shadow-md bg-[#4E1218] text-white"
        >
          <Wand2 className="w-4 h-4 text-gold-500" /> {aiPending ? 'Thinking…' : 'Help me budget'}
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] overflow-hidden bg-white border border-burgundy-200/30 shadow-sm">
      <div
        className="grid grid-cols-[1.7fr_2fr_1fr_1fr_1fr_76px] px-6 py-4 text-[10px] uppercase tracking-[0.2em] bg-[#FAFAFA] text-[#8A6A6E] font-semibold"
      >
        <div>Item name</div>
        <div>Vendor/Merchant</div>
        <div className="text-right">Estimate</div>
        <div className="text-right">Actual cost</div>
        <div className="text-right">Paid</div>
        <div className="text-right"> </div>
      </div>
      {categories.map((c) => (
        <BudgetRow key={c.id} cat={c} onAddVendor={() => onAddVendor(c.id)} onOpenCompare={onOpenCompare} onOpenTopMatches={onOpenTopMatches} />
      ))}
    </div>
  )
}

function BudgetRow({ cat, onAddVendor, onOpenCompare, onOpenTopMatches }) {
  const qc = useQueryClient()
  const items = cat.items ?? []
  const itemsActual = items.reduce((s, i) => s + Number(i.actual_cost ?? 0), 0)
  const itemsPaid   = items.reduce((s, i) => s + Number(i.paid_amount ?? 0), 0)
  const isOverEstimate = itemsActual > Number(cat.estimated ?? 0)

  const [editing, setEditing] = useState(false)
  const [rowEditorOpen, setRowEditorOpen] = useState(false)
  const [estDraft, setEstDraft] = useState(cat.estimated)

  const updateCat = useMutation({
    mutationFn: ({ id, patch }) => catApi.updateBudgetCategory(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ['budget'] })
      const prev = qc.getQueryData(['budget'])
      qc.setQueryData(['budget'], (old) => {
        if (!old) return old
        return { ...old, categories: (old.categories || []).map((c) => (c.id === id ? { ...c, ...patch } : c)) }
      })
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['budget'], ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: ['budget'] }),
    onSuccess: () => setEditing(false),
  })
  
  const deleteCat = useMutation({
    mutationFn: catApi.deleteBudgetCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budget'] }); toast.success('Removed') },
  })
  
  const getCategorySlug = (name) => {
    if (!name) return ''
    const norm = name.toLowerCase().trim()
    if (norm.includes('photo') || norm.includes('video') || norm.includes('camera')) return 'videographer-photographer'
    if (norm.includes('cater') || norm.includes('food')) return 'caterer'
    if (norm.includes('cake') || norm.includes('dessert') || norm.includes('bakery')) return 'cake-desserts'
    if (norm.includes('band') || norm.includes('dj') || norm.includes('music') || norm.includes('entertainment')) return 'band-dj'
    if (norm.includes('florist') || norm.includes('flower') || norm.includes('decor')) return 'florist'
    if (norm.includes('henna') || norm.includes('mehndi')) return 'henna-artist'
    if (norm.includes('makeup') || norm.includes('mua') || norm.includes('beauty')) return 'makeup-artist'
    if (norm.includes('dance')) return 'dancers'
    return ''
  }

  const slug = getCategorySlug(cat.name)
  const searchLink = cat.name?.toLowerCase().includes('venue') ? '/venues' : (slug ? `/vendors/${slug}` : '/vendors')

  function onDeleteRow() {
    if (!confirm(`Delete category "${cat.name}"?`)) return
    deleteCat.mutate(cat.id)
  }

  // Ayyala Status Badge calculation
  const matchesLabel = searchLink.includes('/vendors/')
    ? 'Ask AI'
    : 'Ask AI'

  return (
    <>
    <div
      onClick={(e) => {
        if (e.target.closest('button, input, a, select, svg')) return
        onOpenCompare(cat.id)
      }}
      className="grid grid-cols-[1.8fr_2.2fr_1fr_1fr_1fr_76px] items-center gap-4 px-6 py-4 text-sm border-b border-burgundy-200/20 hover:bg-[#FCFCFB] transition duration-300 last:border-b-0 cursor-pointer"
      style={{ color: '#4E1218' }}
    >
      <div className="pr-3">
        <p className="font-semibold">{cat.name}</p>
        {items.length < 3 && (
          <button
            onClick={() => onOpenTopMatches({ catId: cat.id, catName: cat.name, estimated: cat.estimated, searchLink })}
            className="btn-shine text-xs font-bold inline-flex items-center px-3.5 mt-3 hover:opacity-90 transition cursor-pointer self-start"
          >
            {matchesLabel}
          </button>
        )}
      </div>

      <div className="pr-3 min-w-0">
        {items.length > 0 && (
          <div className="flex flex-col gap-3 min-w-0">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 min-w-0 group relative">
                {item.image ? (
                  <img src={item.image} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 border border-burgundy-200/10 shadow-sm" />
                ) : (
                  <span
                    className="w-10 h-10 rounded-full grid place-items-center text-xs font-bold shrink-0 shadow-sm"
                    style={{ backgroundColor: '#7B1F2A', color: '#FFFFFF' }}
                  >
                    {(item.name ?? '?').charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#4E1218]">{item.name}</p>
                  {readableBudgetNote(item.notes) && (
                    <p className="text-[12px] text-[#8A6A6E] truncate mt-0.5">{readableBudgetNote(item.notes)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {items.length < 3 && (
          <div className={`flex flex-col items-start gap-1 text-sm ${items.length > 0 ? 'mt-3 pt-3 border-t border-burgundy-200/10' : ''}`}>
            <button
              onClick={onAddVendor}
              className="text-[#4E1218] font-semibold underline underline-offset-4 hover:text-[#7B1F2A] transition"
            >
              Add your vendor
            </button>
          </div>
        )}
      </div>

      <div className="pr-3 text-right font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {editing ? (
          <div className="flex items-center justify-end gap-1">
            <input
              type="number" autoFocus
              value={estDraft}
              onChange={(e) => setEstDraft(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateCat.mutate({ id: cat.id, patch: { estimated: estDraft } })
                if (e.key === 'Escape') { setEditing(false); setEstDraft(cat.estimated) }
              }}
              className="w-20 px-2 py-1 rounded outline-none text-xs text-burgundy-950 bg-neutral-100 border border-burgundy-200/50"
            />
            <button onClick={() => updateCat.mutate({ id: cat.id, patch: { estimated: estDraft } })} className="p-1 rounded-full bg-burgundy-900 text-blush-100 cursor-pointer">
              <Check className="w-2.5 h-2.5" />
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="hover:underline transition cursor-pointer text-[#C08E3F]">
            RM {Number(cat.estimated).toLocaleString()}
          </button>
        )}
      </div>

      <div className="pr-3 text-right font-semibold text-burgundy-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {itemsActual ? (
          <div>
            <span className={isOverEstimate ? 'text-[#B4232C]' : ''}>RM {itemsActual.toLocaleString()}</span>
            {isOverEstimate && <p className="mt-1 text-[10px] font-semibold text-[#B4232C]">RM {(itemsActual - Number(cat.estimated)).toLocaleString()} over</p>}
          </div>
        ) : '—'}
      </div>

      <div className="pr-3 text-right font-semibold text-burgundy-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {itemsPaid ? `RM ${itemsPaid.toLocaleString()}` : '—'}
      </div>

      <div className="flex items-center justify-end gap-1.5">
        <button
          onClick={() => setRowEditorOpen(true)}
          className="w-8 h-8 rounded-full bg-[#F4F0EE] inline-flex items-center justify-center text-[#4E1218] hover:bg-[#7B1F2A] hover:text-white transition cursor-pointer"
          aria-label={`Edit ${cat.name}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDeleteRow}
          className="w-8 h-8 rounded-full bg-[#F7E6E4] inline-flex items-center justify-center text-[#7B1F2A] hover:bg-[#7B1F2A] hover:text-white transition duration-300 cursor-pointer"
          aria-label="Delete category"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
    <AnimatePresence>
      {rowEditorOpen && <EditBudgetRowModal cat={cat} close={() => setRowEditorOpen(false)} />}
    </AnimatePresence>
    </>
  )
}

function editableBudgetNote(notes) {
  if (!notes) return ''
  try {
    const parsed = JSON.parse(notes)
    return parsed.memo ?? ''
  } catch {
    return notes
  }
}

function mergeBudgetNote(notes, memo) {
  try {
    const parsed = JSON.parse(notes || '{}')
    return JSON.stringify({ ...parsed, memo })
  } catch {
    return memo
  }
}

function EditBudgetRowModal({ cat, close }) {
  const qc = useQueryClient()
  const [categoryName, setCategoryName] = useState(cat.name ?? '')
  const [categoryEstimate, setCategoryEstimate] = useState(Number(cat.estimated ?? 0))
  const [items, setItems] = useState(() => (cat.items ?? []).map((item) => ({
    ...item,
    actual_cost: Number(item.actual_cost ?? 0),
    paid_amount: Number(item.paid_amount ?? 0),
    paid: Boolean(item.paid),
    payment_due_date: item.payment_due_date ?? '',
    memo: editableBudgetNote(item.notes),
  })))

  const save = useMutation({
    mutationFn: async () => {
      await catApi.updateBudgetCategory(cat.id, { name: categoryName.trim(), estimated: Number(categoryEstimate || 0) })
      await Promise.all(items.map((item) => itemApi.updateBudgetItem(item.id, {
        name: item.name,
        actual_cost: Number(item.actual_cost || 0),
        paid_amount: Number(item.paid_amount || 0),
        paid: Boolean(item.paid),
        payment_due_date: item.payment_due_date || null,
        notes: mergeBudgetNote(item.notes, item.memo),
      })))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget'] })
      toast.success('Budget row updated')
      close()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not save these changes'),
  })

  function patchItem(id, patch) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.button
        type="button"
        aria-label="Close editor"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#4E1218]/45"
        onClick={close}
      />
      <motion.form
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={(event) => { event.preventDefault(); save.mutate() }}
        className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-[#FAF8F5] text-[#4E1218]"
      >
        <div className="flex items-start justify-between border-b border-[#E8C7BD] bg-white px-6 py-5">
          <div>
            <h2 className="font-display text-2xl font-semibold">Edit budget row</h2>
            <p className="mt-1 text-xs text-[#6B3E44]">Update the plan and payment details for this category.</p>
          </div>
          <button type="button" onClick={close} className="rounded-full p-2 text-[#6B3E44] hover:bg-[#FAEDE6]" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category name">
              <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required className="w-full rounded-xl border border-[#D8C3B3] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#7B1F2A]" />
            </Field>
            <Field label="Estimated budget (RM)">
              <input type="number" min="0" value={categoryEstimate} onChange={(event) => setCategoryEstimate(event.target.value)} className="w-full rounded-xl border border-[#D8C3B3] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#7B1F2A]" />
            </Field>
          </div>

          <div className="mt-7 space-y-4">
            {items.length === 0 ? (
              <p className="rounded-xl bg-white px-4 py-5 text-sm text-[#6B3E44]">No vendor is attached yet. You can still update the category name and estimate.</p>
            ) : items.map((item) => (
              <section key={item.id} className="rounded-xl bg-white p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Vendor or merchant</p>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold">
                    <input type="checkbox" checked={item.paid} onChange={(event) => patchItem(item.id, {
                      paid: event.target.checked,
                      paid_amount: event.target.checked ? Number(item.actual_cost || 0) : item.paid_amount,
                    })} className="accent-[#7B1F2A]" />
                    Fully paid
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name"><input value={item.name ?? ''} onChange={(event) => patchItem(item.id, { name: event.target.value })} className="w-full rounded-xl border border-[#D8C3B3] px-3 py-2.5 text-sm outline-none focus:border-[#7B1F2A]" /></Field>
                  <Field label="Payment due date"><WeddingDatePicker value={item.payment_due_date ?? ''} onChange={(value) => patchItem(item.id, { payment_due_date: value })} placeholder="Select payment date" /></Field>
                  <Field label="Actual cost (RM)"><input type="number" min="0" value={item.actual_cost} onChange={(event) => patchItem(item.id, { actual_cost: event.target.value })} className="w-full rounded-xl border border-[#D8C3B3] px-3 py-2.5 text-sm outline-none focus:border-[#7B1F2A]" /></Field>
                  <Field label="Amount paid (RM)"><input type="number" min="0" value={item.paid_amount} onChange={(event) => patchItem(item.id, { paid_amount: event.target.value })} className="w-full rounded-xl border border-[#D8C3B3] px-3 py-2.5 text-sm outline-none focus:border-[#7B1F2A]" /></Field>
                </div>
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-semibold">Notes</span>
                  <textarea value={item.memo} onChange={(event) => patchItem(item.id, { memo: event.target.value })} rows="2" placeholder="Deposit details, contact person, package notes…" className="w-full resize-none rounded-xl border border-[#D8C3B3] px-3 py-2.5 text-sm outline-none placeholder:text-[#8A6A6E] focus:border-[#7B1F2A]" />
                </label>
              </section>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-[#E8C7BD] bg-white px-6 py-4">
          <button type="button" onClick={close} className="text-sm font-semibold text-[#6B3E44] hover:text-[#4E1218]">Cancel</button>
          <button type="submit" disabled={save.isPending} className="rounded-full bg-[#7B1F2A] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4E1218] disabled:opacity-60">{save.isPending ? 'Saving…' : 'Save changes'}</button>
        </div>
      </motion.form>
    </div>
  )
}

/* ─────────────────────────── ADD VENDOR DRAWER ─────────── */

function AddVendorDrawer({ categoryId, categories, close }) {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [email, setEmail] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [cost, setCost] = useState('')
  const [pickedCatId, setPickedCatId] = useState(categoryId ?? (categories[0]?.id ?? ''))

  const add = useMutation({
    mutationFn: itemApi.addBudgetItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget'] })
      toast.success('Vendor added')
      close()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not add vendor'),
  })

  function submit(e) {
    e?.preventDefault?.()
    if (!name.trim()) { toast.error('Business name required'); return }
    const noteParts = []
    if (city || state) noteParts.push([city, state].filter(Boolean).join(', '))
    if (email)         noteParts.push(`Email: ${email.trim()}`)
    if (eventDate)     noteParts.push(`Event: ${eventDate}`)
    add.mutate({
      source_type: 'custom',
      name: name.trim(),
      category_id: pickedCatId || undefined,
      estimated: cost ? Number(cost) : 0,
      notes: noteParts.join(' · ') || undefined,
    })
  }

  const MY_STATES = [
    'Johor','Kedah','Kelantan','Melaka','Negeri Sembilan','Pahang','Perak','Perlis',
    'Pulau Pinang','Sabah','Sarawak','Selangor','Terengganu',
    'Kuala Lumpur','Labuan','Putrajaya',
  ]

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(78, 18, 24, 0.35)', backdropFilter: 'blur(2px)' }}
        onClick={close}
      />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 overflow-y-auto"
        style={{ boxShadow: '-20px 0 60px -20px rgba(78, 18, 24, 0.25)' }}
      >
        <form onSubmit={submit} className="p-8">
          <button type="button" onClick={close} className="mb-6 inline-flex items-center gap-1 text-sm hover:opacity-70 cursor-pointer" style={{ color: '#4E1218' }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="font-display font-medium" style={{ fontSize: 30, color: '#4E1218', letterSpacing: '-0.01em' }}>
            Add a vendor
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#8A6A6E' }}>
            Add custom booked vendor details to link with this category.
          </p>

          <div className="mt-6 space-y-5">
            <Field label="Vendor / Business name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Majestic Hotel"
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: '#F5F5F5', color: '#4E1218' }}
              />
            </Field>

            <Field label="Category link">
              <div className="relative">
                <select
                  value={pickedCatId}
                  onChange={(e) => setPickedCatId(e.target.value)}
                  className="w-full appearance-none rounded-xl py-2.5 pl-4 pr-12 text-sm outline-none"
                  style={{ backgroundColor: '#F5F5F5', color: '#4E1218' }}
                >
                  {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B1F2A]" />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="City">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                  style={{ backgroundColor: '#F5F5F5', color: '#4E1218' }}
                />
              </Field>
              <Field label="State">
                <div className="relative">
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full appearance-none rounded-xl py-2.5 pl-4 pr-11 text-sm outline-none"
                    style={{ backgroundColor: '#F5F5F5', color: '#4E1218' }}
                  >
                    <option value="">Select</option>
                    {MY_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B1F2A]" />
                </div>
              </Field>
            </div>

            <Field label="Email (optional)">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: '#F5F5F5', color: '#4E1218' }}
              />
            </Field>

            <Field label="Event date (optional)">
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: '#F5F5F5', color: '#4E1218' }}
              />
            </Field>

            <Field label="Cost estimate (RM, optional)">
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: '#F5F5F5', color: '#4E1218' }}
              />
            </Field>
          </div>
        </form>

        <div className="sticky bottom-0 flex items-center justify-end px-8 py-4 bg-white/90 backdrop-blur-md border-t border-burgundy-200/10">
          <button
            type="button"
            onClick={submit}
            disabled={add.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7B1F2A] px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4E1218] hover:shadow-[0_8px_18px_-10px_rgba(78,18,24,0.7)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {add.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </motion.aside>
    </>
  )
}

/* ─────────────────────────── ADD CATEGORY DRAWER ─────────── */

function AddCategoryDrawer({ close }) {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [estimated, setEstimated] = useState('')

  const add = useMutation({
    mutationFn: catApi.createBudgetCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget'] })
      toast.success('Category added')
      close()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not add category'),
  })

  function submit(e) {
    e?.preventDefault?.()
    if (!name.trim()) { toast.error('Category name required'); return }
    add.mutate({
      name: name.trim(),
      estimated: estimated ? Number(estimated) : 0,
      icon: 'sparkles',
      color: '#C08E3F',
    })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(78, 18, 24, 0.35)', backdropFilter: 'blur(2px)' }}
        onClick={close}
      />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 overflow-y-auto"
        style={{ boxShadow: '-20px 0 60px -20px rgba(78, 18, 24, 0.25)' }}
      >
        <form onSubmit={submit} className="p-8">
          <button type="button" onClick={close} className="mb-6 inline-flex items-center gap-1 text-sm hover:opacity-70 cursor-pointer" style={{ color: '#4E1218' }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="font-display font-medium" style={{ fontSize: 30, color: '#4E1218', letterSpacing: '-0.01em' }}>
            Add a category
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#8A6A6E' }}>
            Track spending for a category not in your Goldie-generated plan.
          </p>

          <div className="mt-6 space-y-5">
            <Field label="Category name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Honeymoon"
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: '#F5F5F5', color: '#4E1218' }}
              />
            </Field>
            <Field label="Estimated cost (RM)">
              <input
                type="number"
                value={estimated}
                onChange={(e) => setEstimated(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: '#F5F5F5', color: '#4E1218' }}
              />
            </Field>
          </div>

        <div className="sticky bottom-0 flex items-center justify-end px-8 py-4 bg-white/90 backdrop-blur-md border-t border-burgundy-200/10">
          <button
            type="button"
            onClick={submit}
            disabled={add.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7B1F2A] px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4E1218] hover:shadow-[0_8px_18px_-10px_rgba(78,18,24,0.7)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {add.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
        </form>
      </motion.aside>
    </>
  )
}


function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1.5" style={{ color: '#4E1218' }}>{label}</span>
      {children}
    </label>
  )
}

function readableBudgetNote(notes) {
  if (!notes) return ''
  try {
    const parsed = JSON.parse(notes)
    return [parsed.location, parsed.services].filter(Boolean).join(' · ')
  } catch {
    return notes
  }
}

/* ─────────────────────────── PERSISTENT CHAT PANEL ─────────── */

function AppliedChip({ action }) {
  const type = action.type ?? ''

  if (type === 'find_and_add_vendor' && action.vendor_name) {
    const priceStr = action.vendor_price ? `RM ${Number(action.vendor_price).toLocaleString()}` : null
    const location = [action.vendor_area, action.vendor_state].filter(Boolean).join(', ')
    return (
      <div
        className="flex items-start gap-2 px-3 py-2 rounded-lg text-[11px] border"
        style={{
          backgroundColor: 'rgba(243, 232, 218, 0.55)',
          borderColor: 'rgba(192, 142, 63, 0.35)',
          color: '#4E1218',
        }}
      >
        <span className="mt-0.5 text-[#7B1F2A] font-bold">✓</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#7B1F2A]">
            Added <span style={{ color: '#7B1F2A' }}>{action.vendor_name}</span>
            {action.category_name && (
              <span style={{ color: '#7B1F2A' }}> · {action.category_name}</span>
            )}
          </p>
          {(location || priceStr) && (
            <p className="mt-0.5 text-[#6B3E44]">
              {location}{location && priceStr ? ' · ' : ''}{priceStr}
            </p>
          )}
        </div>
      </div>
    )
  }

  const label =
    type === 'set_total_budget' ? `Set total budget to RM ${Number(action.amount ?? 0).toLocaleString()}` :
    type === 'add_category'     ? `Added category: ${action.name}` :
    type === 'update_category'  ? `Updated estimate to RM ${Number(action.estimated ?? 0).toLocaleString()}` :
    type === 'delete_category'  ? 'Removed a category' :
    type.replace(/_/g, ' ')

  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-[10px] self-start"
      style={{ backgroundColor: 'rgba(192, 142, 63, 0.2)', color: '#C08E3F' }}
    >
      ✓ {label}
    </span>
  )
}

function VendorSuggestion({ suggestion }) {
  const qc = useQueryClient()
  const [added, setAdded] = useState(false)
  const add = useMutation({
    mutationFn: itemApi.addBudgetItem,
    onSuccess: () => {
      setAdded(true)
      qc.invalidateQueries({ queryKey: ['budget'] })
      toast.success(`${suggestion.name} added to your budget`)
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not add this vendor'),
  })

  const price = suggestion.price_from
    ? `RM ${Number(suggestion.price_from).toLocaleString()}${suggestion.price_to ? ` – RM ${Number(suggestion.price_to).toLocaleString()}` : ''}`
    : 'Price on request'

  function addSuggestion() {
    add.mutate({
      source_type: suggestion.source_type,
      source_id: suggestion.source_id || undefined,
      category_id: suggestion.category_id || undefined,
      category_name: suggestion.category_name,
      name: suggestion.name,
      estimated: Number(suggestion.price_from || 0),
      notes: suggestion.is_registered ? undefined : JSON.stringify({
        location: suggestion.location,
        services: suggestion.category_name,
        price_range: price,
        rating: 'No ratings yet',
        link: suggestion.link,
      }),
    })
  }

  return (
    <div className="rounded-xl bg-white px-3 py-3 text-[#4E1218] border border-[#D8C3B3]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[12px] leading-snug">{suggestion.name}</p>
          <p className="mt-1 text-[11px] text-[#6B3E44]">{suggestion.location || 'Malaysia'} · {price}</p>
          <p className="mt-1 text-[10px] text-[#7B1F2A]/70">
            {suggestion.is_registered
              ? `Verified directory listing${suggestion.match_score ? ` · ${suggestion.match_score}% match` : ''}`
              : 'External suggestion — verify before booking'}
          </p>
        </div>
        {suggestion.link && (
          suggestion.link.startsWith('/')
            ? <Link to={suggestion.link} className="shrink-0 text-[10px] font-semibold underline text-[#7B1F2A]">View</Link>
            : <a href={suggestion.link} target="_blank" rel="noreferrer" className="shrink-0 text-[10px] font-semibold underline text-[#7B1F2A]">View</a>
        )}
      </div>
      <button
        type="button"
        onClick={addSuggestion}
        disabled={added || add.isPending}
        className="mt-3 w-full rounded-full bg-[#7B1F2A] px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#4E1218] disabled:cursor-default disabled:bg-[#D9C8C3] disabled:text-[#6B3E44]"
      >
        {added ? 'Added to budget' : add.isPending ? 'Adding…' : 'Add to budget'}
      </button>
    </div>
  )
}

function BudgetProposal({ proposal }) {
  const qc = useQueryClient()
  const [status, setStatus] = useState('pending')
  const [amount, setAmount] = useState(proposal.amount ?? '')
  const apply = useMutation({
    mutationFn: applyBudgetProposal,
    onSuccess: () => {
      setStatus('accepted')
      qc.invalidateQueries({ queryKey: ['budget'] })
      toast.success('Budget updated')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not apply this suggestion'),
  })

  if (status === 'rejected') {
    return <p className="rounded-lg bg-white/55 px-3 py-2 text-[11px] text-[#8A6A6E]">Suggestion dismissed</p>
  }

  return (
    <div className="rounded-xl bg-white px-3 py-3 text-[#4E1218] border border-[#D8C3B3]">
      <p className="text-[12px] font-semibold">{proposal.label}</p>
      {proposal.reason && <p className="mt-1 text-[11px] leading-relaxed text-[#6B3E44]">{proposal.reason}</p>}
      {proposal.preference != null && <p className="mt-1 text-[11px] text-[#7B1F2A]">{String(proposal.preference)}</p>}
      {proposal.amount != null && status !== 'accepted' && (
        <label className="mt-3 flex items-center gap-2 rounded-lg bg-[#FAEDE6] px-3 py-2">
          <span className="text-[11px] font-semibold">RM</span>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[12px] font-semibold outline-none"
            aria-label="Proposed amount"
          />
        </label>
      )}
      {status === 'accepted' ? (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#7B1F2A]"><Check className="h-3.5 w-3.5" /> Applied</p>
      ) : (
        <div className="mt-3 flex items-center justify-end gap-3">
          <button type="button" onClick={() => setStatus('rejected')} className="text-[11px] font-semibold text-[#6B3E44] hover:text-[#4E1218]">Reject</button>
          <button
            type="button"
            onClick={() => apply.mutate({ token: proposal.token, amount: proposal.amount != null ? Number(amount) : undefined })}
            disabled={apply.isPending}
            className="rounded-full bg-[#7B1F2A] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#4E1218] disabled:opacity-60"
          >
            {apply.isPending ? 'Applying…' : 'Accept'}
          </button>
        </div>
      )}
    </div>
  )
}

function renderChatMessage(content) {
  if (typeof content !== 'string') return content;
  content = content
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[View Info\]\(\s*\)/gi, 'Link unavailable')
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|#[^\s)]+|\/[^\s)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      parts.push(content.substring(lastIndex, matchIndex));
    }
    const linkText = match[1];
    const linkUrl = match[2];

    if (linkUrl.startsWith('http')) {
      parts.push(
        <a
          key={matchIndex}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-400 hover:text-gold-300 underline font-semibold cursor-pointer"
        >
          {linkText}
        </a>
      );
    } else {
      parts.push(
        <Link
          key={matchIndex}
          to={linkUrl}
          className="text-gold-400 hover:text-gold-300 underline font-semibold cursor-pointer"
        >
          {linkText}
        </Link>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}

function ChatPanel({ user, hasCategories, totalBudget, onClose }) {
  const qc = useQueryClient()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const scrollerRef = useRef(null)

  // AI Configuration State
  const [showSettings, setShowSettings] = useState(false)
  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem('goldie_ai_provider') || 'gemini')
  const [aiKey, setAiKey] = useState(() => localStorage.getItem('goldie_ai_key') || '')

  // Temp form states
  const [tempProvider, setTempProvider] = useState(aiProvider)
  const [tempKey, setTempKey] = useState(aiKey)

  // Sync temp states when settings opens
  useEffect(() => {
    if (showSettings) {
      setTempProvider(aiProvider)
      setTempKey(aiKey)
    }
  }, [showSettings, aiProvider, aiKey])

  function saveSettings(provider, key) {
    setAiProvider(provider)
    setAiKey(key)
    localStorage.setItem('goldie_ai_provider', provider)
    localStorage.setItem('goldie_ai_key', key.trim())
    toast.success('AI settings updated!')
    setShowSettings(false)
  }

  // Active provider label for UI display
  const activeProviderLabel = aiKey
    ? `${aiProvider === 'gemini-pro' ? 'Gemini Pro' : aiProvider === 'gemini-flash' ? 'Gemini Flash' : aiProvider.toUpperCase()} (Custom)`
    : 'Groq (System)'

  // Load messages once user is available
  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`goldie_chat_messages_${user.id}`)
        if (saved) {
          setMessages(JSON.parse(saved))
        } else {
          const first = user?.name?.split(' ')[0] ?? ''
          const intro = hasCategories
            ? `Hi ${first} — I can find verified vendors that match your state and budget. You choose which one to add.`
            : `Hi ${first} — tell me your total budget and I'll build a culture-aware plan tuned to your ${user?.culture ?? 'wedding'}. I can also suggest verified vendors for you to choose from.`
          setMessages([{ role: 'assistant', content: intro }])
        }
      } catch (e) {
        // Fallback
      }
    }
  }, [user?.id, hasCategories])

  // Save messages to local storage whenever they change
  useEffect(() => {
    if (user?.id && messages.length > 0) {
      localStorage.setItem(`goldie_chat_messages_${user.id}`, JSON.stringify(messages))
    }
  }, [messages, user?.id])

  useEffect(() => { scrollerRef.current?.scrollTo({ top: 999999, behavior: 'smooth' }) }, [messages])

  const chat = useMutation({
    mutationFn: sendBudgetChat,
    onSuccess: (res) => {
      setMessages((m) => [...m, { role: 'assistant', content: res.reply, applied: res.applied, proposals: res.proposals, suggestions: res.suggestions }])
      if (res.applied?.length > 0) qc.invalidateQueries({ queryKey: ['budget'] })
    },
    onError: (err) => setMessages((m) => [...m, { role: 'assistant', content: '⚠️ ' + (err.response?.data?.message ?? 'Sorry, I could not respond.') }]),
  })

  function send(e) {
    e?.preventDefault?.()
    const text = input.trim()
    if (!text) return
    const history = messages.filter((m) => m.role !== 'system').slice(-8)
    setMessages((m) => [...m, { role: 'user', content: text }])
    setInput('')
    chat.mutate({ message: text, history: history.map((h) => ({ role: h.role, content: h.content })) })
  }

  const quickPrompts = hasCategories
    ? [
        'Find a photographer in my state',
        'Suggest florists under RM 3,000',
        'Move RM 2k from Photography to Florist',
      ]
    : [
        `Build my budget — RM ${totalBudget || 30000} for a ${user?.culture ?? 'Malay'} wedding`,
        'Find a photographer in Selangor',
      ]

  return (
    <div className="h-full flex flex-col bg-[#7B1F2A] border-l border-[#4E1218] text-white shadow-2xl">
      <div className="p-5 flex items-center gap-3 border-b border-white/10 bg-[#4E1218]">
        <span className="w-10 h-10 rounded-full grid place-items-center bg-[#C08E3F] border border-white/20 text-white">
          <MessageCircle className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-display leading-tight text-lg">Ask Goldie</p>
          <p className="text-[11px] uppercase tracking-[0.24em] opacity-80 truncate leading-5">{activeProviderLabel} · {user?.culture ?? 'set your culture'}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-full transition cursor-pointer ${showSettings ? 'bg-white/15 text-gold-300' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
          title="AI Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 cursor-pointer text-white/80 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dynamic Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-[#E8C7BD] bg-[#FAEDE6] px-5 py-5 text-[#4E1218]"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold leading-tight">AI settings</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-[#6B3E44]">Choose a provider and use your own API key.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear your conversation with Goldie?')) {
                    localStorage.removeItem(`goldie_chat_messages_${user?.id}`)
                    const first = user?.name?.split(' ')[0] ?? ''
                    const intro = hasCategories
                      ? `Hi ${first} — I can find verified vendors that match your state and budget. You choose which one to add.`
                      : `Hi ${first} — tell me your total budget and I'll build a culture-aware plan tuned to your ${user?.culture ?? 'wedding'}. I can also suggest verified vendors for you to choose from.`
                    setMessages([{ role: 'assistant', content: intro }])
                    toast.success('Chat history cleared')
                  }
                }}
                className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-[#7B1F2A] underline decoration-[#C08E3F] underline-offset-4 transition-colors hover:text-[#4E1218]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear chat
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[12px] font-semibold">Provider</label>
                <div className="flex rounded-xl bg-white p-1">
                {['gemini', 'groq', 'openai'].map((p) => {
                  const active = tempProvider === p || (p === 'gemini' && tempProvider.startsWith('gemini'))
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTempProvider(p === 'gemini' ? 'gemini-pro' : p)}
                      className={`flex-1 rounded-lg px-2 py-2 text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#7B1F2A] text-white'
                          : 'text-[#6B3E44] hover:bg-[#FAEDE6] hover:text-[#4E1218]'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
              </div>
 
            {tempProvider.startsWith('gemini') && (
              <div>
                <label className="mb-2 block text-[12px] font-semibold">Model</label>
                <div className="flex gap-5 border-b border-[#DDBEB4]">
                  {[
                    { id: 'gemini-pro', label: 'Pro' },
                    { id: 'gemini-flash', label: 'Flash' }
                  ].map((t) => {
                    const active = tempProvider === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTempProvider(t.id)}
                        className={`relative -mb-px pb-2 text-[11px] font-semibold transition-colors cursor-pointer ${
                          active
                            ? 'border-b-2 border-[#7B1F2A] text-[#7B1F2A]'
                            : 'border-b-2 border-transparent text-[#8A6A6E] hover:text-[#4E1218]'
                        }`}
                      >
                        {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-[12px] font-semibold">API key</label>
                {tempProvider.startsWith('gemini') && (
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-semibold text-[#7B1F2A] hover:underline"
                  >
                    Get a key ↗
                  </a>
                )}
                {tempProvider === 'groq' && (
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-semibold text-[#7B1F2A] hover:underline"
                  >
                    Get a key ↗
                  </a>
                )}
                {tempProvider === 'openai' && (
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-semibold text-[#7B1F2A] hover:underline"
                  >
                    Get OpenAI Key ↗
                  </a>
                )}
              </div>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder={
                  tempProvider.startsWith('gemini')
                    ? "AIzaSy..."
                    : tempProvider === 'groq'
                    ? "gsk_..."
                    : "sk-..."
                }
                className="mt-2 w-full rounded-xl border border-[#DDBEB4] bg-white px-3.5 py-2.5 text-[12px] text-[#4E1218] outline-none transition-colors placeholder:text-[#9B7C80] focus:border-[#7B1F2A]"
              />
              <p className="mt-2 flex items-center gap-1.5 text-[10px] leading-relaxed text-[#6B3E44]">
                {tempKey && <Check className="h-3 w-3 text-[#7B1F2A]" />}
                {tempKey ? 'Stored only in this browser.' : 'Leave blank to use the system provider.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-4 border-t border-[#DDBEB4] pt-4">
              <button
                type="button"
                onClick={() => {
                  setTempKey('');
                  saveSettings(tempProvider, '');
                }}
                className="text-[11px] font-semibold text-[#6B3E44] transition-colors hover:text-[#4E1218] cursor-pointer"
              >
                Remove key
              </button>
              <button
                type="button"
                onClick={() => saveSettings(tempProvider, tempKey)}
                className="rounded-full bg-[#C08E3F] px-6 py-2 text-[11px] font-semibold text-[#4E1218] transition-colors hover:bg-[#A07229] hover:text-white cursor-pointer"
              >
                Save settings
              </button>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#7B1F2A]"
        onWheel={(e) => {
          const el = scrollerRef.current
          if (!el) return
          const atTop = el.scrollTop === 0
          const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
          if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
            e.stopPropagation()
          }
        }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] rounded-[20px] px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-sm ${m.role === 'user' ? 'bg-white text-[#4E1218] border border-[#E8D9CA]' : 'bg-[#FAEDE6] text-[#4E1218] border border-[#F2E4DC]'}` }
            >
              {renderChatMessage(m.content)}
              {m.applied?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#D8C3B3] flex flex-col gap-2">
                  {m.applied.map((a, j) => <AppliedChip key={j} action={a} />)}
                </div>
              )}
              {m.suggestions?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#D8C3B3] flex flex-col gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B1F2A]">Choose what to add</p>
                  {m.suggestions.map((suggestion) => (
                    <VendorSuggestion key={suggestion.key} suggestion={suggestion} />
                  ))}
                </div>
              )}
              {m.proposals?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#D8C3B3] flex flex-col gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B1F2A]">Review suggested changes</p>
                  {m.proposals.map((proposal) => (
                    <BudgetProposal key={proposal.token} proposal={proposal} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {chat.isPending && (
          <div className="flex gap-1 items-center opacity-70 text-xs pl-2">
            <span className="w-2 h-2 rounded-full bg-blush-100 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-blush-100 animate-pulse" style={{ animationDelay: '0.15s' }} />
            <span className="w-2 h-2 rounded-full bg-blush-100 animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-2.5 flex flex-wrap gap-2">
          {quickPrompts.map((q) => (
            <button
              key={q}
              onClick={() => { setInput(q); setTimeout(() => send(), 0) }}
              className="px-3 py-1 rounded-full text-[10px] transition cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/10"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={send} className="p-4 border-t border-white/10 bg-[#4E1218] flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Goldie…"
          className="flex-1 px-4 py-3 rounded-full text-sm outline-none bg-white text-[#4E1218] placeholder:text-[#7B1F2A]"
        />
        <button
          type="submit"
          disabled={chat.isPending || !input.trim()}
          className="w-11 h-11 rounded-full grid place-items-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-white text-[#7B1F2A] shadow-lg transition hover:bg-[#F5E6D6]"
        >
          <Send className="w-5 h-5 text-[#7B1F2A]" />
        </button>
      </form>
    </div>
  )
}

/* Mobile version wraps ChatPanel in a slide-in drawer. */
function MobileChatDrawer({ user, hasCategories, totalBudget, close }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(78, 18, 24, 0.35)', backdropFilter: 'blur(2px)' }}
        onClick={close}
      />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        className="fixed right-0 top-0 h-full w-full max-w-md z-50"
      >
        <ChatPanel user={user} hasCategories={hasCategories} totalBudget={totalBudget} onClose={close} />
      </motion.aside>
    </>
  )
}

/* ─────────────────────────── VENDOR COMPARISON MODAL ────────── */
function ComparisonModal({ cat, close }) {
  const qc = useQueryClient()
  const items = cat.items ?? []

  const handleKeepOnly = async (keepItem) => {
    const others = items.filter((x) => x.id !== keepItem.id)
    if (others.length === 0) {
      toast.success('This is already the only option!')
      return
    }

    try {
      await Promise.all(others.map((x) => itemApi.deleteBudgetItem(x.id)))
      qc.invalidateQueries({ queryKey: ['budget'] })
      toast.success(`Kept ${keepItem.name} and removed other options.`)
      close()
    } catch (e) {
      toast.error('Could not clean up other options')
    }
  }

  const handleDeleteItem = async (id) => {
    try {
      await itemApi.deleteBudgetItem(id)
      qc.invalidateQueries({ queryKey: ['budget'] })
      toast.success('Removed option')
    } catch (e) {
      toast.error('Could not remove option')
    }
  }

  const getVendorDetails = (it) => {
    if (it.source_type === 'vendor' && it.vendor) {
      const v = it.vendor
      return {
        name: v.name,
        location: [v.area, v.state].filter(Boolean).join(', '),
        services: v.category?.name ?? 'Wedding Service',
        price: v.price_from ? `RM ${v.price_from.toLocaleString()}` + (v.price_to ? ` - RM ${v.price_to.toLocaleString()}` : '') : 'Price on request',
        rating: v.rating ? `★ ${Number(v.rating).toFixed(1)}` : 'No ratings yet',
        link: `/vendor/${v.slug}`,
        isRegistered: true,
      }
    }

    let notesObj = {}
    try {
      notesObj = JSON.parse(it.notes ?? '{}')
    } catch (e) {
      notesObj = {}
    }

    return {
      name: it.name,
      location: notesObj.location ?? 'Malaysia',
      services: notesObj.services ?? 'Wedding Service',
      price: notesObj.price_range ?? (it.estimated ? `RM ${it.estimated.toLocaleString()}` : 'Price on request'),
      rating: notesObj.rating ?? 'No ratings yet',
      link: notesObj.link ?? `https://www.google.com/search?q=${encodeURIComponent(it.name)}`,
      isRegistered: false,
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-burgundy-950/40 backdrop-blur-sm"
        onClick={close}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed z-60 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-2xl rounded-[32px] border border-burgundy-900/10 shadow-[0_30px_70px_rgba(78,18,24,0.18)] max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto"
      >
        <button onClick={close} className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 transition cursor-pointer text-burgundy-900">
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display font-medium text-3xl text-burgundy-900 mb-2">Compare Draft Vendors</h2>
        <p className="text-xs text-burgundy-700 uppercase tracking-wider mb-6">Category: <span className="font-bold text-burgundy-900">{cat.name}</span></p>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-burgundy-700">No draft vendors found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((it) => {
              const details = getVendorDetails(it)
              return (
                <div key={it.id} className="bg-white border border-burgundy-900/10 rounded-[20px] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${details.isRegistered ? 'bg-gold-500/10 text-gold-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {details.isRegistered ? 'Verified Partner' : 'Draft Option'}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-display font-semibold text-lg text-burgundy-950 leading-tight pr-12">{details.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-burgundy-700 mt-2 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-burgundy-700 shrink-0" />
                      <span>{details.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-burgundy-650 mt-1">
                      <Briefcase className="w-3.5 h-3.5 text-burgundy-700 shrink-0" />
                      <span>{details.services}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-burgundy-100/50">
                      <p className="text-xs text-burgundy-750">Estimated Price:</p>
                      <p className="text-sm font-semibold text-burgundy-900 mt-0.5">{details.price}</p>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-burgundy-750">Reviews & Ratings:</p>
                      <p className="text-xs text-burgundy-900 font-semibold mt-0.5">{details.rating}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    {details.link.startsWith('http') ? (
                      <a
                        href={details.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost flex-1 justify-center text-xs py-2.5"
                      >
                        View Details
                      </a>
                    ) : (
                      <Link
                        to={details.link}
                        className="btn-ghost flex-1 justify-center text-xs py-2.5"
                      >
                        View Profile
                      </Link>
                    )}
                    <button
                      onClick={() => handleDeleteItem(it.id)}
                      className="p-2.5 border border-burgundy-200/50 hover:bg-neutral-50 text-burgundy-900 rounded-full transition cursor-pointer"
                      title="Delete option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    </>
  )
}

function TopMatchesModal({ data, close }) {
  const qc = useQueryClient()
  const isVenue = data.searchLink === '/venues'

  const { data: matchData, isLoading } = useQuery({
    queryKey: ['top-matches', data.catId],
    queryFn: async () => {
      return (await api.get('/budget/top-matches', { params: { category_id: data.catId } })).data
    },
    enabled: !!data
  })
  const vendors = matchData?.matches ?? []
  const profile = matchData?.profile

  const add = useMutation({
    mutationFn: itemApi.addBudgetItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget'] })
      toast.success('Added to budget!')
      close()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not add vendor')
  })

  const titleCat = data.catName.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white rounded-[24px] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-burgundy-200/20"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-burgundy-200/20 shrink-0 bg-[#FAF8F5]">
          <div>
            <h2 className="font-display text-2xl text-[#4E1218]">Best {titleCat} matches</h2>
            {profile && (
              <p className="mt-1 text-xs text-[#6B3E44]">
                {profile.culture} · {profile.guest_count || 'Guest total not set'} guests · {profile.location || 'Location not set'} · RM {Number(profile.budget).toLocaleString()}
              </p>
            )}
          </div>
          <button onClick={close} className="p-2 text-neutral-400 hover:text-[#4E1218] transition rounded-full hover:bg-neutral-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-[#FAF8F5]">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-[#E8C7BD] border-t-[#7B1F2A] animate-spin" />
            </div>
          ) : !vendors || vendors.length === 0 ? (
            <div className="py-12 text-center text-[#8A6A6E]">
              <p>No matches fit your culture, guest total, location, and budget yet.</p>
              <Link to={data.searchLink} onClick={close} className="text-[#C08E3F] font-semibold underline mt-3 block hover:text-[#4E1218] transition">
                Explore all {titleCat}s
              </Link>
            </div>
          ) : (
            vendors.map((v) => (
              <div key={v.id} className="group flex flex-col gap-4 rounded-[20px] border border-neutral-200 bg-white p-4 transition hover:border-[#C08E3F]/40 hover:shadow-lg sm:flex-row sm:items-center sm:gap-5">
                <img
                  src={v.photos?.[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=200&q=80'}
                  alt={v.name}
                  className="h-44 w-full shrink-0 rounded-[16px] bg-neutral-100 object-cover sm:h-32 sm:w-32"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      to={isVenue ? `/venues/${v.slug}` : `/vendor/${v.slug}`}
                      onClick={close}
                      className="text-lg font-semibold text-[#4E1218] hover:text-[#7B1F2A] transition truncate inline-flex items-center gap-1.5"
                    >
                      {v.name}
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-[#C08E3F] font-medium">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{Number(v.rating).toFixed(1)}</span>
                    <span className="text-neutral-400 font-normal">({(v.id % 20) + 5})</span>
                  </div>
                  <div className="mt-2 text-sm text-neutral-500 truncate flex items-center gap-1.5">
                    {v.area}, {v.state}
                  </div>
                  <div className="mt-2 text-sm font-medium text-[#4E1218]">
                    Starts at RM {Number(v.price_from).toLocaleString()}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[#FAEDE6] px-2 py-1 text-[10px] font-semibold text-[#7B1F2A]">{v.match_score}% match</span>
                    {(v.match_reasons ?? []).slice(0, 2).map((reason) => (
                      <span key={reason} className="rounded-full bg-[#F4F0EE] px-2 py-1 text-[10px] text-[#6B3E44]">{reason}</span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                  <Link
                    to={isVenue ? `/venues/${v.slug}` : `/vendor/${v.slug}`}
                    onClick={close}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#7B1F2A]/25 bg-white px-4 py-2 text-xs font-semibold text-[#7B1F2A] transition hover:border-[#7B1F2A] hover:bg-[#FAEDE6]"
                  >
                    View profile
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      add.mutate({
                        source_type: isVenue ? 'venue' : 'vendor',
                        source_id: v.id,
                        category_id: data.catId
                      })
                    }}
                    disabled={add.isPending}
                    className="flex-1 rounded-full bg-[#7B1F2A] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#4E1218] disabled:opacity-50"
                    title="Add to budget"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
