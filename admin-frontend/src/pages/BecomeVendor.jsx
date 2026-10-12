import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BadgeCheck, MessageCircle, BarChart2, Camera, ShieldCheck, Zap, ArrowRight, Check, Star, Search, Percent } from 'lucide-react'
import { useGsapScroll } from '../hooks/useGsapScroll.js'
import { Marquee } from '../components/Marquee.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { SplitText } from '../components/SplitText.jsx'

const FEATURES = [
  {
    Icon: BadgeCheck,
    title: 'Verified badge',
    body: 'SSM and NRIC are verified by our team so your listing earns trust immediately.',
  },
  {
    Icon: MessageCircle,
    title: 'Direct WhatsApp',
    body: 'Couples contact you directly on WhatsApp — no forms, no delays, no commission.',
  },
  {
    Icon: BarChart2,
    title: 'Dashboard insights',
    body: 'Monitor views, enquiries and profile performance from one premium dashboard.',
  },
  {
    Icon: Camera,
    title: 'Portfolio showcase',
    body: 'Showcase your best work in a clean gallery that feels editorial and premium.',
  },
  {
    Icon: ShieldCheck,
    title: 'Curated community',
    body: 'Only verified vendors are featured, preserving quality and confidence for every couple.',
  },
  {
    Icon: Zap,
    title: 'Publish anytime',
    body: 'Update your listing instantly so you stay in full control of every detail.',
  },
]

const PLANS = [
  {
    name: 'Free Starter',
    price: 'RM 0',
    desc: 'Perfect for new vendors and home-based studios.',
    perks: ['3 portfolio photos', 'Basic listing', 'Up to 5 services', 'WhatsApp button'],
    featured: false,
  },
  {
    name: 'Premium Member',
    price: 'RM 199',
    desc: 'Best for vendors who want more exposure and refined trust.',
    perks: ['10 portfolio photos', 'Featured placement', 'Up to 20 services', 'Analytics dashboard', 'Brochure upload'],
    featured: true,
  },
  {
    name: 'Elite Partner',
    price: 'RM 499',
    desc: 'Maximum visibility for established wedding brands.',
    perks: ['25 portfolio photos', 'Elite badge', 'Unlimited services', 'Priority support', 'Account manager'],
    featured: false,
  },
]

const TESTIMONIALS_ROW1 = [
  {
    name: 'Fiona Yeoh',
    role: 'Creative Owner, The Bridal Suite',
    quote: 'Golden Promise has completely transformed our enquiries. Couples reach us directly on WhatsApp and the verified badge makes our profile feel premium.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Ahmad Rifqi',
    role: 'Lead Photographer, Cahaya Frames',
    quote: 'Within two weeks of joining, I had three new couple enquiries. The platform feels curated and the quality of leads is excellent.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Priya Nair',
    role: 'Henna Artist & Makeup Stylist',
    quote: 'I love how easy it is to update my portfolio and package details. No commissions means I keep every booking.',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80',
  },
]

const TESTIMONIALS_ROW2 = [
  {
    name: 'Nurul Izzati',
    role: 'Owner, Sweet Nikah Catering',
    quote: 'The dashboard shows exactly how many couples viewed our menu each week. Zero commission means every booking is pure profit.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Kevin Tan',
    role: 'Florist, Bloom & Co',
    quote: 'Verification took two days and our profile felt instantly more trustworthy. Enquiries doubled within the first month.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Farid Hassan',
    role: 'DJ & Emcee, FH Entertainment',
    quote: 'No middleman, no waiting for approvals — couples message me on WhatsApp and we lock in the date the same day.',
    avatar: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=120&q=80',
  },
]

