import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Check, Wand2, Sparkles, ChevronDown, ChevronUp, Clock, Trash2, X,
  Building2, Shirt, Heart, Calendar, Layers, ArrowRight, ListTodo, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Reveal } from '../../components/Reveal.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import * as api from '../../api/checklist.js'
import { generateChecklist } from '../../api/ai.js'
import { DashboardSidebar } from '../../components/DashboardSidebar.jsx'
import { WeddingDatePicker } from '../../components/WeddingDatePicker.jsx'

function getCategoryIcon(secName) {
  const name = (secName || '').toLowerCase()
  if (name.includes('venue') || name.includes('vendor') || name.includes('place')) return Building2
  if (name.includes('attire') || name.includes('gown') || name.includes('saree') || name.includes('jewel')) return Shirt
  if (name.includes('ceremony') || name.includes('nikah') || name.includes('reception') || name.includes('wedding')) return Heart
  if (name.includes('mehndi') || name.includes('beauty') || name.includes('makeup') || name.includes('sangeet')) return Sparkles
  if (name.includes('plan') || name.includes('initial') || name.includes('budget')) return Calendar
  return ListTodo
}

export default function Checklist() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { data: items = [], isLoading } = useQuery({ queryKey: ['checklist'], queryFn: api.fetchChecklist })
  const [text, setText] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [selectedSec, setSelectedSec] = useState('')
  const [customSec, setCustomSec] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [groupBy, setGroupBy] = useState('section') // 'section' | 'timeline'

  const [activeModalSec, setActiveModalSec] = useState(null)
  const [addTaskDrawerOpen, setAddTaskDrawerOpen] = useState(false)
  const [confirmRegenerateOpen, setConfirmRegenerateOpen] = useState(false)
  const [modalTaskTitle, setModalTaskTitle] = useState('')
  const [modalDueDate, setModalDueDate] = useState('')

  useEffect(() => {
    if (activeModalSec || addTaskDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeModalSec, addTaskDrawerOpen])

  const add = useMutation({
    mutationFn: api.createTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist'] })
      setText('')
      setTaskTitle('')
      setSelectedSec('')
      setCustomSec('')
      setDueDate('')
      setModalTaskTitle('')
      setModalDueDate('')
      setAddTaskDrawerOpen(false)
      toast.success('Task added successfully')
    },
    onError: () => toast.error('Could not add task'),
  })

  const update = useMutation({
    mutationFn: ({ id, ...patch }) => api.updateTask(id, patch),
    onMutate: async ({ id, ...patch }) => {
      await qc.cancelQueries({ queryKey: ['checklist'] })
      const previousItems = qc.getQueryData(['checklist'])

      qc.setQueryData(['checklist'], (old = []) =>
        old.map((item) => (item.id === id ? { ...item, ...patch } : item))
      )

      return { previousItems }
    },
    onError: (err, newTodo, context) => {
      if (context?.previousItems) {
        qc.setQueryData(['checklist'], context.previousItems)
      }
      const status = err.response?.status
      const serverMessage = err.response?.data?.message || err.response?.data || err.response?.statusText
      const message = serverMessage
        ? `${status || ''} ${serverMessage}`.trim()
        : err.message || 'Could not update task'
      console.error('Checklist update failed', err)
      toast.error(message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['checklist'] })
    },
  })

  const bulkUpdateDates = useMutation({
    mutationFn: async ({ items, date }) => {
      const promises = items.map((it) => api.updateTask(it.id, { due_date: date }))
      return Promise.all(promises)
    },
    onMutate: async ({ items, date }) => {
      await qc.cancelQueries({ queryKey: ['checklist'] })
      const previousItems = qc.getQueryData(['checklist'])

      const idsToUpdate = new Set(items.map((it) => it.id))
      qc.setQueryData(['checklist'], (old = []) =>
        old.map((item) => (idsToUpdate.has(item.id) ? { ...item, due_date: date } : item))
      )

      return { previousItems }
    },
    onError: (err, newTodo, context) => {
      if (context?.previousItems) {
        qc.setQueryData(['checklist'], context.previousItems)
      }
      toast.error('Failed to update phase due dates')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['checklist'] })
      toast.success('Applied due date to all phase tasks!')
    },
  })

  const remove = useMutation({
    mutationFn: api.deleteTask,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['checklist'] })
      const previousItems = qc.getQueryData(['checklist'])

      qc.setQueryData(['checklist'], (old = []) =>
        old.filter((item) => item.id !== id)
      )

      return { previousItems }
    },
    onError: (err, id, context) => {
      if (context?.previousItems) {
        qc.setQueryData(['checklist'], context.previousItems)
      }
      toast.error('Could not delete task')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['checklist'] })
    },
  })

  const generate = useMutation({
    mutationFn: generateChecklist,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['checklist'] })
      toast.success(`AI generated ${res.generated_count} items across ${res.sections.length} sections`)
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'AI failed'),
  })

  const todayDate = useMemo(() => {
    const d = new Date()
    d.setHours(0,0,0,0)
    return d
  }, [])

  const grouped = useMemo(() => {
    const map = {}
    const today = new Date()
    today.setHours(0,0,0,0)
    const next30Days = new Date()
    next30Days.setDate(today.getDate() + 30)
    next30Days.setHours(23,59,59,999)

    if (groupBy === 'timeline') {
      map['Overdue'] = []
      map['Next 30 Days'] = []
      map['Later'] = []
      map['Completed'] = []

      for (const it of items) {
        if (it.is_completed) {
          map['Completed'].push(it)
        } else if (it.due_date) {
          const d = new Date(it.due_date)
          if (d < today) {
            map['Overdue'].push(it)
          } else if (d <= next30Days) {
            map['Next 30 Days'].push(it)
          } else {
            map['Later'].push(it)
          }
        } else {
          map['Later'].push(it)
        }
      }

      if (map['Overdue'].length === 0) delete map['Overdue']
      if (map['Next 30 Days'].length === 0) delete map['Next 30 Days']
      if (map['Later'].length === 0) delete map['Later']
      if (map['Completed'].length === 0) delete map['Completed']

      return map
    }

    for (const it of items) {
      const key = it.section ?? 'General Planning'
      map[key] = map[key] ?? []
      map[key].push(it)
    }
    return map
  }, [items, groupBy])

  const availableSections = useMemo(() => {
    const set = new Set(items.map((x) => x.section).filter(Boolean))
    return Array.from(set)
  }, [items])

  const sections = Object.keys(grouped)
  const done = items.filter((x) => x.is_completed).length
  const pct = items.length ? Math.round((done / items.length) * 100) : 0

  function handleAddTaskSubmit(e) {
    e.preventDefault()
    if (!taskTitle.trim()) return
    add.mutate({
      title: taskTitle.trim(),
      section: selectedSec === '__new__' ? customSec.trim() : selectedSec || 'General Planning',
      due_date: dueDate || null
    })
  }

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#2C2A29]">
      <DashboardSidebar active="checklist" />

      <main className="transition-all duration-300 pl-4 pr-4 md:pl-24 md:pr-12 pt-28 pb-16 max-w-7xl mx-auto">
        {/* Top Header */}
        <Reveal>
          <div className="flex flex-col gap-6 mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h1 className="font-display text-4xl text-[#4E1218] font-bold tracking-tight">Smart Checklist</h1>
                <p className="text-sm text-neutral-600 max-w-2xl">
                  {user?.culture
                    ? <>Tailored to your <span className="font-semibold text-[#7B1F2A]">{user.culture}</span> wedding tradition.</>
                    : <Link to="/dashboard" className="text-[#7B1F2A] underline font-medium">Set your culture in profile</Link>}
                </p>
              </div>
            </div>

            {items.length > 0 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setGroupBy('section')}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                      groupBy === 'section'
                        ? 'bg-[#7B1F2A] text-white shadow-sm'
                        : 'bg-white border border-neutral-300 text-[#4E1218] hover:border-[#7B1F2A]/40'
                    }`}
                  >
                    Group by Category
                  </button>
                  <button
                    onClick={() => setGroupBy('timeline')}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                      groupBy === 'timeline'
                        ? 'bg-[#7B1F2A] text-white shadow-sm'
                        : 'bg-white border border-neutral-300 text-[#4E1218] hover:border-[#7B1F2A]/40'
                    }`}
                  >
                    Group by Timeline
                  </button>
                </div>

                <button
                  onClick={() => setConfirmRegenerateOpen(true)}
                  disabled={generate.isPending || !user?.culture}
                  className="premium-glow-btn"
                >
                  <Sparkles className="button-icon w-5 h-5" />
                  <span className="button-text text-sm font-semibold uppercase tracking-[0.16em]">
                    {generate.isPending ? 'Generating…' : 'Regenerate'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </Reveal>

        {/* Regenerate confirmation modal */}
        <AnimatePresence>
          {confirmRegenerateOpen && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm px-4 py-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="card w-full max-w-sm overflow-hidden rounded-2xl bg-white text-left shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]"
              >
                <div className="header p-5 pt-6">
                  <div className="image mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEE2E2] text-[#DC2626]">
                    <svg
                      aria-hidden="true"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-6 w-6"
                    >
                      <path
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="content mt-4 text-center">
                    <span className="title block text-lg font-semibold text-[#111827]">Regenerate checklist</span>
                    <p className="message mt-2 text-sm leading-6 text-[#6B7280]">
                      Generating a new checklist will replace your existing tasks. If you continue, all current checklist items may be lost.
                    </p>
                  </div>
                  <div className="actions mt-6 bg-[#F9FAFB] px-4 py-4 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmRegenerateOpen(false)
                        generate.mutate({})
                      }}
                      className="desactivate w-full rounded-xl bg-[#7B1F2A] px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#5c151d] transition"
                    >
                      Regenerate Anyway
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRegenerateOpen(false)}
                      className="cancel mt-3 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-sm font-medium text-[#374151] shadow-sm hover:bg-[#F3F4F6] transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Overall Progress Banner */}
        <Reveal delay={0.05}>
          <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#F0E9E7] shadow-sm mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F9EEE9] px-3 py-1.5">
                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#C08E3F]">Overall Progress</span>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-[#7B1F2A] shadow-sm">
                  {done} of {items.length} completed
                </span>
              </div>
              <h2 className="font-display text-3xl font-bold text-[#4E1218] leading-tight">
                {pct === 100 ? 'All Tasks Finished! 🎉' : `${pct}% Tasks Completed`}
              </h2>
              <p className="text-sm text-neutral-600 max-w-2xl">
                Organized across {sections.length} planning phase{sections.length === 1 ? '' : 's'}.
              </p>

              <div className="mt-4 w-full rounded-full bg-[#F5F0EE] h-3 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#7B1F2A] via-[#C08E3F] to-[#D98A8A] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative w-28 h-28 rounded-full bg-[#FBEFEF] border border-[#F0D8D8] grid place-items-center">
                <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" strokeWidth="3" className="stroke-[#F3D8D8]" />
                  <motion.circle
                    cx="18" cy="18" r="16" fill="none" strokeWidth="3" strokeLinecap="round"
                    className="stroke-[#7B1F2A]"
                    strokeDasharray={Math.PI * 2 * 16}
                    initial={{ strokeDashoffset: Math.PI * 2 * 16 }}
                    animate={{ strokeDashoffset: Math.PI * 2 * 16 * (1 - pct / 100) }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </svg>
                <p className="font-display text-2xl font-bold text-[#4E1218]">{pct}%</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Task Cards Grid */}
        {isLoading ? (
          <div className="grid place-items-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-burgundy-300 border-t-burgundy-900 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm max-w-xl mx-auto my-10">
            <Sparkles className="w-12 h-12 text-[#C08E3F] mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold text-[#4E1218]">No Checklist Generated Yet</h3>
            <p className="text-xs text-neutral-600 mt-2 mb-6 leading-relaxed">
              Click the button below to generate a culture-tailored checklist for your wedding timeline.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setAddTaskDrawerOpen(true)}
                className="premium-btn"
              >
                + Add Custom Task
              </button>
              <button
                onClick={() => generate.mutate({})}
                disabled={generate.isPending || !user?.culture}
                className="premium-btn"
              >
                Generate AI Checklist
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            
            {/* Section Cards */}
            <AnimatePresence>
              {sections.map((sec, sIdx) => {
                const list = grouped[sec] || []
                const sectionDone = list.filter((x) => x.is_completed).length
                const pctDone = list.length ? Math.round((sectionDone / list.length) * 100) : 0
                const CategoryIcon = getCategoryIcon(sec) || ListTodo

                return (
                  <Reveal key={sec} delay={(sIdx + 1) * 0.03} duration={0.3} className="h-full">
                    <motion.div
                      layout
                      onClick={() => setActiveModalSec(sec)}
                      className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm hover:border-[#7B1F2A]/30 hover:shadow-md transition duration-300 flex flex-col h-[520px] cursor-pointer group group-hover-scrollbar-visible"
                    >
                      <div className="flex-1 min-h-0 flex flex-col">
                        {/* Header with Full Title */}
                        <div className="flex items-start gap-3 mb-4 pb-3 border-b border-neutral-100">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-display text-xl font-bold text-[#4E1218] leading-snug">
                              {sec}
                            </h3>
                            <p className="text-[11px] font-semibold text-neutral-500 mt-0.5">
                              {sectionDone} of {list.length} completed
                            </p>
                          </div>

                          <span className="text-xs font-bold text-[#7B1F2A] bg-[#FAEDE6] px-2.5 py-1 rounded-full shrink-0">
                            {pctDone}%
                          </span>
                        </div>

                        {/* Progress Bar & Bulk Date Trigger */}
                        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden mb-3">
                          <div className="bg-[#7B1F2A] h-full transition-all duration-500 rounded-full" style={{ width: `${pctDone}%` }} />
                        </div>

                        <div className="flex items-center justify-between mb-4 text-[11px] font-semibold text-neutral-500" onClick={(e) => e.stopPropagation()}>
                          <span className="uppercase tracking-wider text-[10px] font-bold text-neutral-400">Phase Tasks</span>
                          <label className="text-[#7B1F2A] hover:text-[#4E1218] hover:underline cursor-pointer inline-flex items-center gap-1 relative transition" title="Set same due date for all tasks in this phase">
                            <Clock className="w-3 h-3 text-[#C08E3F]" /> Set date for all
                            <WeddingDatePicker
                              value=""
                              onChange={(date) => {
                                if (!date) return
                                bulkUpdateDates.mutate({ items: list, date })
                              }}
                              allowPast
                              ariaLabel={`Set due date for ${sec}`}
                              rootClassName="absolute inset-0"
                              triggerClassName="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            />
                          </label>
                        </div>

                        {/* Task List - Natural wrapping & smart due date indicators */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 min-h-0 overflow-y-auto pb-2 cursor-default card-scroll-area"
                        >
                          {list.map((it) => {
                            let diffDays = null
                            if (it.due_date) {
                              diffDays = Math.ceil((new Date(it.due_date).getTime() - todayDate.getTime()) / 86400000)
                            }

                            // Smart due badge logic: only highlight urgent or overdue tasks; keep normal dates clean
                            const isOverdue = diffDays !== null && diffDays < 0
                            const isUrgent = diffDays !== null && diffDays >= 0 && diffDays <= 7

                            return (
                              <div key={it.id} className="flex items-start justify-between gap-3 group/item p-1.5 rounded-xl hover:bg-neutral-50 transition">
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); update.mutate({ id: it.id, is_completed: !Boolean(it.is_completed) }) }}
                                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition cursor-pointer ${
                                      it.is_completed ? 'bg-[#7B1F2A] border-[#7B1F2A] text-white' : 'border-neutral-300 hover:border-burgundy-700 bg-white'
                                    }`}
                                  >
                                    {it.is_completed && <Check className="w-3 h-3 stroke-[3]" />}
                                  </button>
                                  
                                  {/* Task title wraps naturally onto 2 lines - NO truncation */}
                                  <p className={`text-xs font-medium leading-relaxed ${it.is_completed ? 'line-through text-neutral-400' : 'text-[#2C2A29]'}`}>
                                    {it.title}
                                  </p>
                                </div>

                                {/* Smart Interactive Due Date Badge */}
                                <div className="flex items-center gap-1.5 shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                  <div className="relative flex items-center cursor-pointer">
                                    <label className="cursor-pointer inline-flex items-center" title="Click to change due date">
                                      {it.due_date && (isOverdue || isUrgent) && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-tight transition ${
                                          isOverdue
                                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                        }`}>
                                          {isOverdue ? `${Math.abs(diffDays)}d overdue` : diffDays === 0 ? 'Today' : `${diffDays}d left`}
                                        </span>
                                      )}

                                      {it.due_date && !isOverdue && !isUrgent && (
                                        <span className="text-[11px] font-medium text-neutral-400 hover:text-[#7B1F2A] opacity-70 group-hover/item:opacity-100 transition">
                                          {diffDays}d
                                        </span>
                                      )}

                                      {!it.due_date && (
                                        <span className="opacity-0 group-hover/item:opacity-100 text-[10px] font-semibold text-neutral-400 hover:text-[#7B1F2A] transition">
                                          + Date
                                        </span>
                                      )}

                                      <WeddingDatePicker
                                        value={it.due_date ? String(it.due_date).substring(0, 10) : ''}
                                        onChange={(date) => update.mutate({ id: it.id, due_date: date || null })}
                                        allowPast
                                        ariaLabel={`Change due date for ${it.title}`}
                                        rootClassName="absolute inset-0"
                                        triggerClassName="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                      />
                                    </label>
                                  </div>

                                  <button
                                    onClick={(e) => { e.stopPropagation(); remove.mutate(it.id) }}
                                    className="opacity-0 group-hover/item:opacity-100 transition p-1 cursor-pointer text-neutral-400 hover:text-red-600"
                                    title="Delete task"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Clean Card Footer */}
                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedSec(sec)
                            setAddTaskDrawerOpen(true)
                          }}
                          className="text-xs font-semibold text-[#7B1F2A] hover:text-[#4E1218] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Task
                        </button>
                        
                        <span className="text-xs font-medium text-neutral-400 group-hover:text-[#4E1218] inline-flex items-center gap-1 transition">
                          View Phase <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </motion.div>
                  </Reveal>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        <button
          onClick={() => {
            setSelectedSec('')
            setAddTaskDrawerOpen(true)
          }}
          aria-label="Add task"
          className="fixed right-6 bottom-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#E8C7BD] bg-[#7B1F2A] text-white shadow-[0_18px_50px_-20px_rgba(123,31,42,0.85)] transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#C08E3F]/30"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Right Slide-Over Drawer: Add New Task */}
        <AnimatePresence>
          {addTaskDrawerOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAddTaskDrawerOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              />

              <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="w-screen max-w-md bg-white shadow-2xl p-6 sm:p-8 flex flex-col justify-between relative z-10"
                >
                  <div>
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#FAEDE6] grid place-items-center text-[#7B1F2A]">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display text-2xl font-bold text-[#4E1218]">Add New Task</h3>
                          <p className="text-xs text-neutral-500">Create a custom task for your wedding checklist.</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setAddTaskDrawerOpen(false)}
                        className="w-8 h-8 rounded-full bg-neutral-100 grid place-items-center text-neutral-500 hover:text-neutral-900 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form id="add-task-drawer-form" onSubmit={handleAddTaskSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Task Title</label>
                        <input
                          type="text"
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          placeholder="e.g. Reserve bridal suite, Book MUA..."
                          required
                          className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-burgundy-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Category / Section</label>
                        <select
                          value={selectedSec}
                          onChange={(e) => setSelectedSec(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-burgundy-800"
                        >
                          <option value="">General Planning</option>
                          {availableSections.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                          <option value="__new__" className="font-semibold text-[#7B1F2A]">+ Create new category...</option>
                        </select>
                      </div>

                      {selectedSec === '__new__' && (
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">New Category Name</label>
                          <input
                            type="text"
                            value={customSec}
                            onChange={(e) => setCustomSec(e.target.value)}
                            placeholder="e.g. Pre-Wedding Shoot, Honeymoon..."
                            required
                            className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-burgundy-800"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Due Date (Optional)</label>
                        <WeddingDatePicker
                          value={dueDate}
                          onChange={setDueDate}
                          placeholder="Select date..."
                          allowPast
                          ariaLabel="Choose task due date"
                        />
                      </div>
                    </form>
                  </div>

                  <div className="pt-6 border-t border-neutral-100 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setAddTaskDrawerOpen(false)}
                      className="premium-btn flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="add-task-drawer-form"
                      disabled={add.isPending}
                      className="premium-btn flex-1"
                    >
                      <Plus className="w-4 h-4" />
                      {add.isPending ? 'Adding...' : 'Add Task'}
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Pop-Out Detailed Modal */}
        <AnimatePresence>
          {activeModalSec && (grouped[activeModalSec] || []) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-neutral-200 shadow-2xl relative max-h-[85vh] flex flex-col"
              >
                <button
                  onClick={() => setActiveModalSec(null)}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 grid place-items-center text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="font-display text-2xl font-bold text-[#4E1218] pr-8 mb-1">{activeModalSec}</h3>
                <p className="text-xs text-neutral-500 mb-4">Manage all items in this phase.</p>

                {/* Set Phase Target Date (Bulk update all tasks in this phase) */}
                <div className="bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl p-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C08E3F] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#4E1218]">Set Due Date for Entire Phase</p>
                      <p className="text-[10px] text-neutral-500">Apply target date to all tasks at once.</p>
                    </div>
                  </div>

                  <WeddingDatePicker
                    value=""
                    onChange={(date) => {
                      if (!date) return
                      bulkUpdateDates.mutate({ items: grouped[activeModalSec] || [], date })
                    }}
                    placeholder="Set date..."
                    allowPast
                    ariaLabel={`Set due date for ${activeModalSec}`}
                    rootClassName="relative w-full sm:w-44 shrink-0"
                    triggerClassName="w-full px-3 py-2 rounded-full border border-neutral-300 bg-white text-xs focus:outline-none focus:border-burgundy-800 flex items-center justify-between text-left cursor-pointer"
                  />
                </div>

                {/* Add Task inside modal */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!modalTaskTitle.trim()) return
                    add.mutate({
                      title: modalTaskTitle.trim(),
                      section: activeModalSec,
                      due_date: modalDueDate || null,
                    })
                  }}
                  className="mb-6 pb-6 border-b border-neutral-200 flex flex-col gap-3"
                >
                  <input
                    value={modalTaskTitle}
                    onChange={(e) => setModalTaskTitle(e.target.value)}
                    placeholder="Add task to this category..."
                    required
                    className="w-full px-4 py-2 text-xs rounded-xl border border-neutral-300 focus:border-burgundy-800 outline-none"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <WeddingDatePicker
                        value={modalDueDate}
                        onChange={setModalDueDate}
                        placeholder="Select due date..."
                        allowPast
                        ariaLabel="Choose new task due date"
                        triggerClassName="w-full px-3 py-2 rounded-full border border-neutral-300 bg-white text-xs focus:outline-none focus:border-burgundy-800 flex items-center justify-between text-left cursor-pointer"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={add.isPending}
                      className="px-5 py-2 rounded-xl bg-[#4E1218] text-white text-xs font-semibold hover:bg-burgundy-900 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </form>

                {/* Modal Items List */}
                <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                  {(grouped[activeModalSec] || []).map((it) => (
                    <div key={it.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-neutral-200/60 gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => update.mutate({ id: it.id, is_completed: !Boolean(it.is_completed) })}
                          className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer shrink-0 ${
                            it.is_completed ? 'bg-[#7B1F2A] border-[#7B1F2A] text-white' : 'bg-white border-neutral-300'
                          }`}
                        >
                          {it.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <span className={`text-xs font-medium ${it.is_completed ? 'line-through text-neutral-400' : 'text-[#2C2A29]'}`}>
                          {it.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <WeddingDatePicker
                          value={it.due_date ? String(it.due_date).substring(0, 10) : ''}
                          onChange={(date) => update.mutate({ id: it.id, due_date: date || null })}
                          allowPast
                          ariaLabel={`Change due date for ${it.title}`}
                          rootClassName="relative w-36"
                          triggerClassName="w-full px-3 py-1.5 rounded-full border border-neutral-300 bg-white text-[11px] focus:outline-none focus:border-burgundy-800 flex items-center justify-between text-left cursor-pointer"
                        />

                        <button
                          onClick={() => remove.mutate(it.id)}
                          className="text-neutral-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
