import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Cpu, Send, Settings, Sparkles, Trash2, X, MessageCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import Lenis from 'lenis'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { DashboardSidebar } from '../../components/DashboardSidebar.jsx'
import * as itemApi from '../../api/budgetItems.js'
import { sendBudgetChat, applyBudgetProposal } from '../../api/aiChat.js'

const AI_PROVIDER_IDS = ['default', 'gemini', 'groq', 'openai', 'ilmu']

function readProviderKey(provider) {
  const providerKey = localStorage.getItem(`goldie_ai_key_${provider}`)
  if (providerKey) return providerKey
  return localStorage.getItem('goldie_ai_provider') === provider
    ? localStorage.getItem('goldie_ai_key') || ''
    : ''
}

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
          className="text-[#C08E3F] hover:text-[#A67831] underline font-semibold cursor-pointer"
        >
          {linkText}
        </a>
      );
    } else {
      parts.push(
        <Link
          key={matchIndex}
          to={linkUrl}
          className="text-[#C08E3F] hover:text-[#A67831] underline font-semibold cursor-pointer"
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

export default function GoldieAi() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const location = useLocation()

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    const lenis = window.__lenis
    lenis?.stop()
    window.scrollTo(0, 0)
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      lenis?.start()
    }
  }, [])
  
  // Dashboard Layout State
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem('sidebar_left_open') !== 'false')
  useEffect(() => {
    const handleToggle = () => setSidebarOpen(localStorage.getItem('sidebar_left_open') !== 'false')
    window.addEventListener('sidebar_left_toggle', handleToggle)
    return () => window.removeEventListener('sidebar_left_toggle', handleToggle)
  }, [])
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Chat State
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const scrollerRef = useRef(null)

  // AI Configuration State
  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem('goldie_ai_provider') || 'default')
  const [aiKey, setAiKey] = useState(() => readProviderKey(aiProvider))
  const [savedKeys, setSavedKeys] = useState(() => Object.fromEntries(
    AI_PROVIDER_IDS.map((provider) => [provider, readProviderKey(provider)])
  ))
  
  // Settings Form State
  const [tempProvider, setTempProvider] = useState(aiProvider)
  const [tempKey, setTempKey] = useState(aiKey)
  const [showSettingsMobile, setShowSettingsMobile] = useState(false)
  const [showModelMenu, setShowModelMenu] = useState(false)
  const [showKey, setShowKey] = useState(false)

  // Load messages
  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`goldie_chat_messages_${user.id}`)
        if (saved) {
          setMessages(JSON.parse(saved))
        } else {
          const first = user?.name?.split(' ')[0] ?? ''
          const intro = `Hi ${first} — I am Goldie, your AI wedding planner. I can help you build your budget, manage your checklist, or find verified vendors. How can I help you today?`
          setMessages([{ role: 'assistant', content: intro }])
        }
      } catch (e) {
        // Fallback
      }
    }
  }, [user?.id])

  // Save messages
  useEffect(() => {
    if (user?.id && messages.length > 0) {
      localStorage.setItem(`goldie_chat_messages_${user.id}`, JSON.stringify(messages))
    }
  }, [messages, user?.id])
  
  useEffect(() => {
    if (location.state?.initialQuery) {
      setInput(location.state.initialQuery)
    }
  }, [location.state?.initialQuery])

  // Scroll to bottom
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 999999, behavior: 'smooth' })
  }, [messages])

  // Local Lenis for silky smooth chat scrolling
  useEffect(() => {
    if (!scrollerRef.current) return
    const lenis = new Lenis({
      wrapper: scrollerRef.current,
      content: scrollerRef.current.firstElementChild,
      lerp: 0.1,
      smoothWheel: true,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    const rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  function saveSettings() {
    const cleanKey = tempKey.trim()
    setAiProvider(tempProvider)
    setAiKey(cleanKey)
    setSavedKeys((keys) => ({ ...keys, [tempProvider]: cleanKey }))
    localStorage.setItem('goldie_ai_provider', tempProvider)
    localStorage.setItem(`goldie_ai_key_${tempProvider}`, cleanKey)
    localStorage.setItem('goldie_ai_key', cleanKey)
    toast.success('AI settings saved!')
    setShowSettingsMobile(false)
  }

  function selectModel(provider) {
    const providerKey = savedKeys[provider] || ''
    setAiProvider(provider)
    setTempProvider(provider)
    setAiKey(providerKey)
    setTempKey(providerKey)
    localStorage.setItem('goldie_ai_provider', provider)
    localStorage.setItem('goldie_ai_key', providerKey)
    setShowModelMenu(false)
  }

  function clearChat() {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      localStorage.removeItem(`goldie_chat_messages_${user?.id}`)
      const first = user?.name?.split(' ')[0] ?? ''
      const intro = `Hi ${first} — I am Goldie, your AI wedding planner. I can help you build your budget, manage your checklist, or find verified vendors. How can I help you today?`
      setMessages([{ role: 'assistant', content: intro }])
    }
  }

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

  const activeProviderLabel = aiKey
    ? `${aiProvider === 'gemini-pro' ? 'Gemini Pro' : aiProvider === 'gemini-flash' ? 'Gemini Flash' : aiProvider.toUpperCase()} (Custom)`
    : 'Groq (System)'

  // The Settings Panel Component for reuse in desktop sidebar and mobile drawer
  const SettingsPanel = () => (
    <div className="flex h-full flex-col bg-[#FFFDFC] p-6">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C08E3F]">Secure connection</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-[#4E1218]">API Access</h2>
          <p className="mt-1 text-xs leading-5 text-[#4E1218]/55">Add the key for your selected model.</p>
        </div>
        <button 
          onClick={clearChat}
          className="rounded-xl bg-[#FAEDE6] p-2.5 text-[#7B1F2A] transition-all hover:-translate-y-0.5 hover:bg-[#E8C7BD]/65"
          title="Clear Chat"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {tempProvider !== 'default' ? (
          <div className="rounded-2xl bg-white p-4 shadow-[0_14px_35px_-28px_rgba(78,18,24,0.35)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="text-[13px] font-semibold text-[#4E1218]">
                  {tempProvider === 'gemini' ? 'Gemini' : tempProvider === 'groq' ? 'Groq' : tempProvider === 'openai' ? 'OpenAI' : tempProvider === 'ilmu' ? 'ILMU' : tempProvider.toUpperCase()} API Key
                </label>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${savedKeys[tempProvider] ? 'bg-green-100 text-green-700' : 'bg-[#FAEDE6] text-[#7B1F2A]'}`}>
                  {savedKeys[tempProvider] ? '✓ Saved' : '× Not Saved'}
                </span>
              </div>
              {tempProvider === 'gemini' && <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-[#C08E3F] hover:underline">Get key ↗</a>}
              {tempProvider === 'groq' && <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-[#C08E3F] hover:underline">Get key ↗</a>}
              {tempProvider === 'openai' && <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-[#C08E3F] hover:underline">Get key ↗</a>}
              {tempProvider === 'ilmu' && <a href="https://console.ilmu.ai/" target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-[#C08E3F] hover:underline">Get key ↗</a>}
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Leave empty for default"
                className="w-full rounded-xl border border-[#E8C7BD]/60 bg-[#FAF8F5] py-3 pl-4 pr-11 text-[13px] outline-none transition focus:border-[#7B1F2A]/40 focus:bg-white focus:ring-4 focus:ring-[#7B1F2A]/5"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4E1218]/45 hover:text-[#7B1F2A] transition"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[#8A6A6E]">
              <Check className="w-3 h-3" /> Stored locally in your browser.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-4 shadow-[0_14px_35px_-28px_rgba(78,18,24,0.35)] text-center">
            <Sparkles className="w-8 h-8 text-[#C08E3F] mx-auto mb-2" />
            <p className="text-[13px] font-semibold text-[#4E1218]">Using Platform Key</p>
            <p className="text-[11px] text-[#8A6A6E] mt-1 leading-relaxed">You are using the default Goldie AI engine. No API key is required.</p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={saveSettings}
          className="w-full rounded-full bg-[#7B1F2A] py-3.5 text-[13px] font-semibold text-white shadow-[0_12px_28px_-14px_rgba(78,18,24,0.7)] transition-all hover:-translate-y-0.5 hover:bg-[#4E1218] hover:shadow-[0_16px_30px_-12px_rgba(78,18,24,0.65)]"
        >
          Save API Key
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] font-sans text-[#4E1218]">
      <DashboardSidebar />

      <main
        className="flex-1 transition-all duration-300 ease-in-out relative flex overflow-hidden h-full"
        style={{
          marginLeft: isDesktop && sidebarOpen ? '80px' : '0',
        }}
      >
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-[#E8C7BD]/50 flex items-center justify-between px-4 z-20">
          <button 
            onClick={() => window.dispatchEvent(new Event('sidebar_left_toggle'))}
            className="p-2 -ml-2 text-[#7B1F2A]"
          >
            <div className="w-6 h-0.5 bg-current mb-1.5"></div>
            <div className="w-4 h-0.5 bg-current mb-1.5"></div>
            <div className="w-6 h-0.5 bg-current"></div>
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C08E3F]" />
            <span className="font-display font-semibold text-[#7B1F2A] text-lg">Ask Goldie</span>
          </div>
          <button onClick={() => setShowSettingsMobile(true)} className="p-2 -mr-2 text-[#7B1F2A]">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence>
          {showSettingsMobile && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-[#4E1218]/20 backdrop-blur-[2px]"
                onClick={() => setShowSettingsMobile(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-y-0 right-0 z-40 w-[min(340px,92vw)] bg-[#FFFDFC] shadow-[-20px_0_60px_-30px_rgba(78,18,24,0.55)]"
              >
                <button 
                  onClick={() => setShowSettingsMobile(false)}
                  className="absolute right-4 top-4 z-10 rounded-full bg-[#FAEDE6] p-2 text-[#7B1F2A] transition hover:bg-[#E8C7BD]"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="h-full pt-12">
                  <SettingsPanel />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="relative flex h-full min-h-0 flex-1 flex-col pt-16 lg:pt-0">
          {/* Desktop Header */}
          <div className="relative z-10 hidden h-[88px] shrink-0 border-b border-[#7B1F2A]/10 bg-white shadow-none lg:block">
            <div className="absolute right-6 top-3 flex items-center gap-3 text-right">
              <div className="min-w-0">
                <div className="flex items-center justify-end gap-2.5">
                  <h1 className="font-display text-[22px] font-semibold leading-tight text-[#4E1218]">Ask Goldie</h1>
                </div>
                <div className="mt-1 flex items-center justify-end gap-2 text-[11px] text-[#4E1218]/55">
                  <span>Your Malaysian wedding planning companion</span>
                  <span className="h-1 w-1 rounded-full bg-[#C08E3F]" />
                  <span className="truncate font-semibold text-[#7B1F2A]/70">{activeProviderLabel}</span>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7B1F2A] text-white">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div 
            ref={scrollerRef}
            className="min-h-0 flex-1 overscroll-contain overflow-y-auto px-4 py-7 md:px-8"
          >
            <div className="mx-auto max-w-4xl space-y-5">
            {messages.map((m, i) => {
              const isUser = m.role === 'user'
              return (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} ${isUser ? 'ml-auto max-w-[78%]' : 'max-w-[82%]'}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isUser ? 'bg-[#C08E3F] text-white' : 'bg-[#7B1F2A] text-white'}`}>
                    {isUser ? <span className="text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={`flex flex-col gap-2 min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`break-words px-4 py-3 text-[13px] leading-6 rounded-2xl ${
                        isUser 
                          ? 'bg-[#7B1F2A] text-white rounded-tr-md shadow-[0_12px_25px_-18px_rgba(78,18,24,0.8)]' 
                          : 'bg-white text-[#4E1218] rounded-tl-md shadow-[0_12px_30px_-24px_rgba(78,18,24,0.45)]'
                      }`}
                    >
                      {renderChatMessage(m.content)}
                    </div>
                    
                    {/* Render Proposals */}
                    {m.proposals && m.proposals.length > 0 && (
                      <div className="grid gap-2 w-full max-w-[280px]">
                        {m.proposals.map((p, idx) => (
                          <BudgetProposal key={idx} proposal={p} />
                        ))}
                      </div>
                    )}
                    
                    {/* Render Vendor Suggestions */}
                    {m.suggestions?.some((s) => s.is_registered !== false) && (
                      <div className="grid gap-2 w-full max-w-[280px]">
                        {m.suggestions.filter((s) => s.is_registered !== false).map((s, idx) => (
                          <VendorSuggestion key={idx} suggestion={s} />
                        ))}
                      </div>
                    )}
                    
                    {/* Render Applied Actions */}
                    {m.applied && m.applied.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                        {m.applied.map((a, idx) => (
                          <AppliedChip key={idx} action={a} />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
            
            {chat.isPending && (
              <div className="flex gap-3 max-w-3xl">
                <div className="shrink-0 w-8 h-8 rounded-full bg-[#7B1F2A] text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-[0_12px_30px_-24px_rgba(78,18,24,0.45)]">
                  <span className="w-1.5 h-1.5 bg-[#C08E3F] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#C08E3F] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#C08E3F] rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Input Area */}
          <div className="shrink-0 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5] to-transparent p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              {/* Quick Prompts (optional, hidden on very small screens) */}
              {messages.length <= 1 && (
                <div className="hidden md:flex flex-wrap gap-2 mb-4 justify-center">
                  <button onClick={() => setInput('Find a photographer in Selangor')} className="px-3 py-1.5 bg-white border border-[#D8C3B3] rounded-full text-[11px] text-[#7B1F2A] hover:bg-[#FAEDE6] transition-colors">Find a photographer</button>
                  <button onClick={() => setInput('Suggest florists under RM 3,000')} className="px-3 py-1.5 bg-white border border-[#D8C3B3] rounded-full text-[11px] text-[#7B1F2A] hover:bg-[#FAEDE6] transition-colors">Budget florists</button>
                </div>
              )}
              
              <form onSubmit={send} className="group relative rounded-full bg-white shadow-[0_18px_45px_-24px_rgba(78,18,24,0.38)] transition-shadow hover:shadow-[0_22px_48px_-22px_rgba(78,18,24,0.45)]">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Goldie about vendors, budgets, or ideas..."
                  className="w-full rounded-full border border-[#E8C7BD]/70 bg-white py-4 pl-6 pr-14 text-[14px] text-[#4E1218] outline-none transition-all placeholder:text-[#8A6A6E] focus:border-[#7B1F2A]/40 focus:ring-4 focus:ring-[#7B1F2A]/5"
                  disabled={chat.isPending}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || chat.isPending}
                  className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-[#7B1F2A] text-white flex items-center justify-center transition-all hover:bg-[#4E1218] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              <div className="relative mt-3 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowModelMenu((open) => !open)}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#4E1218]/70 transition-colors hover:bg-white hover:text-[#7B1F2A]"
                  aria-expanded={showModelMenu}
                >
                  <Cpu className="h-3.5 w-3.5 text-[#C08E3F]" />
                  <span>{aiProvider === 'default' ? 'Default (Goldie AI)' : aiProvider === 'gemini' ? 'Gemini' : aiProvider === 'groq' ? 'Groq Fast' : aiProvider === 'openai' ? 'OpenAI' : 'ILMU'}</span>
                  {savedKeys[aiProvider] && aiProvider !== 'default' && <span className="h-2 w-2 rounded-full bg-emerald-500" title="API key saved" />}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showModelMenu ? 'rotate-180' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettingsMobile(true)}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#4E1218]/70 transition-colors hover:bg-white hover:text-[#7B1F2A]"
                  title="API Settings"
                >
                  <Settings className="h-3.5 w-3.5 text-[#C08E3F]" />
                  <span>API Settings</span>
                </button>

                <AnimatePresence>
                  {showModelMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute bottom-11 left-0 z-30 w-64 overflow-hidden rounded-2xl bg-white p-2 shadow-[0_22px_60px_-18px_rgba(78,18,24,0.4)]"
                    >
                      <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#4E1218]/45">Choose model</p>
                      {[
                        { id: 'default', label: 'Default (Goldie AI)', detail: 'Use platform key' },
                        { id: 'gemini', label: 'Gemini', detail: 'Balanced reasoning' },
                        { id: 'groq', label: 'Groq Fast', detail: 'Fast responses' },
                        { id: 'openai', label: 'OpenAI', detail: 'General planning' },
                        { id: 'ilmu', label: 'ILMU', detail: 'Custom model access' },
                      ].map((model) => (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => selectModel(model.id)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${aiProvider === model.id ? 'bg-[#FAEDE6] text-[#7B1F2A]' : 'hover:bg-[#FAF8F5]'}`}
                        >
                          <span>
                            <span className="block text-xs font-semibold">{model.label}</span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#4E1218]/50">
                              {model.detail}
                              {savedKeys[model.id] && (
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Key saved
                                </span>
                              )}
                            </span>
                          </span>
                          {aiProvider === model.id && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-center mt-3 text-[10px] text-[#8A6A6E]">
                Goldie AI uses artificial intelligence and can make mistakes. Please verify important vendor information.
              </p>
            </div>
          </div>


        </div>
      </main>
    </div>
  )
}
