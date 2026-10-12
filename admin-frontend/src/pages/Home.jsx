import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import {
  Camera, UtensilsCrossed, Cake, Music, Flower2, Sparkles, Brush, Users,
  ArrowRight, ArrowUpRight, ShieldCheck, FileCheck, BadgeCheck,
  MessageCircle, Wallet, CheckSquare, MapPin, Building2, Gem, Palmtree, Star,
} from 'lucide-react'
import { Reveal } from '../components/Reveal.jsx'
import { SplitText } from '../components/SplitText.jsx'
import { Marquee } from '../components/Marquee.jsx'
import { Magnetic } from '../components/Magnetic.jsx'
import { CountUp } from '../components/CountUp.jsx'
import { LiquidBlob } from '../components/LiquidBlob.jsx'
import { WavyDivider } from '../components/WavyDivider.jsx'
import { useGsapScroll } from '../hooks/useGsapScroll.js'
import { vendorCategories } from '../lib/images.js'

const CULTURES = ['Malay', 'Chinese', 'Indian', 'Christian', 'Sikh', 'Civil', 'Iban', 'Kadazan']

// Bento gallery — real Malaysian wedding photography
const GALLERY = [
  { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=90', label: 'Ballroom · Kuala Lumpur' },
  { src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=2000&q=90', label: 'Garden · Penang' },
  { src: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=1600&q=90', label: 'Kompleks' },
  { src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=90', label: 'Mehndi' },
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=90', label: 'Banquet · Ipoh' },
  { src: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1600&q=90', label: 'Cake · artisan' },
]

const categoryIcons = [
  { Icon: Camera,           label: 'Photography', slug: 'videographer-photographer' },
  { Icon: UtensilsCrossed,  label: 'Caterer',     slug: 'caterer' },
  { Icon: Cake,             label: 'Cake',        slug: 'cake-desserts' },
  { Icon: Music,            label: 'Band / DJ',   slug: 'band-dj' },
  { Icon: Flower2,          label: 'Florist',     slug: 'florist' },
  { Icon: Sparkles,         label: 'Henna',       slug: 'henna-artist' },
  { Icon: Brush,            label: 'Makeup',      slug: 'makeup-artist' },
  { Icon: Users,            label: 'Dancers',     slug: 'dancers' },
]
const categoriesWithPhotos = categoryIcons.map((c) => ({
  ...c,
  image: vendorCategories.find((v) => v.slug === c.slug)?.image,
}))

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-[#FAF8F5] relative text-[#2C2A29]">
      <style>{`
        @keyframes mesh-blob-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(45px, -55px) scale(1.1); }
          66% { transform: translate(-35px, 35px) scale(0.95); }
        }
        @keyframes mesh-blob-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-65px, 65px) scale(1.08); }
        }
        .animate-mesh-blob-1 { animation: mesh-blob-1 20s ease-in-out infinite; }
        .animate-mesh-blob-2 { animation: mesh-blob-2 24s ease-in-out infinite; }
      `}</style>

      {/* Global liquid morph accent — scoped to the hero area so it scrolls away instead of
          washing over the whole page. The mask fades the bottom out, otherwise `overflow-hidden`
          leaves a visible hard horizontal edge where the container ends. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[110vh] overflow-hidden [mask-image:linear-gradient(to_bottom,black_45%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_45%,transparent_100%)]">
        <div className="absolute top-[-10%] left-[-15%] w-[70%] h-[70%] rounded-full bg-[#FAEDE6] blur-[140px] opacity-35 animate-mesh-blob-1" />
        <div className="absolute top-[10%] right-[-15%] w-[70%] h-[70%] rounded-full bg-[#E8C7BD] blur-[140px] opacity-35 animate-mesh-blob-2" />
        <LiquidBlob color="#C08E3F" size={520} blur={70} opacity={0.08}
          className="absolute top-[40%] -right-32" duration={20} />
      </div>

      {/* Hero Section */}
      <Hero />

      {/* Benefits Section — `relative z-10` is required, not cosmetic: without a position the
          blob layer above (positioned, z-0) paints over this content per CSS painting order. */}
      <div className="bg-transparent py-6 lg:py-8 relative z-10">
        <EditorialReveal />
      </div>

      {/* Couple Step-by-Step Process Section */}
      <div className="bg-transparent py-8 lg:py-10 border-t border-b border-neutral-100/60 relative z-10">
        <CoupleProcess />
      </div>

      {/* AI Checklist Feature Highlight Section */}
      <div className="bg-transparent pb-8 lg:pb-10 relative z-10">
        <AiChecklistFeature />
      </div>

      {/* Looping Reviews Section */}
      <div className="bg-transparent pb-8 lg:pb-10 relative z-10 overflow-hidden">
        <ReviewLoop />
      </div>


    </div>
  )
}

/* ─────────────────────────────────────────────────── HERO ─────────── */

const BRAND_LOGOS = [
  { name: 'Flexify', icon: Camera },
  { name: 'Codify', icon: Gem },
  { name: 'Flowboard', icon: UtensilsCrossed },
  { name: 'Agentify', icon: Sparkles },
  { name: 'TodoFusion', icon: Flower2 },
  { name: 'Identify', icon: Music },
  { name: 'Nexus', icon: Building2 },
  { name: 'Golden Promise', icon: BadgeCheck },
  { name: 'Majestic Ballroom', icon: Palmtree },
  { name: 'Cahaya Frames', icon: Camera },
]

function Hero() {
  return (
    <section className="relative overflow-hidden pt-5 pb-6 px-4 sm:px-6 lg:px-8 max-w-[1536px] mx-auto min-h-[90vh] sm:min-h-[90vh] lg:min-h-[90vh] flex items-center">
      <div className="w-full">
        {/* Large Rounded Hero Card Container in Off-White */}
        <div className="bg-[#FAF8F5] rounded-[36px] sm:rounded-[48px] p-8 sm:p-10 lg:p-12 relative overflow-hidden shadow-sm border border-[#E8C7BD]/40 text-[#4E1218]">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
            
            {/* LEFT COLUMN: Typography, Description, CTAs, Stats */}
            <div className="flex flex-col justify-center h-full gap-10">
              <div>
                {/* Headline using brand theme colors */}
                <h1 className="font-display font-extrabold text-6xl sm:text-7xl lg:text-[5.5rem] leading-[1.02] tracking-tight text-[#4E1218]">
                  Design Better<br />
                  <span className="font-serif italic font-normal text-[#C08E3F]">Faster Smarter</span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-[#7B1F2A]/80 max-w-lg mt-6 leading-relaxed">
                  Find verified wedding venues, photographers, caterers, and decorators across Malaysia — for couples who want it done well, without commission or middlemen.
                </p>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap gap-3.5 mt-8">
                  <Magnetic>
                    <Link
                      to="/venues"
                      className="inline-flex items-center gap-2 bg-[#4E1218] text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-[#7B1F2A] transition shadow-md active:scale-95 cursor-pointer"
                    >
                      <span>Browse Listings</span>
                    </Link>
                  </Magnetic>

                  <Magnetic>
                    <Link
                      to="/become-vendor"
                      className="inline-flex items-center gap-2 bg-white/90 border border-[#7B1F2A]/20 text-[#4E1218] px-7 py-3.5 rounded-full font-bold text-sm hover:bg-white transition shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <span>Plan Your Wedding</span>
                    </Link>
                  </Magnetic>
                </div>
              </div>

              {/* Bottom Left Stats Counters Row */}
              <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-[#7B1F2A]/15">
                <div>
                  <span className="font-display text-3xl sm:text-4xl font-extrabold text-[#4E1218] block leading-none">
                    1,200+
                  </span>
                  <span className="text-xs text-[#7B1F2A]/70 font-semibold mt-1.5 block">
                    Verified vendors
                  </span>
                </div>
                <div>
                  <span className="font-display text-3xl sm:text-4xl font-extrabold text-[#4E1218] block leading-none">
                    8
                  </span>
                  <span className="text-xs text-[#7B1F2A]/70 font-semibold mt-1.5 block">
                    Malaysian states
                  </span>
                </div>
                <div>
                  <span className="font-display text-3xl sm:text-4xl font-extrabold text-[#4E1218] block leading-none">
                    15,000+
                  </span>
                  <span className="text-xs text-[#7B1F2A]/70 font-semibold mt-1.5 block">
                    Happy couples
                  </span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Editorial Couple Portrait & Floating Glass Overlay Card */}
            <div className="relative">
              {/* Editorial Couple Image */}
              <div className="relative aspect-[4/5] w-full max-w-md lg:max-w-none mx-auto rounded-[32px] overflow-hidden shadow-2xl bg-neutral-200">
                <img
                  src="https://images.unsplash.com/photo-1525772764200-be829a350797?auto=format&fit=crop&w=1200&q=90"
                  alt="Wedding Couple"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Overlaid Floating Glassmorphism Card */}
              <div className="absolute bottom-6 right-6 lg:-bottom-4 lg:-right-4 bg-black/60 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 text-white max-w-xs sm:max-w-sm shadow-2xl space-y-3 z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-neutral-300 uppercase">
                    AI Planning Companion
                  </span>
                  <Link to="/dashboard/budget" className="w-8 h-8 rounded-xl bg-[#C08E3F] text-white grid place-items-center hover:bg-[#D8AB5A] transition shadow-md">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <h4 className="text-base font-bold font-display text-white">
                  Ask Goldie AI
                </h4>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  Generate custom culture-aware wedding budgets and timelines in seconds.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* MOVING BRAND LOGOS TICKER (MARQUEE) — Brought down with extra top spacing */}
        <div className="mt-10 lg:mt-12 mb-4 overflow-hidden py-3 border-y border-[#7B1F2A]/10">
          <Marquee
            speed={35}
            items={BRAND_LOGOS.map((brand, i) => (
              <div key={i} className="flex items-center gap-2.5 mx-8 text-[#4E1218] font-extrabold text-base sm:text-lg tracking-tight">
                <brand.icon className="w-5 h-5 text-[#C08E3F]" />
                <span>{brand.name}</span>
              </div>
            ))}
          />
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────── CULTURE MARQUEE ─────── */

function CultureMarquee() {
  const items = CULTURES.map((c, i) => (
    <span key={i} className="inline-flex items-center gap-8 lg:gap-12 mx-8">
      <span
        className="font-display italic"
        style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', color: '#FAEDE6' }}
      >
        {c}
      </span>
      <span className="text-gold-400 text-2xl">✦</span>
    </span>
  ))
  return (
    <section
      className="gp-marquee-band relative overflow-hidden"
      style={{ backgroundColor: '#4E1218', padding: 'clamp(28px, 4vh, 44px) 0' }}
    >
      <Marquee items={items} speed={45} />
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#4E1218] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#4E1218] to-transparent pointer-events-none" />
    </section>
  )
}

/* ─────────────────────────────────────────── WHAT WE OFFER ─────── */

function WhatWeOffer() {
  const containerRef = useGsapScroll((gsap, ScrollTrigger, el) => {
    const cards = el.querySelectorAll('[data-offer-card]')
    if (!cards.length) return
    ScrollTrigger.batch(cards, {
      start: 'top 90%',
      onEnter: (batch) =>
        gsap.fromTo(
          batch,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 1.1, ease: 'expo.out', overwrite: true },
        ),
      once: true,
    })
    cards.forEach((c) => {
      const img = c.querySelector('img')
      if (!img) return
      gsap.fromTo(
        img,
        { yPercent: -6, scale: 1.08 },
        {
          yPercent: 6,
          scale: 1.0,
          ease: 'none',
          scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
        },
      )
    })
  })

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] lg:min-h-[90vh] flex items-center"
      style={{ padding: 'clamp(60px, 6vh, 100px) clamp(20px, 6vw, 80px)', maxWidth: 1320, margin: '0 auto' }}
    >
      {/* Header row — eyebrow + headline left, CTA right */}
      <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-end mb-12 lg:mb-16">
        <div>
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.28em] font-medium mb-4" style={{ color: '#C08E3F' }}>
              What We Offer
            </p>
            <h2
              className="font-display font-medium"
              style={{
                fontSize: 'clamp(34px, 5vw, 68px)',
                lineHeight: 1.04,
                letterSpacing: '-0.02em',
                color: '#4E1218',
                maxWidth: '14ch',
              }}
            >
              Everything you need,{' '}
              <span className="italic" style={{ color: '#C08E3F' }}>before the "I do."</span>
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <Magnetic>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition hover:opacity-90"
              style={{ backgroundColor: '#4E1218', color: '#FAEDE6' }}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Magnetic>
        </Reveal>
      </div>

      {/* Big featured card — Plan with AI */}
      <div data-offer-card className="mb-4">
        <Link
          to="/dashboard/budget"
          className="group relative block overflow-hidden rounded-[24px]"
          style={{
            aspectRatio: '2.15 / 1',
            boxShadow: '0 30px 80px -20px rgba(78, 18, 24, 0.28)',
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=90"
            alt="Plan with AI"
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
          />
          {/* Base dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(120deg, rgba(78, 18, 24, 0.75) 0%, rgba(78, 18, 24, 0.35) 55%, rgba(78, 18, 24, 0.1) 100%)',
            }}
          />

          {/* Glass "AI POWERED" badge top-left */}
          <div
            className="absolute top-6 left-6 z-10 px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.22em] font-medium inline-flex items-center gap-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(14px) saturate(160%)',
              WebkitBackdropFilter: 'blur(14px) saturate(160%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#FAEDE6',
            }}
          >
            <Sparkles className="w-3 h-3" style={{ color: '#C08E3F' }} />
            AI Powered
          </div>

          {/* Glass CTA pill bottom-right */}
          <div
            className="absolute bottom-6 right-6 z-10 px-5 py-2.5 rounded-full text-sm font-medium inline-flex items-center gap-2 transition group-hover:scale-105"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px) saturate(160%)',
              WebkitBackdropFilter: 'blur(16px) saturate(160%)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              color: '#4E1218',
            }}
          >
            Meet Goldie <ArrowUpRight className="w-4 h-4" />
          </div>

          {/* Bottom-left info block */}
          <div className="absolute bottom-6 left-6 z-10 text-blush-100 max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.22em] mb-2 opacity-80">Powered by Llama 3.3 70B</p>
            <h3 className="font-display leading-tight" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}>
              Plan with Goldie, your AI wedding planner
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm opacity-90">
              <span>Smart Budget</span>
              <span className="opacity-40">•</span>
              <span>Smart Checklist</span>
              <span className="opacity-40">•</span>
              <span>Live Chat</span>
              <span className="opacity-40">•</span>
              <span>Culture-aware</span>
            </div>
          </div>
        </Link>
      </div>

      {/* 2x2 small cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OfferCard
          to="/venues"
          image="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=90"
          badge="30+ Venues"
          eyebrow="All 13 States"
          title="Every Venue"
          desc="Ballrooms, gardens, kompleks, kelenteng — filter by state, religion, and budget."
        />
        <OfferCard
          to="/vendors"
          image="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=1600&q=90"
          badge="22+ Vendors"
          eyebrow="SSM Verified"
          title="Every Vendor"
          desc="Photographers, caterers, florists, henna — WhatsApp them directly, no middleman."
        />
        <OfferCard
          to="/dashboard/budget"
          image="https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&w=1600&q=90"
          badge="Culture-aware"
          eyebrow="AI generated"
          title="Smart Budget"
          desc="Goldie drafts your Malay, Chinese, Indian or Christian breakdown in seconds."
        />
        <OfferCard
          to="/dashboard/checklist"
          image="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1600&q=90"
          badge="Grouped by tradition"
          eyebrow="AI generated"
          title="Smart Checklist"
          desc="From booking the kadi to confirming tea-ceremony elders — never miss a step."
        />
      </div>
    </section>
  )
}

function OfferCard({ to, image, badge, eyebrow, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="w-full h-full"
    >
      <Link
        data-offer-card
        to={to}
        className="group relative block overflow-hidden rounded-[28px] h-full"
        style={{
          aspectRatio: '1.55 / 1',
          boxShadow: '0 25px 60px -20px rgba(78, 18, 24, 0.22)',
        }}
      >
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Base darkening gradient */}
        <div
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"
          style={{
            background: 'linear-gradient(180deg, rgba(78, 18, 24, 0.1) 0%, rgba(78, 18, 24, 0.72) 100%)',
          }}
        />
        {/* Glass hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(180deg, rgba(78, 18, 24, 0.5), rgba(78, 18, 24, 0.7))',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        />

        {/* Glass badge top-left */}
        <div
          className="absolute top-5 left-5 z-10 px-3.5 py-1 rounded-full text-[10px] uppercase tracking-[0.22em] font-medium"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(14px) saturate(160%)',
            WebkitBackdropFilter: 'blur(14px) saturate(160%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#FAEDE6',
          }}
        >
          {badge}
        </div>

        {/* Info block bottom-left */}
        <div className="absolute inset-x-6 bottom-6 z-10 text-blush-100">
          <p className="text-[10px] uppercase tracking-[0.24em] mb-1.5 opacity-80">{eyebrow}</p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display leading-tight" style={{ fontSize: 'clamp(24px, 2.2vw, 32px)' }}>
                {title}
              </h3>
              <p className="mt-2 text-sm opacity-90 max-w-md leading-snug">{desc}</p>
            </div>
            <span
              className="shrink-0 w-11 h-11 rounded-full grid place-items-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(14px) saturate(160%)',
                WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
              }}
            >
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ─────────────────────────────────────────── REAL WEDDINGS ───────── */

