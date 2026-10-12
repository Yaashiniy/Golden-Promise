import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Bot, CalendarCheck, Check, CheckCircle2, CircleDollarSign,
  KeyRound, LockKeyhole, MessageCircleMore, ShieldCheck, Sparkles, WalletCards,
} from 'lucide-react'

const ease = [0.16, 1, 0.3, 1]

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.9, ease },
}

const staggerGroup = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.16, delayChildren: 0.08 } },
}

const rise = {
  initial: { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
}

function FeatureLabel({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#7B1F2A] shadow-[0_20px_50px_-30px_rgba(78,18,24,0.25)]">
      <Icon className="h-4 w-4" /> {children}
    </span>
  )
}

function ChatPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.45, ease }}
      className="relative mx-auto w-full max-w-[570px] rounded-[28px] bg-white p-5 shadow-[0_30px_70px_-40px_rgba(78,18,24,0.35)] transition-shadow duration-500 hover:shadow-[0_34px_56px_-30px_rgba(78,18,24,0.42)] motion-reduce:transform-none sm:p-7"
    >
      <div className="mb-5 flex items-center justify-between border-b border-[#E8C7BD]/60 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#7B1F2A] text-white"><Sparkles className="h-5 w-5" /></span>
          <div><p className="font-display text-lg font-semibold text-[#4E1218]">Ask Goldie</p><p className="text-[11px] text-[#7B1F2A]/65">Your planning companion</p></div>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">READY</span>
      </div>
      <div className="space-y-3 text-sm leading-relaxed">
        <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-[#FAEDE6] p-4 text-[#4E1218]">Plan a Tamil and Chinese wedding in Johor for 800 guests within RM 60,000.</div>
        <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[#7B1F2A] p-4 text-white">I’ll shape the budget and timeline around both cultures, your guest count, location, and priorities.</div>
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-full bg-[#FAF8F5] p-2 pl-4 text-xs text-[#7B1F2A]/60">
        Ask about budgets, vendors, or traditions…
          <motion.span whileHover={{ rotate: -12, scale: 1.08 }} className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-[#C08E3F] text-white motion-reduce:transform-none"><ArrowRight className="h-4 w-4" /></motion.span>
      </div>
      <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-2xl bg-[#4E1218] px-4 py-3 text-xs text-white shadow-md sm:flex">
        <LockKeyhole className="h-4 w-4 text-[#C08E3F]" /> Your key stays in your browser
      </div>
    </motion.div>
  )
}

function ChecklistPreview() {
  const items = [
    ['Book ceremony venue', '12 months before'],
    ['Confirm both cultural ceremonies', '10 months before'],
    ['Finalise guest list', '8 months before'],
  ]
  return (
    <div className="relative mx-auto max-w-[520px]">
      <motion.div initial={{ opacity: 0, y: 48, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.3 }} whileHover={{ y: -8 }} transition={{ duration: 0.75, ease }} className="rounded-[28px] bg-[#4E1218] p-6 text-white shadow-[0_30px_70px_-40px_rgba(78,18,24,0.45)] transition-shadow duration-500 hover:shadow-[0_34px_56px_-30px_rgba(78,18,24,0.58)] motion-reduce:transform-none sm:p-8">
        <div className="mb-7 flex items-start justify-between">
          <div><p className="font-display text-2xl">Your wedding timeline</p><p className="mt-1 text-xs text-[#FAEDE6]/65">Tamil + Chinese · Johor · 800 guests</p></div>
          <CalendarCheck className="h-7 w-7 text-[#C08E3F]" />
        </div>
        <div className="space-y-3">
          {items.map(([title, date], index) => (
            <div key={title} className="flex items-center gap-3 rounded-xl bg-white/[0.08] p-4">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${index === 0 ? 'bg-[#C08E3F]' : 'bg-white/10'}`}>
                {index === 0 ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-white/55" />}
              </span>
              <div><p className="text-sm font-semibold">{title}</p><p className="text-[11px] text-[#FAEDE6]/55">{date}</p></div>
            </div>
          ))}
        </div>
      </motion.div>
      <div className="absolute -right-3 -top-5 rounded-xl bg-white px-4 py-3 shadow-md sm:-right-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#C08E3F]">Culture aware</p>
        <p className="mt-1 text-sm font-semibold text-[#4E1218]">Two traditions, one plan</p>
      </div>
    </div>
  )
}

function BudgetPreview() {
  const rows = [
    ['Venue', 'RM 12,000', 48],
    ['Catering', 'RM 18,000', 72],
    ['Photography', 'RM 7,500', 30],
  ]
  return (
    <motion.div initial={{ opacity: 0, y: 48, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.3 }} whileHover={{ y: -8 }} transition={{ duration: 0.75, ease }} className="mx-auto max-w-[540px] rounded-[28px] bg-white p-6 shadow-[0_30px_70px_-40px_rgba(78,18,24,0.35)] transition-shadow duration-500 hover:shadow-[0_34px_56px_-30px_rgba(78,18,24,0.42)] motion-reduce:transform-none sm:p-8">
      <div className="flex items-end justify-between border-b border-[#E8C7BD]/55 pb-5">
        <div><p className="text-xs font-semibold text-[#7B1F2A]/60">TOTAL WEDDING BUDGET</p><p className="mt-2 font-display text-4xl text-[#4E1218]">RM 60,000</p></div>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">ON TRACK</span>
      </div>
      <div className="mt-5 space-y-5">
        {rows.map(([label, value, width]) => (
          <div key={label}>
            <div className="mb-2 flex justify-between text-sm"><span className="font-semibold text-[#4E1218]">{label}</span><span className="text-[#7B1F2A]">{value}</span></div>
            <div className="h-2 rounded-full bg-[#FAEDE6]"><div className="h-full rounded-full bg-[#C08E3F]" style={{ width: `${width}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3 rounded-xl bg-[#FAEDE6] p-4 text-sm text-[#4E1218]">
        <Sparkles className="h-5 w-5 shrink-0 text-[#C08E3F]" /> Goldie adjusts each estimate to your location, culture, and guest count.
      </div>
    </motion.div>
  )
}

function HeroVisual() {
  const orbitItems = [
    { Icon: MessageCircleMore, label: 'AI chat', position: '-left-1 top-[28%]', delay: 0 },
    { Icon: CalendarCheck, label: 'Checklist', position: 'right-0 top-[18%]', delay: 0.7 },
    { Icon: WalletCards, label: 'Budget', position: 'right-[4%] bottom-[13%]', delay: 1.4 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.15, delay: 0.15, ease }}
      className="relative mx-auto aspect-square w-full max-w-[590px]"
    >
      <div className="absolute inset-[3%] rounded-full border-[5px] border-[#E8C7BD]/55" />
      <motion.div
        aria-hidden="true"
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[3%] rounded-full motion-reduce:animate-none"
        style={{
          background: 'conic-gradient(#7B1F2A 0deg 54deg, transparent 54deg 360deg)',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px))',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px))',
        }}
      />
      <div className="absolute inset-[9%] overflow-hidden rounded-full bg-transparent">
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 0.8, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-x-[5%] bottom-[2%] top-[-3%] origin-bottom motion-reduce:transform-none"
        >
          <img
            src="/goldie-mascot.png"
            alt="Goldie AI mascot waving hello in a gold wedding-inspired costume"
            className="h-full w-full object-contain object-bottom"
          />
        </motion.div>
      </div>

      {orbitItems.map(({ Icon, label, position, delay }) => (
        <motion.div
          key={label}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.5, delay, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.08 }}
          className={`absolute ${position} z-10 flex items-center gap-2 rounded-full bg-white px-3 py-2.5 shadow-[0_14px_32px_-20px_rgba(78,18,24,0.5)] motion-reduce:transform-none sm:px-4`}
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#FAEDE6] text-[#7B1F2A]"><Icon className="h-4 w-4" /></span>
          <span className="hidden text-xs font-semibold text-[#4E1218] sm:block">{label}</span>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease }}
        className="absolute bottom-[1%] left-[8%] rounded-2xl bg-[#4E1218] px-5 py-4 text-white shadow-md"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#C08E3F]"><Sparkles className="h-4 w-4" /></span>
          <div><p className="font-display text-base">Culture-aware planning</p><p className="mt-0.5 text-[10px] text-white/65">Personal to your wedding</p></div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function GoldieAiAbout() {
  return (
    <main className="overflow-hidden bg-[#FAF8F6] text-[#4E1218]">
      <section className="relative flex min-h-[900px] items-center overflow-hidden bg-[#FAF8F6] py-32 md:min-h-[980px] md:py-36">
        <div className="absolute right-[-12rem] top-24 h-[28rem] w-[28rem] rounded-full bg-[#E8C7BD]/30 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1480px] items-center gap-14 px-6 lg:grid-cols-[1.02fr_.98fr] lg:px-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease }}>
            <p className="font-script text-4xl text-[#C08E3F]">Meet Goldie AI</p>
            <h1 className="mt-4 max-w-[720px] text-balance font-display font-medium text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.95] tracking-tight">
              Plan, organise, and celebrate with <span className="italic text-[#7B1F2A]">Goldie AI.</span>
            </h1>
            <p className="mt-7 max-w-[610px] text-pretty text-base leading-8 text-[#4E1218]/72 sm:text-lg">
              Goldie turns your culture, wedding date, guest count, location, and budget into practical guidance—while keeping every final decision in your hands.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/login" className="group inline-flex items-center gap-2 rounded-full bg-[#4E1218] px-7 py-4 text-sm font-semibold text-[#FAEDE6] shadow-[0_18px_50px_-28px_rgba(78,18,24,0.45)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#3d1118] hover:shadow-[0_18px_26px_-16px_rgba(78,18,24,0.7)] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none">Start planning <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none" /></Link>
              <a href="#byok-chat" className="group inline-flex items-center gap-2 rounded-full border border-[#4E1218] bg-white/90 px-6 py-4 text-sm font-semibold text-[#4E1218] transition-all duration-300 hover:-translate-y-1 hover:bg-[#4E1218] hover:text-white hover:shadow-[0_16px_24px_-16px_rgba(78,18,24,0.5)] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none">Explore features <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none" /></a>
            </div>
            <div className="mt-12 grid max-w-[650px] grid-cols-3 gap-5 border-t border-[#E8C7BD] pt-7">
              {[
                ['3', 'Smart planning tools'],
                ['15+', 'Malaysian cultures'],
                ['BYOK', 'Your preferred AI'],
              ].map(([value, label]) => (
                <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.55, ease }}>
                  <p className="font-display text-2xl font-semibold text-[#4E1218] sm:text-3xl">{value}</p>
                  <p className="mt-1 text-[10px] font-semibold leading-4 text-[#7B1F2A]/65 sm:text-xs">{label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <HeroVisual />
        </div>
      </section>

      <section id="byok-chat" className="flex min-h-[820px] items-center bg-[#FCEEE3] py-28 md:min-h-[900px] md:py-36">
        <div className="mx-auto grid max-w-[1480px] items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
          <motion.div variants={staggerGroup} initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.35 }}>
            <motion.div variants={rise}><FeatureLabel icon={KeyRound}>Bring Your Own Key</FeatureLabel></motion.div>
            <motion.h2 variants={rise} className="mt-6 text-balance font-display text-4xl font-medium leading-tight text-[#4E1218] sm:text-5xl">A private AI chat that works with <span className="italic text-[#7B1F2A]">your plan.</span></motion.h2>
            <motion.p variants={rise} className="mt-6 max-w-[620px] text-pretty leading-8 text-[#7B1F2A]/80">Connect a supported AI provider using your own API key. Goldie uses your saved wedding profile to give relevant answers—not generic lists—and asks before adding anything to your budget.</motion.p>
            <motion.div variants={rise} className="mt-8 flex flex-wrap gap-x-7 gap-y-4 text-sm text-[#4E1218]">
              {['Your API key stays local', 'Choose your preferred model', 'Profile-aware recommendations'].map((item) => <span key={item} className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#C08E3F]" />{item}</span>)}
            </motion.div>
          </motion.div>
          <ChatPreview />
        </div>
      </section>

      <section className="flex min-h-[820px] items-center bg-[#FAF8F6] py-28 md:min-h-[900px] md:py-36">
        <div className="mx-auto grid max-w-[1480px] items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
          <ChecklistPreview />
          <motion.div variants={staggerGroup} initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.35 }} className="lg:pl-10">
            <motion.div variants={rise}><FeatureLabel icon={CalendarCheck}>AI Checklist</FeatureLabel></motion.div>
            <motion.h2 variants={rise} className="mt-6 text-balance font-display text-4xl font-medium leading-tight sm:text-5xl">One timeline for <span className="italic text-[#7B1F2A]">every tradition</span> you celebrate.</motion.h2>
            <motion.p variants={rise} className="mt-6 max-w-[620px] text-pretty leading-8 text-[#7B1F2A]/80">Goldie blends multiple Malaysian cultural traditions into a single checklist, then places every task on a realistic countdown based on your wedding date.</motion.p>
            <motion.div variants={rise} className="mt-8 space-y-4">
              {['15+ Malaysian cultures supported', 'Mixed-culture checklist generation', 'Editable tasks, dates, and reminders'].map((item) => <div key={item} className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-[#C08E3F]" />{item}</div>)}
            </motion.div>
            <motion.div variants={rise}><Link to="/ai-checklist" className="group mt-9 inline-flex items-center gap-2 rounded-full border border-[#7B1F2A] px-6 py-3 text-sm font-bold text-[#7B1F2A] transition-all duration-300 hover:-translate-y-1 hover:bg-[#7B1F2A] hover:text-white hover:shadow-[0_16px_24px_-16px_rgba(78,18,24,0.5)] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none">See the AI Checklist <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none" /></Link></motion.div>
          </motion.div>
        </div>
      </section>

      <section className="flex min-h-[820px] items-center bg-[#FCEEE3] py-28 md:min-h-[900px] md:py-36">
        <div className="mx-auto grid max-w-[1480px] items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
          <motion.div variants={staggerGroup} initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.35 }}>
            <motion.div variants={rise}><FeatureLabel icon={WalletCards}>AI Budget</FeatureLabel></motion.div>
            <motion.h2 variants={rise} className="mt-6 text-balance font-display text-4xl font-medium leading-tight sm:text-5xl">A wedding budget that understands <span className="italic text-[#7B1F2A]">your priorities.</span></motion.h2>
            <motion.p variants={rise} className="mt-6 max-w-[620px] text-pretty leading-8 text-[#7B1F2A]/80">Start with a complete category plan generated from your total budget, culture, guest count, and location. Edit every row, track actual spending, and let Goldie warn you before costs drift too far.</motion.p>
            <motion.div variants={rise} className="mt-8 flex flex-wrap gap-3">
              {[['Personal allocations', CircleDollarSign], ['Overspend alerts', WalletCards], ['Vendor matching', MessageCircleMore]].map(([label, Icon]) => <span key={label} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#7B1F2A]"><Icon className="h-4 w-4" />{label}</span>)}
            </motion.div>
            <motion.div variants={rise}><Link to="/dashboard/budget" className="group mt-9 inline-flex items-center gap-2 rounded-full border border-[#7B1F2A] px-6 py-3 text-sm font-bold text-[#7B1F2A] transition-all duration-300 hover:-translate-y-1 hover:bg-[#7B1F2A] hover:text-white hover:shadow-[0_16px_24px_-16px_rgba(78,18,24,0.5)] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none">Open Smart Budget <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none" /></Link></motion.div>
          </motion.div>
          <BudgetPreview />
        </div>
      </section>

      <section className="relative flex min-h-[720px] items-center overflow-hidden px-5 py-28 text-center text-white sm:px-8 lg:py-36">
        <video
          className="absolute inset-0 h-full w-full object-cover object-center [filter:contrast(1.08)_saturate(1.08)_brightness(1.04)]"
          src="/goldie-beach-wedding.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#2a0b10]/48" />
        <motion.div variants={staggerGroup} initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.4 }} className="relative z-10 mx-auto max-w-[820px]">
          <motion.p variants={rise} className="font-script text-5xl text-[#F3C76B] drop-shadow-sm">Plan beautifully</motion.p>
          <motion.h2 variants={rise} className="mt-4 text-balance font-display text-4xl font-medium drop-shadow-sm sm:text-5xl">Plan with clarity. Celebrate your way.</motion.h2>
          <motion.p variants={rise} className="mx-auto mt-5 max-w-[650px] text-pretty leading-8 text-white drop-shadow-sm">Goldie helps you organise the details without taking control away from you.</motion.p>
          <motion.div variants={rise} whileHover={{ y: -4 }} transition={{ duration: 0.35, ease }} className="motion-reduce:transform-none">
            <Link to="/login" className="golden-button mx-auto mt-8 !h-12 !px-8 !text-xs transition-all duration-300 hover:shadow-[0_16px_28px_-14px_rgba(192,142,63,0.75)] active:scale-[0.98] motion-reduce:transform-none">Meet Goldie AI</Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}