function TestimonialCard({ quote, name, role, avatar }) {
  return (
    <div className="w-[280px] sm:w-[340px] bg-white rounded-2xl p-6 border border-neutral-100/90 shadow-soft flex flex-col justify-between whitespace-normal mx-3 text-left min-h-[190px]">
      <div>
        <div className="flex gap-0.5 text-[#C08E3F] mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
          ))}
        </div>
        <p className="text-xs sm:text-sm text-[#7A5A5E] leading-relaxed mb-4">"{quote}"</p>
      </div>
      <div className="flex items-center gap-3 border-t border-neutral-100/50 pt-3 mt-auto">
        <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover shadow-2xs" />
        <div>
          <h4 className="font-display font-bold text-xs sm:text-sm text-[#4E1218]">{name}</h4>
          <p className="text-[10px] text-[#7A5A5E]/70 font-semibold">{role}</p>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  {
    step: '01',
    title: 'Register & Choose Plan',
    body: 'Sign up with your business details and pick the subscription tier that fits your goals — Free, Premium, or Elite.',
    image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=1000&q=90',
  },
  {
    step: '02',
    title: 'Submit Verification Docs',
    body: 'Upload your SSM certificate, NRIC/passport, and business details. Our admin team reviews within 1–2 business days.',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=90',
  },
  {
    step: '03',
    title: 'Publish & Get Discovered',
    body: 'Once approved, claim your verified badge and go live. Couples across Malaysia can now find and WhatsApp you directly.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=90',
  },
]