function RealWeddings() {
  // GSAP scroll-scrubbed parallax on each bento tile — tiles drift up at
  // slightly different speeds, creating a soft magazine-spread effect.
  const containerRef = useGsapScroll((gsap, ScrollTrigger, el) => {
    const tiles = el.querySelectorAll('[data-bento-tile]')
    tiles.forEach((tile, i) => {
      const img = tile.querySelector('img')
      if (!img) return
      // Each image slowly scales + drifts up as its tile scrolls through view
      gsap.fromTo(
        img,
        { yPercent: -8, scale: 1.15 },
        {
          yPercent: 8,
          scale: 1.0,
          ease: 'none',
          scrollTrigger: {
            trigger: tile,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        },
      )
    })
  })

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] lg:min-h-[90vh] flex items-center"
      style={{ padding: 'clamp(60px, 6vh, 100px) clamp(20px, 6vw, 80px)', maxWidth: 1320, margin: '0 auto' }}
    >
      <div className="text-center" style={{ marginBottom: 'clamp(40px, 6vh, 64px)' }}>
        <Reveal>
          <p
            className="font-script leading-none mb-2"
            style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', color: '#C08E3F' }}
          >
            — Real weddings
          </p>
          <h2
            className="font-display font-medium mb-4"
            style={{ fontSize: 'clamp(34px, 5vw, 68px)', lineHeight: 1.04, letterSpacing: '-0.01em', color: '#4E1218' }}
          >
            Moments worth{' '}
            <span className="italic" style={{ color: '#7B1F2A' }}>remembering</span>
          </h2>
          <p className="mx-auto leading-relaxed" style={{ maxWidth: 480, fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#8A6A6E' }}>
            From grand ballrooms to garden mehndi — a glimpse of what's possible across Malaysia.
          </p>
        </Reveal>
      </div>

      {/* Bento grid — 4 columns, spans: [2x2, 1x2, 1x1, 1x1, 1x2, 1x1] */}
      <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[180px] lg:auto-rows-[210px] gap-4">
        <BentoTile item={GALLERY[0]} className="col-span-2 row-span-2" delay={0} />
        <BentoTile item={GALLERY[1]} className="col-span-2 row-span-1" delay={0.08} />
        <BentoTile item={GALLERY[2]} className="col-span-1 row-span-1" delay={0.16} />
        <BentoTile item={GALLERY[3]} className="col-span-1 row-span-1" delay={0.24} />
        <BentoTile item={GALLERY[4]} className="col-span-2 row-span-2" delay={0.32} />
        <BentoTile item={GALLERY[5]} className="col-span-2 row-span-1" delay={0.4} />
      </div>
    </section>
  )
}

function BentoTile({ item, className = '', delay = 0 }) {
  return (
    <Reveal delay={delay} className={className}>
      <div
        data-bento-tile
        className="group relative w-full h-full overflow-hidden rounded-lg"
        style={{ boxShadow: '0px 14px 34px rgba(78, 18, 24, 0.14)' }}
      >
        <img
          src={item.src}
          alt={item.label}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
        <div
          className="absolute inset-x-0 bottom-0 p-4 lg:p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-display italic text-blush-100"
          style={{
            fontSize: 'clamp(16px, 1.4vw, 20px)',
            background: 'linear-gradient(transparent, rgba(78, 18, 24, 0.7))',
          }}
        >
          {item.label}
        </div>
      </div>
    </Reveal>
  )
}

/* ─────────────────────────────────────────── HOW IT WORKS ────────── */

const STEPS = [
  {
    n: '001',
    title: 'Discover',
    body: 'Filter by state, religion and budget. Every listing is verified against an SSM business registration, so you only ever see the real thing.',
    tags: ['By state', 'By religion', 'SSM verified'],
    Icon: MapPin,
  },
  {
    n: '002',
    title: 'Shortlist',
    body: 'Save your favourites to one place. Goldie, your AI planner, builds a budget around your culture\'s real customs — from hantaran to the tea ceremony.',
    tags: ['Save favourites', 'Budget by culture'],
    Icon: Wallet,
  },
  {
    n: '003',
    title: 'Reach out',
    body: 'Message vendors directly on WhatsApp. No commission, no booking fees — just a real conversation with the people who\'ll make your day.',
    tags: ['Chat on WhatsApp'],
    Icon: MessageCircle,
  },
]

function HowItWorks() {
  return (
    <section
      id="how"
      className="relative max-w-5xl mx-auto px-6 lg:px-10 py-16 lg:py-0 min-h-[90vh] lg:min-h-[90vh] flex flex-col justify-center"
    >
      <div className="text-center mb-16">
        <Reveal>
          <p className="font-script leading-none mb-2" style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', color: '#C08E3F' }}>
            — How it works
          </p>
          <h2 className="font-display font-medium mb-5" style={{ fontSize: 'clamp(36px, 5.4vw, 76px)', lineHeight: 1.02, letterSpacing: '-0.02em', color: '#4E1218' }}>
            Three steps <span className="italic block" style={{ color: '#7B1F2A' }}>to yes</span>
          </h2>
          <p className="mx-auto leading-relaxed" style={{ maxWidth: 520, fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#8A6A6E' }}>
            No agents, no commission. Just you, the vendors, and a directory built for how Malaysia truly celebrates.
          </p>
        </Reveal>
      </div>

      {/* Sticky Card Stacking Container */}
      <div className="space-y-12 max-w-4xl mx-auto relative pb-20">
        {STEPS.map((s, idx) => (
          <div
            key={s.n}
            className="sticky top-[140px] bg-white border border-burgundy-200/40 shadow-[0_35px_80px_-20px_rgba(78,18,24,0.12)] rounded-[36px] p-8 lg:p-12 flex flex-col md:flex-row items-center gap-8 lg:gap-16 transition-all duration-300"
            style={{
              transform: `translateY(${idx * 16}px) scale(${1 - (STEPS.length - 1 - idx) * 0.02})`,
              zIndex: idx + 1,
            }}
          >
            {/* Number & Icon */}
            <div className="relative shrink-0">
              <div
                className="font-display font-semibold leading-none select-none"
                style={{ fontSize: 'clamp(100px, 14vw, 180px)', color: 'rgba(192, 142, 63, 0.15)', letterSpacing: '-0.05em' }}
              >
                {s.n}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full grid place-items-center shadow-lg"
                style={{ backgroundColor: '#7B1F2A' }}>
                <s.Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
            </div>

            {/* Copy */}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C08E3F] mb-2 block">Step {idx + 1}</span>
              <h3 className="font-display font-medium mb-3 text-burgundy-950" style={{ fontSize: 'clamp(26px, 3.2vw, 42px)', letterSpacing: '-0.01em' }}>
                {s.title}
              </h3>
              <p className="leading-relaxed mb-6 text-sm text-burgundy-750">
                {s.body}
              </p>
              <div className="flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] font-bold uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full bg-burgundy-900/5 text-burgundy-900 border border-burgundy-900/5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}


/* ─────────────────────────────────────────── GOLDIE AI ────────────── */

function GoldieAI() {
  return (
    <section className="relative min-h-[90vh] lg:min-h-[90vh] flex items-center w-full" style={{ backgroundColor: '#FAEDE6', padding: 'clamp(60px, 6vh, 100px) clamp(20px, 6vw, 80px)' }}>
      <div className="max-w-[1180px] mx-auto">
        <div className="text-center mb-14 lg:mb-20">
          <Reveal>
            <p className="font-script leading-none mb-2" style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', color: '#C08E3F' }}>
              — Meet Goldie
            </p>
            <h2 className="font-display font-medium mb-5" style={{ fontSize: 'clamp(36px, 5.4vw, 76px)', lineHeight: 1.02, letterSpacing: '-0.02em', color: '#4E1218' }}>
              Your{' '}
              <span className="italic" style={{ color: '#7B1F2A' }}>AI wedding planner</span>
            </h2>
            <p className="mx-auto leading-relaxed" style={{ maxWidth: 560, fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#7A5A5E' }}>
              Culture-aware. Malaysia-specific. Free. Goldie builds your budget, your checklist,
              and answers every question — tuned to how your culture celebrates.
            </p>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Budget card */}
          <GoldieCard
            label="Smart Budget"
            model="Llama 3.3 70B"
            desc="A full budget broken down by your culture's real categories — hantaran, tea ceremony, and all."
            to="/dashboard/budget"
            delay={0}
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em] mb-4" style={{ color: '#8A6A6E' }}>
              <span>Malay wedding · 300 guests</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Generating
              </span>
            </div>
            <div className="space-y-3">
              {[
                ['Venue & dewan', 'RM 15,000'],
                ['Hantaran', 'RM 3,500'],
                ['Photography', 'RM 4,000'],
                ['Catering', 'RM 8,000'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm" style={{ color: '#4E1218' }}>
                  <span>{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
              <div className="pt-3 mt-3 border-t flex justify-between font-display italic text-lg" style={{ borderColor: 'rgba(123, 31, 42, 0.1)', color: '#7B1F2A' }}>
                <span>Total</span>
                <span>RM 30,500</span>
              </div>
            </div>
          </GoldieCard>

          {/* Checklist card */}
          <GoldieCard
            label="Smart Checklist"
            model="Culture-grouped"
            desc="Every to-do, grouped by tradition — from booking the kadi to confirming the tea-ceremony elders."
            to="/dashboard/checklist"
            delay={0.1}
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em] mb-4" style={{ color: '#8A6A6E' }}>
              <span>Ceremony · Malay</span>
              <span className="font-medium" style={{ color: '#C08E3F' }}>52%</span>
            </div>
            <div className="space-y-2.5">
              {[
                [true, 'Book kadi & register nikah'],
                [true, 'Confirm khatam Quran'],
                [false, 'Arrange pelamin & dais'],
                [false, 'Book kompang & bunga manggar'],
              ].map(([done, task], idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm" style={{ color: done ? '#8A6A6E' : '#4E1218' }}>
                  <span
                    className="w-5 h-5 rounded-md border grid place-items-center shrink-0"
                    style={{
                      borderColor: done ? '#C08E3F' : 'rgba(123, 31, 42, 0.25)',
                      backgroundColor: done ? '#C08E3F' : 'transparent',
                    }}
                  >
                    {done && <span className="text-white text-xs">✓</span>}
                  </span>
                  <span className={done ? 'line-through' : ''}>{task}</span>
                </div>
              ))}
            </div>
          </GoldieCard>

          {/* Ask Goldie card */}
          <GoldieCard
            label="Ask Goldie"
            model="Live chat"
            desc="Ask anything. Goldie answers with real Malaysian numbers, tuned to your culture and guest count."
            to="/dashboard/budget"
            delay={0.2}
          >
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-[0.15em] mb-2" style={{ color: '#8A6A6E' }}>You</div>
              <div className="rounded-2xl rounded-tl-sm p-3 text-sm" style={{ backgroundColor: 'rgba(123, 31, 42, 0.08)', color: '#4E1218' }}>
                How much should I spend on flowers for a Chinese wedding of 300 guests?
              </div>
              <div className="text-xs uppercase tracking-[0.15em] mt-4" style={{ color: '#8A6A6E' }}>Goldie</div>
              <div className="rounded-2xl rounded-tr-sm p-3 text-sm" style={{ backgroundColor: '#7B1F2A', color: '#FAEDE6' }}>
                For 300 guests, budget RM 3,000–5,000: a bridal bouquet, ~30 table centrepieces
                and a photo-wall backdrop. Peonies push it higher.
              </div>
            </div>
          </GoldieCard>
        </div>
      </div>
    </section>
  )
}

function GoldieCard({ label, model, desc, to, children, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <Link
        to={to}
        className="group flex flex-col h-full bg-white rounded-[20px] overflow-hidden transition-transform duration-500 hover:-translate-y-1"
        style={{
          border: '1px solid rgba(123, 31, 42, 0.08)',
          boxShadow: '0px 24px 56px rgba(78, 18, 24, 0.09)',
        }}
      >
        <div className="p-7 pb-5 border-b" style={{ borderColor: 'rgba(123, 31, 42, 0.06)' }}>
          <div className="flex items-baseline justify-between">
            <h3 className="font-display font-medium text-2xl" style={{ color: '#4E1218' }}>{label}</h3>
            <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: '#C08E3F' }}>{model}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#7A5A5E' }}>{desc}</p>
        </div>
        <div className="p-7 flex-1">
          {children}
        </div>
        <div className="px-7 py-4 border-t flex items-center justify-between text-xs uppercase tracking-[0.18em]"
          style={{ borderColor: 'rgba(123, 31, 42, 0.06)', color: '#7B1F2A' }}>
          Open
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </Link>
    </Reveal>
  )
}

/* ─────────────────────────────────────────── DASHBOARD PREVIEW ─── */

function DashboardPreview() {
  return (
    <section className="relative min-h-[90vh] lg:min-h-[90vh] flex flex-col justify-center" style={{ padding: 'clamp(60px, 6vh, 100px) clamp(20px, 6vw, 80px)', maxWidth: 1180, margin: '0 auto' }}>
      <div className="text-center mb-14 lg:mb-20">
        <Reveal>
          <p className="font-script leading-none mb-2" style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', color: '#C08E3F' }}>
            — Your dashboard
          </p>
          <h2 className="font-display font-medium" style={{ fontSize: 'clamp(36px, 5.4vw, 76px)', lineHeight: 1.02, letterSpacing: '-0.02em', color: '#4E1218' }}>
            Your wedding, <span className="italic" style={{ color: '#7B1F2A' }}>all in one place</span>
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div
          className="rounded-[20px] overflow-hidden bg-white"
          style={{ border: '1px solid rgba(123, 31, 42, 0.1)', boxShadow: '0px 40px 80px rgba(78, 18, 24, 0.13)' }}
        >
          {/* Browser chrome */}
          <div className="px-5 py-3 flex items-center gap-3 border-b" style={{ borderColor: 'rgba(123, 31, 42, 0.08)', backgroundColor: '#FAF5F2' }}>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
            </div>
            <div className="flex-1 text-center text-xs" style={{ color: '#8A6A6E' }}>
              goldenpromise.my / dashboard
            </div>
          </div>

          {/* Dashboard body */}
          <div className="grid lg:grid-cols-[1.1fr_1.4fr] gap-0">
            {/* Left: profile + countdown */}
            <div className="p-8 lg:p-10 space-y-6" style={{ backgroundColor: '#FAEDE6' }}>
              <div>
                <p className="font-script text-3xl" style={{ color: '#7B1F2A' }}>Yaashini & Partner</p>
                <p className="mt-1 text-sm" style={{ color: '#8A6A6E' }}>Kuala Lumpur, Malaysia</p>
              </div>

              <div className="pt-6 border-t" style={{ borderColor: 'rgba(123, 31, 42, 0.15)' }}>
                <p className="font-display font-medium leading-none" style={{ fontSize: 68, color: '#4E1218' }}>
                  <CountUp to={183} />
                </p>
                <p className="mt-1 text-sm" style={{ color: '#8A6A6E' }}>days to go</p>
                <p className="mt-0.5 text-xs uppercase tracking-[0.2em]" style={{ color: '#C08E3F' }}>until 12 Dec 2026</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.22em] mb-3" style={{ color: '#8A6A6E' }}>Our culture</p>
                <div className="flex flex-wrap gap-2">
                  {['Malay', 'Chinese', 'Indian', 'Christian', 'Sikh'].map((c, i) => (
                    <span
                      key={c}
                      className="px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: i === 0 ? '#7B1F2A' : 'transparent',
                        color: i === 0 ? '#FAEDE6' : '#7B1F2A',
                        border: i === 0 ? 'none' : '1px solid rgba(123, 31, 42, 0.25)',
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: quick links */}
            <div className="p-8 lg:p-10 space-y-3">
              <p className="text-xs uppercase tracking-[0.22em] mb-4" style={{ color: '#8A6A6E' }}>Quick links</p>
              {[
                { label: 'Budget',     value: 'RM 30,500 planned',       to: '/dashboard/budget',    Icon: Wallet },
                { label: 'Checklist',  value: '18 of 34 done',           to: '/dashboard/checklist', Icon: CheckSquare },
                { label: 'Favourites', value: '7 saved',                 to: '/dashboard/favorites', Icon: Sparkles },
                { label: 'Vendors',    value: '22 in your state',        to: '/vendors',             Icon: Users },
                { label: 'Venues',     value: '30 verified · all 13 states', to: '/venues',          Icon: MapPin },
              ].map((r, i) => (
                <Link
                  key={r.label}
                  to={r.to}
                  className="group flex items-center justify-between py-4 border-b transition"
                  style={{ borderColor: 'rgba(123, 31, 42, 0.08)' }}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full grid place-items-center transition-colors group-hover:bg-burgundy-900" style={{ backgroundColor: 'rgba(123, 31, 42, 0.08)' }}>
                      <r.Icon className="w-4 h-4 text-burgundy-800 group-hover:text-blush-100 transition-colors" strokeWidth={1.5} />
                    </span>
                    <div>
                      <p className="font-display text-lg" style={{ color: '#4E1218' }}>{r.label}</p>
                      <p className="text-xs" style={{ color: '#8A6A6E' }}>{r.value}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" style={{ color: '#7B1F2A' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ─────────────────────────────────────────── STATS BAND ─────────── */

function StatsBand() {
  const stats = [
    { to: 30,  label: 'Verified Venues',  suffix: '+' },
    { to: 22,  label: 'Trusted Vendors',  suffix: '+' },
    { to: 13,  label: 'States Covered',   suffix: '' },
    { to: 100, label: 'Made in Malaysia', suffix: '%' },
  ]

  // GSAP scrub: the four numbers count up in sync with scroll progress
  // through the section, so they tick as user scrolls (not one-shot).
  const containerRef = useGsapScroll((gsap, ScrollTrigger, el) => {
    const nums = el.querySelectorAll('[data-stat-value]')
    nums.forEach((n) => {
      const target = parseInt(n.dataset.statValue, 10)
      const suffix = n.dataset.statSuffix || ''
      const obj = { v: 0 }
      gsap.to(obj, {
        v: target,
        ease: 'none',
        onUpdate: () => { n.textContent = Math.round(obj.v).toLocaleString() + suffix },
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: 1,
        },
      })
    })
  })

  return (
    <section ref={containerRef} className="relative overflow-hidden" style={{ backgroundColor: '#4E1218', padding: 'clamp(60px, 10vh, 120px) clamp(20px, 6vw, 80px)' }}>
      <LiquidBlob color="#C08E3F" size={520} blur={70} opacity={0.15}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" duration={19} />
      <div className="relative max-w-[1180px] mx-auto">
        <div className="text-center mb-14 lg:mb-20">
          <Reveal>
            <p className="font-script leading-none mb-2" style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', color: '#C08E3F' }}>
              — By the numbers
            </p>
            <h2 className="font-display font-medium" style={{ fontSize: 'clamp(30px, 4.4vw, 60px)', color: '#FAEDE6', lineHeight: 1.05 }}>
              Trusted, quietly, <span className="italic" style={{ color: '#C08E3F' }}>across Malaysia</span>
            </h2>
          </Reveal>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div>
                <p className="font-display font-medium leading-none" style={{ fontSize: 'clamp(48px, 6.5vw, 96px)', color: '#FAEDE6' }}>
                  <span data-stat-value={s.to} data-stat-suffix={s.suffix}>0{s.suffix}</span>
                </p>
                <p className="mt-4 uppercase tracking-[0.25em] text-xs" style={{ color: 'rgba(250, 237, 230, 0.6)' }}>
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────── CATEGORIES ─────────── */

function Categories() {
  return (
    <section className="relative min-h-[90vh] lg:min-h-[90vh] flex flex-col justify-center" style={{ padding: 'clamp(60px, 6vh, 100px) clamp(20px, 6vw, 80px)', maxWidth: 1320, margin: '0 auto' }}>
      <div className="text-center mb-14 lg:mb-20">
        <Reveal>
          <p className="font-script leading-none mb-2" style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', color: '#C08E3F' }}>
            — Every kind of vendor
          </p>
          <h2 className="font-display font-medium" style={{ fontSize: 'clamp(36px, 5.4vw, 76px)', lineHeight: 1.02, letterSpacing: '-0.02em', color: '#4E1218' }}>
            Browse by <span className="italic" style={{ color: '#7B1F2A' }}>category</span>
          </h2>
        </Reveal>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categoriesWithPhotos.map(({ Icon, label, slug, image }, i) => (
          <Reveal key={slug} delay={(i % 4) * 0.06}>
            <Link
              to={`/vendors/${slug}`}
              className="group relative block overflow-hidden rounded-lg cursor-pointer"
              style={{
                aspectRatio: '3 / 4',
                boxShadow: '0px 14px 34px rgba(78, 18, 24, 0.14)',
              }}
            >
              <img
                src={image}
                alt={label}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(78, 18, 24, 0) 40%, rgba(78, 18, 24, 0.85) 100%)' }} />

              <div className="relative z-10 h-full flex flex-col justify-between p-5">
                <span className="w-11 h-11 rounded-full grid place-items-center self-start backdrop-blur-sm border"
                  style={{ backgroundColor: 'rgba(250, 237, 230, 0.15)', borderColor: 'rgba(250, 237, 230, 0.3)' }}>
                  <Icon className="w-4 h-4" style={{ color: '#FAEDE6' }} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="font-display" style={{ fontSize: 'clamp(20px, 1.8vw, 26px)', color: '#FAEDE6' }}>
                    {label}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em]" style={{ color: 'rgba(250, 237, 230, 0.85)' }}>
                    Explore
                    <ArrowRight className="w-3 h-3 -translate-x-0.5 group-hover:translate-x-0 transition-transform duration-500" />
                  </div>
                </div>
              </div>

              <span className="absolute bottom-0 left-5 right-5 h-px z-10 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                style={{ backgroundColor: '#C08E3F' }} />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────── VERIFIED ───────────── */

function Verified() {
  const badges = [
    { Icon: ShieldCheck, title: 'SSM verified',    body: 'Registered business, checked before listing.' },
    { Icon: BadgeCheck,  title: 'IC & documents',  body: 'Identity confirmed for every vendor.' },
    { Icon: FileCheck,   title: 'Bank verified',   body: 'A real payout account behind every name.' },
  ]
  return (
    <section className="relative lg:min-h-[60vh] flex items-center w-full" style={{ padding: '40px clamp(20px, 6vw, 80px)' }}>
      <Reveal>
        <div
          className="max-w-[1200px] mx-auto"
          style={{
            backgroundColor: '#FAEDE6',
            borderRadius: 24,
            padding: 'clamp(40px, 6vw, 72px)',
          }}
        >
          <div className="text-center mb-10 lg:mb-14">
            <p className="font-script leading-none mb-2" style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: '#C08E3F' }}>
              — Verified
            </p>
            <h2 className="font-display font-medium" style={{ fontSize: 'clamp(28px, 4vw, 54px)', lineHeight: 1.05, letterSpacing: '-0.01em', color: '#4E1218' }}>
              Scam-free <span className="italic" style={{ color: '#7B1F2A' }}>by design</span>
            </h2>
            <p className="mx-auto mt-5 leading-relaxed" style={{ maxWidth: 540, fontSize: 'clamp(15px, 1.5vw, 17px)', color: '#7A5A5E' }}>
              Every vendor is verified with an SSM certificate, IC, and bank details before they ever appear on Golden Promise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {badges.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.08}>
                <div className="text-center">
                  <span className="inline-flex w-14 h-14 rounded-full items-center justify-center mb-4" style={{ backgroundColor: '#7B1F2A' }}>
                    <b.Icon className="w-6 h-6" style={{ color: '#C08E3F' }} strokeWidth={1.5} />
                  </span>
                  <p className="font-display text-xl mb-2" style={{ color: '#4E1218' }}>{b.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#7A5A5E' }}>{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ─────────────────────────────────────────── CLOSER ─────────────── */

function Closer() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] lg:min-h-[90vh] flex items-center justify-center w-full" style={{ backgroundColor: '#4E1218', padding: 'clamp(80px, 6vh, 120px) clamp(20px, 6vw, 80px)' }}>
      <LiquidBlob color="#C08E3F" size={520} blur={80} opacity={0.18}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" duration={18} />

      <div className="relative max-w-3xl mx-auto text-center">
        <Reveal>
          <p className="font-script leading-none mb-4" style={{ fontSize: 'clamp(36px, 4.5vw, 58px)', color: '#C08E3F' }}>
            Ready to say yes?
          </p>
          <h2 className="font-display font-medium mb-10" style={{ fontSize: 'clamp(40px, 6vw, 88px)', lineHeight: 1.02, letterSpacing: '-0.02em', color: '#FAEDE6' }}>
            Your <span className="italic" style={{ color: '#C08E3F' }}>Golden Promise</span> starts here
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Magnetic>
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-medium transition"
                style={{ backgroundColor: '#FAEDE6', color: '#4E1218' }}
              >
                Create your account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                to="/become-vendor"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-medium border transition hover:bg-blush-100 hover:text-burgundy-950"
                style={{ borderColor: 'rgba(250, 237, 230, 0.4)', color: '#FAEDE6' }}
              >
                List your business
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────── EDITORIAL REVEAL ─────── */

function EditorialReveal() {
  return (
    <section className="max-w-[1536px] mx-auto px-6 lg:px-12 py-8 sm:py-10 lg:py-12 text-center min-h-[90vh] lg:min-h-[90vh] flex flex-col justify-center">
      {/* Main Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 70, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: 0.05, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[#4E1218] tracking-tight"
      >
        Discover why we <span className="font-serif italic font-normal text-[#7B1F2A]">stand out</span>
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ delay: 0.14, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-sm sm:text-base text-[#7A5A5E] max-w-2xl mx-auto mt-4 leading-relaxed"
      >
        Connecting Malaysian couples directly with verified venues & vendors — with culture-aware AI tools, full transparency, and zero middlemen.
      </motion.p>

      {/* Asymmetric Bento Grid matching screenshot layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.85fr] gap-8 lg:gap-10 mt-10 lg:mt-12 text-left items-stretch">
        
        {/* LEFT COLUMN: Tall Vertical Card */}
        <div className="flex flex-col justify-between space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.18, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="group bg-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex-1 flex flex-col justify-between overflow-hidden"
          >
            <div>
              {/* Image bleeds flush to the card's own top/left/right edges — no padding gap */}
              <div className="aspect-[4/3] overflow-hidden relative bg-neutral-100">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=90"
                  alt="Verified Directory"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </div>

              <div className="px-6 sm:px-7 pt-6 sm:pt-7">
                <h3 className="font-display font-bold text-2xl text-[#4E1218] mb-2.5 group-hover:text-[#7B1F2A] transition">
                  Verified directory & SSM
                </h3>

                <p className="text-sm text-[#7A5A5E] leading-relaxed mb-6">
                  Connect directly with admin-verified Malaysian vendors. No middleman fees, no hidden commissions, and no fake listings.
                </p>
              </div>
            </div>

            <div className="px-6 sm:px-7 pb-6 sm:pb-7">
              <Link to="/vendors" className="btn-shine text-xs font-bold">
                Learn more
              </Link>
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN: 2 Stacked Horizontal Cards matching screenshot */}
        <div className="space-y-8 flex flex-col justify-between">
          
          {/* Top Horizontal Card: AI Budget & Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.28, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="group bg-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex-1 overflow-hidden"
          >
            <div className="grid sm:grid-cols-[1.1fr_1fr] gap-6 items-stretch h-full">
              {/* Image bleeds flush to the card's own left/top/bottom edges — no padding gap */}
              <div className="aspect-[4/3] sm:aspect-auto overflow-hidden relative bg-neutral-100 h-full min-h-[180px]">
                <img
                  src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=90"
                  alt="AI Budget Planning"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Text Content — keeps its own padding on the outer (right/top/bottom) sides */}
              <div className="flex flex-col justify-between h-full py-6 pr-6 sm:py-7 sm:pr-7">
                <div>
                  <h3 className="font-display font-bold text-2xl text-[#4E1218] mb-2.5 group-hover:text-[#7B1F2A] transition">
                    AI budget & checklist
                  </h3>

                  <p className="text-sm text-[#7A5A5E] leading-relaxed mb-6">
                    Plan Malay, Chinese, Indian, or multicultural weddings effortlessly with AI-powered budget calculations and automated timelines.
                  </p>
                </div>

                <Link to="/dashboard/budget" className="btn-shine text-xs font-bold">
                  Learn more
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Bottom Horizontal Card: Direct WhatsApp Booking */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.36, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="group bg-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex-1 overflow-hidden"
          >
            <div className="grid sm:grid-cols-[1.1fr_1fr] gap-6 items-stretch h-full">
              {/* Image bleeds flush to the card's own left/top/bottom edges — no padding gap */}
              <div className="aspect-[4/3] sm:aspect-auto overflow-hidden relative bg-neutral-100 h-full min-h-[180px]">
                <img
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=90"
                  alt="Direct WhatsApp Booking"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Text Content — keeps its own padding on the outer (right/top/bottom) sides */}
              <div className="flex flex-col justify-between h-full py-6 pr-6 sm:py-7 sm:pr-7">
                <div>
                  <h3 className="font-display font-bold text-2xl text-[#4E1218] mb-2.5 group-hover:text-[#7B1F2A] transition">
                    Direct WhatsApp booking
                  </h3>

                  <p className="text-sm text-[#7A5A5E] leading-relaxed mb-6">
                    Reach vendors on WhatsApp instantly. Negotiate packages, inspect high-res portfolios, and confirm dates directly.
                  </p>
                </div>

                <Link to="/vendors" className="btn-shine text-xs font-bold">
                  Learn more
                </Link>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}

/* ─────────────────────────────────────────── COUPLE PROCESS ───────── */

function CoupleProcess() {
  const [activeStep, setActiveStep] = useState(0)
  const [lineHeight, setLineHeight] = useState(0)
  const [totalLineHeight, setTotalLineHeight] = useState(0)
  const stepsRef = useRef([])

  const STEPS = [
    {
      title: 'Discovery',
      desc: 'Filter verified venues and vendors across Malaysia. Browse by state, guest capacity, and budget to find your perfect matches.',
      Icon: MapPin,
    },
    {
      title: 'Shortlist',
      desc: 'Save your favorite venues and vendors to your dashboard. Keep your top choices organized in one central place.',
      Icon: Gem,
    },
    {
      title: 'AI Planning',
      desc: 'Let Goldie AI generate a custom budget and checklist tailored specifically to your cultural traditions and guest count.',
      Icon: Sparkles,
    },
    {
      title: 'Direct Contact',
      desc: 'Connect directly with vendors on WhatsApp. Negotiate packages, confirm dates, and book without middleman fees or commission.',
      Icon: MessageCircle,
    },
    {
      title: 'Track Progress',
      desc: 'Update actual costs, check off completed tasks, and view your wedding countdown dynamically on your couple dashboard.',
      Icon: CheckSquare,
    },
  ]

  const sectionRef = useGsapScroll((gsap, ScrollTrigger, el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 250px',
      // Fixed, explicit scroll distance — NOT derived from el.offsetHeight. This section's
      // only child used to be a `h-screen` (100vh) wrapper left over from the old CSS-sticky
      // technique, which made el.offsetHeight silently track the viewport's own height rather
      // than the actual content size. That div has been removed, but to stay robust against
      // any future viewport-dependent styling here, this distance is a flat pixel value tuned
      // by eye against the section's real content height (~700-750px unconstrained).
      // Doubled from 850 to slow the step-to-step pacing — each of the 5 steps now gets
      // ~340px of scroll instead of ~170px, so the same scroll gesture advances less.
      end: '+=1700',
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
  }, [STEPS.length])

  useEffect(() => {
    function updateLine() {
      const topOfFirst = stepsRef.current[0]?.offsetTop + 52
      const activeEl = stepsRef.current[activeStep]
      if (activeEl) {
        setLineHeight((activeEl.offsetTop + 52) - topOfFirst)
      }
      // Static track line must end exactly at the LAST icon's own center — not an
      // assumed fixed offset from the container's bottom, which drifts from the real
      // value whenever card heights vary and leaves a stray tail past the last icon.
      const lastEl = stepsRef.current[STEPS.length - 1]
      if (lastEl) {
        setTotalLineHeight((lastEl.offsetTop + 52) - topOfFirst)
      }
    }

    const timer = setTimeout(updateLine, 100)
    window.addEventListener('resize', updateLine)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateLine)
    }
  }, [activeStep, STEPS.length])

  return (
    <section
      ref={sectionRef}
      className="relative max-w-[1536px] mx-auto px-6 lg:px-12 min-h-[90vh]"
      style={{ paddingTop: 0, paddingBottom: 0 }}
    >
      <div>
        <div className="grid lg:grid-cols-[1.1fr_1.9fr] gap-12 lg:gap-20 items-start">
          <Reveal className="self-start space-y-6">
            <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[#4E1218] tracking-tight leading-[1.1]">
              How the process <br />
              flows with <span className="font-serif italic font-normal text-[#7B1F2A]">clarity</span>
            </h2>

            <p className="text-sm sm:text-base text-[#7A5A5E] max-w-md leading-relaxed">
              A clear and collaborative workflow that takes you from first inspiration to a beautifully organized, stress-free wedding day.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="relative pl-0 lg:pl-8 space-y-4">
            <div
              className="absolute left-[28px] lg:left-[60px] w-0.5 bg-neutral-200"
              style={{
                top: '52px',
                height: `${totalLineHeight}px`,
              }}
            />

            <div
              className="absolute left-[28px] lg:left-[60px] w-0.5 bg-[#7B1F2A] transition-all duration-500 ease-out"
              style={{
                top: '52px',
                height: `${lineHeight}px`,
              }}
            />

            {STEPS.map((step, idx) => {
              const isActive = activeStep === idx
              return (
                <div
                  key={idx}
                  ref={(el) => (stepsRef.current[idx] = el)}
                  data-index={idx}
                  className="relative pl-16 py-4"
                >
                  <div
                    className={`absolute left-0 top-6 w-14 h-14 rounded-full border grid place-items-center z-10 transition-all duration-500 ${
                      isActive
                        ? 'bg-[#4E1218] border-[#C08E3F] shadow-md text-[#FAEDE6] scale-110'
                        : 'bg-[#FAEDE6] border-[#C08E3F] text-[#4E1218] shadow-sm'
                    }`}
                  >
                    <step.Icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>

                  <div
                    className={`rounded-3xl p-6 sm:p-8 transition-all duration-500 ${
                      isActive
                        ? 'bg-white shadow-md border border-neutral-200/60 opacity-100 scale-100'
                        : 'opacity-50 scale-[0.98]'
                    }`}
                  >
                    <h3
                      className={`font-display font-bold text-xl sm:text-2xl mb-2.5 transition-colors duration-500 ${
                        isActive ? 'text-[#4E1218]' : 'text-neutral-500'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#7A5A5E]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────── AI CHECKLIST FEATURE ─── */

function AiChecklistFeature() {
  const [activeIdx, setActiveIdx] = useState(0)

  const CARDS = [
    {
      num: '01',
      tabLabel: 'AI Checklist',
      TabIcon: Sparkles,
      title: 'AI Wedding Checklist',
      desc: "Goldie AI builds a custom to-do list for you based on your religion and culture. Whether it's booking the register of marriages, setting up the tea ceremony, or arranging sangeet vendors—save your time.",
      btnText: 'Explore AI Checklist',
      btnLink: '/dashboard/checklist',
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=90',
    },
    {
      num: '02',
      tabLabel: 'AI Budget',
      TabIcon: Wallet,
      title: 'Smart AI Budget',
      desc: "Tell Goldie AI your guest count and cultural preferences to get a realistic cost breakdown instantly. Plan Malay, Chinese, Indian, or Christian receptions with accurate local vendor price ranges.",
      btnText: 'Try Smart Budget',
      btnLink: '/dashboard/budget',
      imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=90',
    }
  ]

  return (
    <section className="max-w-[1536px] mx-auto px-6 lg:px-12 py-8 sm:py-10 lg:py-12 min-h-[60vh]">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
      >
        <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[#4E1218] tracking-tight leading-[1.1] mb-4">
          Plan with <span className="font-serif italic font-normal text-[#7B1F2A]">intelligence</span>
        </h2>
        <p className="text-sm sm:text-base text-[#7A5A5E] leading-relaxed max-w-xl mx-auto">
          Goldie AI generates custom to-do lists and budgets based on your culture and guest count—saving you weeks of wedding research.
        </p>
      </motion.div>

      {/* Accordion Deck Wrapper */}
      <div className="flex flex-col lg:flex-row gap-6 w-full flex-1 min-h-[60vh] items-stretch">
        {CARDS.map((card, idx) => {
          const isActive = activeIdx === idx
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1.15, delay: idx * 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setActiveIdx(idx)}
              className={`group relative rounded-[32px] overflow-hidden shadow-lg border border-neutral-100/10 transition-all duration-700 ease-in-out flex flex-col justify-between p-6 sm:p-8 lg:p-10 cursor-pointer ${
                isActive
                  ? 'flex-[2.5] lg:flex-[2.5]'
                  : 'flex-[1] lg:flex-[1]'
              }`}
            >
              {/* Picture background */}
              <img
                src={card.imageUrl}
                alt={card.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              
              {/* Gradient Overlay for legibility */}
              <div
                className="absolute inset-0 transition-opacity duration-700"
                style={{
                  background: isActive
                    ? 'linear-gradient(to top, rgba(78, 18, 24, 0.9) 0%, rgba(78, 18, 24, 0.45) 50%, rgba(78, 18, 24, 0.25) 100%)'
                    : 'linear-gradient(to top, rgba(78, 18, 24, 0.85) 0%, rgba(78, 18, 24, 0.6) 100%)',
                }}
              />

              {/* TOP ROW: Card Number */}
              <div className="relative z-10 flex justify-between items-start">
                <span className="font-display font-medium text-4xl text-[#FAEDE6]/70 leading-none">
                  {card.num}
                </span>
                
                {/* Visual active border-glow dot */}
                <span className={`w-2.5 h-2.5 rounded-full bg-[#C08E3F] transition-opacity duration-500 ${
                  isActive ? 'opacity-100 animate-pulse' : 'opacity-0'
                }`} />
              </div>

              {/* Inactive title label */}
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                whileInView={{ opacity: isActive ? 0 : 1, y: isActive ? 16 : 0, scale: isActive ? 0.92 : 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.75, delay: idx * 0.22 + 0.12, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 lg:flex ${
                  isActive ? 'opacity-0 scale-90 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
                }`}
              >
                <span className="font-display font-semibold text-xl sm:text-2xl lg:text-3xl text-[#FAEDE6] uppercase tracking-[0.14em] text-center px-4">
                  {card.tabLabel}
                </span>
              </motion.div>

              {/* Expanded Card Content (Visible only when card is active/expanded) */}
              <div
                className={`relative z-10 transition-all duration-500 ease-out flex flex-col items-start ${
                  isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none absolute'
                }`}
              >
                {/* Title */}
                <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-[#FAEDE6] leading-[1.1] mb-3">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm leading-relaxed text-[#FAEDE6]/80 mb-6 max-w-lg">
                  {card.desc}
                </p>

                {/* Action Button */}
                <Magnetic>
                  <Link
                    to={card.btnLink}
                    className="inline-flex items-center gap-2 rounded-full border border-[#FAEDE6]/40 bg-white/10 text-[#FAEDE6] px-6 py-3 font-semibold text-xs sm:text-sm backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#C08E3F] hover:text-white hover:border-[#C08E3F] active:scale-95 cursor-pointer"
                  >
                    <span>{card.btnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Magnetic>
              </div>

            </motion.div>
            )
          })}
        </div>
    </section>
  )
}

/* ─────────────────────────────────────────── LOOPING REVIEWS ──────── */

function ReviewLoop() {
  const REVIEWS_ROW1 = [
    {
      text: "Finding a dewan in Shah Alam was so easy. Goldie AI calculated our Malay wedding budget in seconds and it was spot on!",
      name: "Farah & Hafiz",
      role: "Shah Alam, Selangor",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    },
    {
      text: "We booked our makeup artist and photographer directly on WhatsApp. No commission, no hidden fees—absolute transparency.",
      name: "Leonard & Yaashini",
      role: "Kuala Lumpur",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    },
    {
      text: "The tea-ceremony checklist steps were so detailed. We didn't miss any traditional details. Goldie AI saved us weeks of research!",
      name: "Chloe & Wei",
      role: "George Town, Penang",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    },
  ]

  const REVIEWS_ROW2 = [
    {
      text: "Highly recommend the vendor directory. It was SSM-verified, so we felt completely safe paying deposits directly.",
      name: "Priya & Arjun",
      role: "Johor Bahru, Johor",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
    },
    {
      text: "Simple, clean, and zero spam. We had our entire Indian reception budget structured in less than ten minutes.",
      name: "Meera & Dev",
      role: "Ipoh, Perak",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    },
    {
      text: "Goldie AI drafted our timeline, and we managed to confirm our caterer with a single WhatsApp click. Life-saver!",
      name: "Siti & Amran",
      role: "Melaka",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
    },
  ]

  return (
    <section className="w-full py-8 sm:py-10 lg:py-12">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 px-6">
        <p className="font-script leading-none mb-2" style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', color: '#C08E3F' }}>
          — Testimonials
        </p>
        <h2 className="font-display font-medium text-4xl sm:text-5xl text-[#4E1218] leading-tight">
          Loved by <span className="italic" style={{ color: '#7B1F2A' }}>Malaysian couples</span>
        </h2>
      </div>

      {/* Infinite Looping Rows */}
      <div className="space-y-6 max-w-[1536px] mx-auto relative px-4">
        {/* Row 1: Left to Right */}
        <Marquee
          direction="right"
          speed={45}
          className="py-2"
          items={REVIEWS_ROW1.map((it, idx) => (
            <div
              key={idx}
              className="w-[280px] sm:w-[340px] bg-white rounded-2xl p-6 border border-neutral-100/90 shadow-soft flex flex-col justify-between whitespace-normal mx-3 text-left min-h-[170px]"
            >
              <p className="text-xs sm:text-sm text-[#7A5A5E] leading-relaxed mb-4">
                "{it.text}"
              </p>
              <div className="flex items-center gap-3 border-t border-neutral-100/50 pt-3 mt-auto">
                <img src={it.avatar} alt={it.name} className="w-9 h-9 rounded-full object-cover shadow-2xs" />
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-[#4E1218]">{it.name}</h4>
                  <p className="text-[10px] text-[#7A5A5E]/70 font-semibold">{it.role}</p>
                </div>
              </div>
            </div>
          ))}
        />

        {/* Row 2: Right to Left */}
        <Marquee
          direction="left"
          speed={45}
          className="py-2"
          items={REVIEWS_ROW2.map((it, idx) => (
            <div
              key={idx}
              className="w-[280px] sm:w-[340px] bg-white rounded-2xl p-6 border border-neutral-100/90 shadow-soft flex flex-col justify-between whitespace-normal mx-3 text-left min-h-[170px]"
            >
              <p className="text-xs sm:text-sm text-[#7A5A5E] leading-relaxed mb-4">
                "{it.text}"
              </p>
              <div className="flex items-center gap-3 border-t border-neutral-100/50 pt-3 mt-auto">
                <img src={it.avatar} alt={it.name} className="w-9 h-9 rounded-full object-cover shadow-2xs" />
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-[#4E1218]">{it.name}</h4>
                  <p className="text-[10px] text-[#7A5A5E]/70 font-semibold">{it.role}</p>
                </div>
              </div>
            </div>
          ))}
        />
        
        {/* Soft edge blur overlays */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FAF8F5] to-transparent pointer-events-none z-20" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FAF8F5] to-transparent pointer-events-none z-20" />
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────── SMART TOOLS BENTO ────── */

function SmartToolsBento() {
  const [typedText, setTypedText] = useState('')
  const prompts = [
    'Draft my Malay reception budget...',
    'Calculate Chinese banquet cost...',
    'Create Indian Sangeet checklist...',
    'Estimate Christian church ceremony...'
  ]

  useEffect(() => {
    let loopIdx = 0
    let charIdx = 0
    let isDeleting = false
    let timer

    function tick() {
      const currentFullText = prompts[loopIdx % prompts.length]
      if (isDeleting) {
        setTypedText(currentFullText.substring(0, charIdx - 1))
        charIdx--
      } else {
        setTypedText(currentFullText.substring(0, charIdx + 1))
        charIdx++
      }

      let delta = 100 - Math.random() * 40
      if (isDeleting) { delta /= 2 }

      if (!isDeleting && charIdx === currentFullText.length) {
        delta = 2000 // wait at end of word
        isDeleting = true
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false
        loopIdx++
        delta = 500 // pause before typing next word
      }

      timer = setTimeout(tick, delta)
    }

    tick()
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative overflow-hidden py-16 lg:py-0 min-h-[90vh] lg:min-h-[90vh] flex items-center px-6 lg:px-16 bg-transparent">
      {/* Background ambient gold/burgundy blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <LiquidBlob color="#C08E3F" size={420} blur={90} opacity={0.06} className="absolute -top-20 -right-20" duration={18} />
        <LiquidBlob color="#7B1F2A" size={320} blur={80} opacity={0.04} className="absolute -bottom-10 -left-10" duration={22} />
      </div>

      <div className="relative max-w-[1300px] mx-auto z-10">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal>
            <h2 className="font-display font-medium text-4xl lg:text-[54px] leading-[1.1] tracking-tight text-[#4E1218]">
              Plan, budget, track, <span className="italic text-[#7B1F2A] font-display">and celebrate your love story.</span>
            </h2>
          </Reveal>
        </div>

        {/* Bento Grid — Row 1 (1 column, 2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card 1: AI Planner */}
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="group rounded-[24px] p-8 border border-neutral-200/80 bg-white shadow-md hover:shadow-xl flex flex-col gap-8 cursor-pointer hover:border-[#7B1F2A]/30 transition-colors"
          >
            <div>
              <h3 className="font-display text-xl font-bold text-[#4E1218] group-hover:text-[#7B1F2A] transition mb-2">Smart Budget AI</h3>
              <p className="text-base text-neutral-500 leading-relaxed">
                Draft standard budgets and checklists customized for Malay, Chinese, Indian, or Christian traditions instantly.
              </p>
            </div>
            {/* Input Graphic with dynamic typing simulation */}
            <div className="bg-[#FAEDE6]/50 border border-burgundy-100 rounded-2xl p-4 flex items-center justify-between shadow-xs min-h-[58px]">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-[#C08E3F] shrink-0" />
                <span className="text-[13px] text-[#4E1218] font-semibold truncate border-r border-[#7B1F2A] pr-0.5 animate-pulse min-h-[16px]">
                  {typedText}
                </span>
              </div>
              <button className="bg-[#7B1F2A] text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold shrink-0 shadow-xs hover:bg-[#4E1218] transition">
                Draft AI
              </button>
            </div>
          </motion.div>

          {/* Card 2: Interactive Experience Finder (Pics on left, text/detail on right) */}
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="group rounded-[24px] p-8 border border-neutral-200/80 bg-white shadow-md hover:shadow-xl md:col-span-2 grid md:grid-cols-2 gap-8 items-center cursor-pointer hover:border-[#7B1F2A]/30 transition-colors overflow-hidden"
          >
            {/* Left Side: Overlapping Photo Cards fanning out on hover */}
            <div className="relative h-48 overflow-hidden flex items-center min-w-[200px]">
              {/* Stacked picture card 2 (Penang) */}
              <div className="absolute left-2 bottom-2 w-44 bg-white border border-neutral-200/60 rounded-2xl p-2 shadow-xl -rotate-6 transition-all duration-500 group-hover:-rotate-3 group-hover:translate-x-3 overflow-hidden">
                <div className="h-24 w-full rounded-xl overflow-hidden mb-1.5 bg-neutral-100">
                  <img 
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80" 
                    alt="Garden Villa Penang" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[9px] font-bold text-[#C08E3F] uppercase tracking-wider">Penang</p>
                <p className="text-[10px] font-bold text-[#4E1218] truncate">Orangery Garden Villa</p>
              </div>

              {/* Stacked picture card 1 (KL) */}
              <div className="absolute left-24 bottom-4 w-44 bg-white border border-neutral-200/60 rounded-2xl p-2 shadow-xl rotate-6 transition-all duration-500 group-hover:rotate-3 group-hover:translate-x-6 overflow-hidden">
                <div className="h-24 w-full rounded-xl overflow-hidden mb-1.5 bg-neutral-100">
                  <img 
                    src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=80" 
                    alt="Ballroom KL" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[9px] font-bold text-[#C08E3F] uppercase tracking-wider">Kuala Lumpur</p>
                <p className="text-[10px] font-bold text-[#4E1218] truncate">The Majestic Ballroom</p>
              </div>
            </div>

            {/* Right Side: Text & Location Pills */}
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-xl font-bold text-[#4E1218] group-hover:text-[#7B1F2A] transition mb-2">Cinematic Experience Preview</h3>
                <p className="text-base text-neutral-500 leading-relaxed">
                  Browse and filter premium banquet halls, gardens, kelentengs, and beach resorts across Malaysia with clear starting price ranges.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B1F2A] bg-[#FAEDE6] px-2.5 py-1 rounded-md">📍 Selangor</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B1F2A] bg-[#FAEDE6] px-2.5 py-1 rounded-md">📍 Penang</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B1F2A] bg-[#FAEDE6] px-2.5 py-1 rounded-md">📍 Kuala Lumpur</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bento Grid — Row 2 (3 equal columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 3: Unified Dashboard */}
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="group rounded-[24px] p-8 border border-neutral-200/80 bg-white shadow-md hover:shadow-xl flex flex-col gap-6 cursor-pointer hover:border-[#7B1F2A]/30 transition-colors"
          >
            <div>
              <h3 className="font-display text-xl font-bold text-[#4E1218] group-hover:text-[#7B1F2A] transition mb-2">Unified Dashboard</h3>
              <p className="text-base text-neutral-500 leading-relaxed">
                Checklist timelines, budget planners, and vendor shortlists inside one cohesive workspace.
              </p>
            </div>
            {/* Checklist Tree Graphic */}
            <div className="space-y-2 bg-[#FAEDE6]/40 border border-burgundy-100/60 rounded-xl p-3">
              <div className="flex items-center gap-2 text-[11px] text-neutral-700 font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C08E3F]" />
                <span>Confirm Kadi / Marriage Registry</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-700 font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C08E3F]" />
                <span>Book Photographer & Videographer</span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: WhatsApp Integration */}
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="group rounded-[24px] p-8 border border-neutral-200/80 bg-white shadow-md hover:shadow-xl flex flex-col gap-6 cursor-pointer hover:border-[#7B1F2A]/30 transition-colors"
          >
            <div>
              <h3 className="font-display text-xl font-bold text-[#4E1218] group-hover:text-[#7B1F2A] transition mb-2">Direct WhatsApp Connection</h3>
              <p className="text-base text-neutral-500 leading-relaxed">
                Connect directly with verified vendors. No middlemen, no commissions, no transaction fees.
              </p>
            </div>
            {/* Pulsing equalizer waves */}
            <div className="flex items-end justify-center gap-1.5 h-12">
              <span className="w-1 bg-[#C08E3F] h-6 rounded-full animate-pulse" />
              <span className="w-1 bg-[#C08E3F] h-10 rounded-full animate-pulse delay-75" />
              <span className="w-1 bg-[#C08E3F] h-8 rounded-full animate-pulse delay-150" />
              <span className="w-1 bg-[#C08E3F] h-12 rounded-full animate-pulse delay-200" />
              <span className="w-1 bg-[#C08E3F] h-6 rounded-full animate-pulse delay-100" />
            </div>
          </motion.div>

          {/* Card 5: Priority Milestone Controls */}
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="group rounded-[24px] p-8 border border-neutral-200/80 bg-white shadow-md hover:shadow-xl flex flex-col gap-6 cursor-pointer hover:border-[#7B1F2A]/30 transition-colors"
          >
            <div>
              <h3 className="font-display text-xl font-bold text-[#4E1218] group-hover:text-[#7B1F2A] transition mb-2">Timeline Priority Milestones</h3>
              <p className="text-base text-neutral-500 leading-relaxed">
                Set custom target dates, track actual cost vs planned budget, and set priority flags.
              </p>
            </div>
            {/* Timeline milestone badges */}
            <div className="flex gap-3 justify-center">
              <div className="bg-[#FAEDE6]/60 border border-burgundy-100 rounded-xl p-3 text-center w-24">
                <span className="text-xs font-bold text-[#7B1F2A]">+</span>
                <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold mt-1">Start Date</p>
              </div>
              <div className="bg-[#FAEDE6]/60 border border-burgundy-100 rounded-xl p-3 text-center w-24">
                <span className="text-xs font-bold text-[#7B1F2A]">+</span>
                <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold mt-1">End Date</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
