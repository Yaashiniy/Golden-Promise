import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isBefore,
  isSameDay, isSameMonth, isValid, parseISO, setMonth, setYear, startOfDay,
  startOfMonth, startOfWeek, subMonths,
} from 'date-fns'

export function WeddingDatePicker({
  value,
  onChange,
  placeholder = 'Select wedding date',
  allowPast = false,
  rootClassName = 'relative',
  triggerClassName = '',
  ariaLabel = 'Choose date',
}) {
  const [open, setOpen] = useState(false)
  const [month, setCalendarMonth] = useState(startOfMonth(new Date()))
  const [mode, setMode] = useState('days')
  const rootRef = useRef(null)
  const popupRef = useRef(null)
  const [position, setPosition] = useState({ left: 0, top: 0, width: 320 })

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target) && !popupRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  useEffect(() => {
    if (!open) return
    const place = () => {
      const rect = rootRef.current?.getBoundingClientRect()
      if (!rect) return
      const width = Math.min(Math.max(rect.width, 288), 352, window.innerWidth - 24)
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12)
      const estimatedHeight = 390
      const fitsBelow = rect.bottom + estimatedHeight + 12 <= window.innerHeight
      setPosition({ left, top: fitsBelow ? rect.bottom + 8 : Math.max(12, rect.top - estimatedHeight - 8), width })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  const openCalendar = () => {
    const parsed = value ? parseISO(value) : null
    setCalendarMonth(startOfMonth(parsed && isValid(parsed) ? parsed : new Date()))
    setMode('days')
    setOpen((current) => !current)
  }

  return (
    <div ref={rootRef} className={rootClassName}>
      <button
        type="button"
        onClick={openCalendar}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={triggerClassName || 'w-full px-4 py-2.5 rounded-full border border-neutral-300 text-sm focus:outline-none focus:border-burgundy-800 flex items-center justify-between text-left cursor-pointer'}
      >
        <span className={value ? 'text-[#4E1218]' : 'text-neutral-400'}>
          {value && isValid(parseISO(value)) ? format(parseISO(value), 'dd MMMM yyyy') : placeholder}
        </span>
        <CalendarDays className="w-4 h-4 mr-1 text-burgundy-800" />
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {open && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.16 }}
            role="dialog"
            aria-label={ariaLabel}
            className="fixed z-[200] rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(78,18,24,0.14)]"
            style={{ left: position.left, top: position.top, width: position.width }}
          >
            <div className="mb-4 flex items-center justify-between">
              <button type="button" onClick={() => setCalendarMonth((date) => subMonths(date, 1))} className="w-9 h-9 grid place-items-center rounded-full text-burgundy-800 hover:bg-blush-100 transition cursor-pointer" aria-label="Previous month">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setMode((current) => current === 'months' ? 'days' : 'months')} className={`rounded-lg px-2 py-1 font-display text-base font-semibold transition cursor-pointer ${mode === 'months' ? 'bg-blush-200 text-burgundy-900' : 'text-burgundy-950 hover:bg-blush-100'}`}>
                  {format(month, 'MMMM')}
                </button>
                <button type="button" onClick={() => setMode((current) => current === 'years' ? 'days' : 'years')} className={`rounded-lg px-2 py-1 font-display text-base font-semibold transition cursor-pointer ${mode === 'years' ? 'bg-blush-200 text-burgundy-900' : 'text-burgundy-950 hover:bg-blush-100'}`}>
                  {format(month, 'yyyy')}
                </button>
              </div>
              <button type="button" onClick={() => setCalendarMonth((date) => addMonths(date, 1))} className="w-9 h-9 grid place-items-center rounded-full text-burgundy-800 hover:bg-blush-100 transition cursor-pointer" aria-label="Next month">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {mode === 'months' ? (
              <div className="grid grid-cols-3 gap-2 py-1">
                {Array.from({ length: 12 }, (_, index) => (
                  <button key={index} type="button" onClick={() => { setCalendarMonth((date) => setMonth(date, index)); setMode('days') }} className={`rounded-xl px-2 py-3 text-sm font-semibold transition cursor-pointer ${month.getMonth() === index ? 'bg-burgundy-800 text-white' : 'text-burgundy-850 hover:bg-blush-100'}`}>
                    {format(new Date(2024, index, 1), 'MMM')}
                  </button>
                ))}
              </div>
            ) : mode === 'years' ? (
              <div className="grid grid-cols-4 gap-2 py-1 max-h-52 overflow-y-auto pr-1">
                {Array.from({ length: allowPast ? 35 : 25 }, (_, offset) => new Date().getFullYear() + offset - (allowPast ? 10 : 0)).map((year) => (
                  <button key={year} type="button" onClick={() => { setCalendarMonth((date) => setYear(date, year)); setMode('days') }} className={`rounded-xl px-2 py-3 text-sm font-semibold transition cursor-pointer ${month.getFullYear() === year ? 'bg-burgundy-800 text-white' : 'text-burgundy-850 hover:bg-blush-100'}`}>
                    {year}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 mb-1 text-center text-[10px] font-bold uppercase tracking-wide text-burgundy-700/70">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day} className="py-1">{day}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) }).map((day) => {
                    const selected = value && isSameDay(day, parseISO(value))
                    const disabled = !allowPast && isBefore(day, startOfDay(new Date()))
                    return (
                      <button key={day.toISOString()} type="button" disabled={disabled} onClick={() => { onChange(format(day, 'yyyy-MM-dd')); setOpen(false) }} className={`aspect-square rounded-xl text-xs font-semibold transition ${selected ? 'bg-burgundy-800 text-white' : disabled ? 'text-neutral-300 cursor-not-allowed' : isSameMonth(day, month) ? 'text-burgundy-900 hover:bg-blush-200 cursor-pointer' : 'text-neutral-400 hover:bg-blush-100 cursor-pointer'}`}>
                        {format(day, 'd')}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-blush-200 pt-3">
              <button type="button" onClick={() => { onChange(''); setOpen(false) }} className="text-xs font-semibold text-burgundy-700 hover:text-burgundy-900 cursor-pointer">Clear</button>
              <button type="button" onClick={() => { setCalendarMonth(startOfMonth(new Date())); setMode('days') }} className="text-xs font-semibold text-gold-600 hover:text-gold-700 cursor-pointer">Today</button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