function PlanCard({ plan, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
      className={`flex h-full min-h-[540px] flex-col rounded-[32px] p-8 shadow-[0_20px_60px_-30px_rgba(78,18,24,0.35)] ${plan.featured ? 'bg-[#4E1218] text-white' : 'bg-white text-[#4E1218]'}`}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.32em] text-[#C08E3F]">{plan.name}</p>
          <p className="text-4xl font-display font-semibold leading-none">{plan.price}</p>
          <p className={`${plan.featured ? 'text-white/80' : 'text-[#7B1F2A]/75'} text-sm`}>{plan.desc}</p>
        </div>
        <div className="space-y-3">
          {plan.perks.map((perk) => (
            <div key={perk} className="flex items-start gap-3">
              <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-2xl bg-[#C08E3F]/15 text-[#C08E3F]">
                <Check className="h-4 w-4" />
              </span>
              <p className={`${plan.featured ? 'text-white/90' : 'text-[#4E1218]'} text-sm leading-7`}>{perk}</p>
            </div>
          ))}
        </div>
      </div>
      <Link
        to="/become-vendor/apply"
        alt="Apply now"
        className={`btn-apply-reveal mt-auto w-full rounded-full px-3 text-sm font-semibold ${plan.featured ? 'btn-apply-reveal--gold bg-[#C08E3F]' : 'btn-apply-reveal--burgundy bg-[#7B1F2A]'}`}
        style={{ height: '42px' }}
      >
        {'Apply now'.split('').map((ch, i) => (
          <i key={i}>{ch === ' ' ? ' ' : ch}</i>
        ))}
      </Link>
    </motion.div>
  )
}

export default function BecomeVendor() {
  const [activeStep, setActiveStep] = useState(0)

  const stepsSectionRef = useGsapScroll((gsap, ScrollTrigger, el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 250px',
      end: '+=900',
      pin: true,
      pinSpacing: true,
      scrub: 0.5,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const progress = Math.min(1, Math.max(0, self.progress || 0))
        const nextStep = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length))
        setActiveStep(nextStep)
      },
    })
  }, [])

  const featuresRef = useGsapScroll((gsap, ScrollTrigger, el) => {
    const cards = el.querySelectorAll('[data-gsap-card]')
    if (!cards.length) return

    ScrollTrigger.batch(cards, {
      start: 'top 90%',
      onEnter: (batch) =>
        gsap.fromTo(
          batch,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: 'power3.out', overwrite: true },
        ),
      once: true,
    })

    cards.forEach((card) => {
      gsap.fromTo(
        card,
        { scale: 0.98 },
        { scale: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 95%', end: 'bottom 80%', scrub: false } },
      )
    })
  })

  return (
    <div className="overflow-x-hidden bg-[#FAF8F6] text-[#4E1218]">
      <section className="relative overflow-hidden bg-[#FAF8F6] pt-24 pb-24 md:pt-28 md:pb-28">
        <div className="mx-auto grid max-w-[1480px] items-stretch gap-12 px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-[#C08E3F]/20 bg-[#FAEDE6] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#C08E3F] shadow-[0_16px_40px_-24px_rgba(192,142,63,0.6)]">
              <span className="h-2 w-2 rounded-full bg-[#C08E3F] animate-pulse" />
              Become a verified vendor
            </div>
            <div className="space-y-6">
              <SplitText as="h1" className="font-display text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.95] tracking-tight text-[#4E1218]">
                Grow your wedding brand with a curated, commission-free vendor listing.
              </SplitText>
              <Reveal delay={0.3}>
                <p className="max-w-2xl text-base leading-8 text-[#7B1F2A]/80">
                  Showcase your portfolio in a premium editorial format, receive enquiries directly on WhatsApp, and stay in full control of your business without any platform commission.
                </p>
              </Reveal>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/become-vendor/apply"
                className="inline-flex items-center gap-2 rounded-full bg-[#4E1218] px-7 py-4 text-sm font-semibold text-[#FAEDE6] shadow-[0_18px_50px_-28px_rgba(78,18,24,0.45)] transition hover:-translate-y-0.5 hover:bg-[#3d1118]"
              >
                Apply as Vendor
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="#pricing"
                className="inline-flex items-center gap-2 rounded-full border border-[#4E1218] bg-white/90 px-6 py-4 text-sm font-semibold text-[#4E1218] transition hover:bg-[#FAF8F6]"
              >
                View pricing
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {[
                { label: 'Verified badge', Icon: BadgeCheck },
                { label: 'Direct WhatsApp', Icon: MessageCircle },
                { label: 'Priority discovery', Icon: Search },
                { label: 'Zero commission', Icon: Percent },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <item.Icon className="h-4 w-4 text-[#C08E3F]" />
                  <span className="text-sm font-semibold text-[#4E1218]">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto h-full w-full max-w-xl"
          >
            <div className="pointer-events-none absolute -left-8 top-10 h-28 w-28 rounded-full bg-[#C08E3F]/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-6 h-28 w-28 rounded-full bg-[#4E1218]/10 blur-3xl" />
            <div className="h-full overflow-hidden rounded-[32px] bg-white/90 shadow-[0_30px_70px_-40px_rgba(78,18,24,0.35)]">
              <video
                className="h-full w-full object-cover"
                src="https://videos.pexels.com/video-files/5400770/5400770-hd_1920_1080_25fps.mp4"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24" style={{ backgroundColor: '#FCEEE3' }}>
        <div className="mx-auto max-w-[1480px] px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <article>
              <Reveal><p className="text-[11px] uppercase tracking-[0.28em] text-[#C08E3F]">Designed for wedding specialists</p></Reveal>
              <SplitText as="h2" className="mt-4 font-display text-4xl sm:text-5xl text-[#4E1218]">Everything a premium vendor needs to shine.</SplitText>
              <Reveal delay={0.15}>
                <p className="mt-6 max-w-2xl text-base leading-8 text-[#7B1F2A]/80">
                  Golden Promise helps you present your business with editorial polish, verified trust signals, and real demand from high-intent couples.
                </p>
              </Reveal>
            </article>
            <div className="grid gap-5 sm:grid-cols-2">
              {FEATURES.slice(0, 2).map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.15 * index }}
                  className="rounded-[28px] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(78,18,24,0.25)]"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#4E1218]/15 bg-white text-[#7B1F2A]">
                    <feature.Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-[#4E1218]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#7B1F2A]/75">{feature.body}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div ref={featuresRef} className="mt-12 grid gap-5 lg:grid-cols-3">
            {FEATURES.slice(2).map((feature) => (
              <div
                key={feature.title}
                data-gsap-card
                className="rounded-[28px] bg-white p-7 shadow-[0_20px_50px_-30px_rgba(78,18,24,0.25)] opacity-0"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4E1218] text-white">
                  <feature.Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-[#4E1218]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#7B1F2A]/75">{feature.body}</p>
              </div>
            ))}
            <div
              data-gsap-card
              className="lg:col-span-2 h-[260px] overflow-hidden rounded-[28px] shadow-[0_20px_50px_-30px_rgba(78,18,24,0.25)] opacity-0"
            >
              <img
                src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=90"
                alt="Vendor portfolio showcase"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[#FAF8F6] py-28">
        <div className="mx-auto max-w-[1480px] px-6 lg:px-10">
          <div className="text-center">
            <Reveal><p className="text-[11px] uppercase tracking-[0.28em] text-[#C08E3F]">Pricing made easy</p></Reveal>
            <SplitText as="h2" className="mt-4 font-display text-4xl sm:text-5xl text-[#4E1218]">Choose the plan that matches your growth.</SplitText>
          </div>
          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan, planIndex) => (
              <PlanCard key={plan.name} plan={plan} delay={0.08 * planIndex} />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-24 overflow-hidden" style={{ backgroundColor: '#FCEEE3' }}>
        <div className="text-center max-w-2xl mx-auto mb-10 px-6">
          <Reveal>
            <p className="font-script leading-none mb-2" style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', color: '#C08E3F' }}>
              — Testimonials
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display font-medium text-4xl sm:text-5xl text-[#4E1218] leading-tight">
              Trusted by <span className="italic" style={{ color: '#7B1F2A' }}>Malaysian vendors</span>
            </h2>
          </Reveal>
        </div>

        <div className="space-y-6 max-w-[1536px] mx-auto relative px-4">
          <Marquee
            direction="right"
            speed={45}
            className="py-2"
            items={TESTIMONIALS_ROW1.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          />
          <Marquee
            direction="left"
            speed={45}
            className="py-2"
            items={TESTIMONIALS_ROW2.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          />

          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FCEEE3] to-transparent pointer-events-none z-20" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FCEEE3] to-transparent pointer-events-none z-20" />
        </div>
      </section>

      <section ref={stepsSectionRef} className="py-28 bg-[#FAF8F6]">
        <div className="mx-auto max-w-[1480px] px-6 lg:px-10">
          <div className="text-center">
            <Reveal><p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C08E3F]">Simple Process</p></Reveal>
            <SplitText as="h2" className="mt-4 font-display text-4xl sm:text-5xl text-[#4E1218]">Get listed in 3 easy steps</SplitText>
          </div>

          {/* Horizontal step-progress timeline — fills in as the pinned section is scrolled */}
          <div className="mt-16 flex items-center justify-center px-4 sm:px-16">
            {STEPS.map((item, index) => {
              const reached = index <= activeStep
              const lineFilled = index < activeStep
              return (
                <div key={item.step} className="flex flex-1 items-center last:flex-none">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-sm transition-colors duration-500"
                    style={
                      reached
                        ? { backgroundColor: '#4E1218', color: '#FFFFFF' }
                        : { backgroundColor: '#FFFFFF', color: '#4E1218', border: '1px solid rgba(78, 18, 24, 0.15)' }
                    }
                  >
                    {reached ? <Check className="h-4 w-4" /> : item.step}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className="h-px flex-1 transition-colors duration-500"
                      style={{ backgroundColor: lineFilled ? '#4E1218' : 'rgba(78, 18, 24, 0.15)' }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step cards — active card highlights in sync with the timeline above */}
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {STEPS.map((item, index) => {
              const isActive = activeStep === index
              return (
                <div
                  key={item.step}
                  className={`overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-30px_rgba(78,18,24,0.25)] transition-all duration-500 ${
                    isActive ? 'scale-100 opacity-100 ring-1 ring-[#4E1218]/15' : 'scale-[0.97] opacity-60'
                  }`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-8 text-center">
                    <h3 className="font-display text-lg text-[#7B1F2A]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#6B5A5C]">{item.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-32 md:py-40">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="https://assets.mixkit.co/videos/5217/5217-720.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-[#2a0b10]/70" />
        <div className="relative z-10 mx-auto max-w-[900px] px-6 text-center">
          <Reveal><p className="font-script text-5xl text-[#D8AB5A]">Ready to grow?</p></Reveal>
          <SplitText as="h2" className="mt-4 font-display text-4xl sm:text-5xl text-white">Join Golden Promise today.</SplitText>
          <Reveal delay={0.15}>
            <p className="mt-6 text-base leading-8 text-white/80">
              High-intent couples are searching for verified wedding vendors right now.
              Apply and start receiving enquiries directly on WhatsApp.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/become-vendor/apply"
              className="inline-flex items-center gap-2 rounded-full bg-[#C08E3F] px-8 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#b2762f]"
            >
              Apply now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/vendor-login"
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Vendor Login
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
