import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'

const STORIES = {
  couples: [
    { name: 'Farah & Hafiz', detail: 'Married in Shah Alam', quote: 'Goldie made finding a trusted venue feel calm and straightforward. Our Malay wedding budget was organised in minutes, and we always knew what to do next.', avatar: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=85' },
    { name: 'Chloe & Wei', detail: 'Married in Penang', quote: 'The culture-aware checklist covered the tea ceremony details our families cared about. It gave us structure without taking away the joy of planning.', avatar: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=300&q=85' },
    { name: 'Priya & Arjun', detail: 'Married in Johor Bahru', quote: 'We compared verified vendors, viewed their work, and contacted our favourites directly. It felt transparent, personal, and genuinely made for Malaysian couples.', avatar: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=300&q=85' },
    { name: 'Aina & Daniel', detail: 'Married in Kuala Lumpur', quote: 'Having our venue, budget, and checklist in one place kept both of us aligned. Planning finally felt manageable instead of overwhelming.', avatar: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=300&q=85' },
    { name: 'Mei Lin & Jason', detail: 'Married in Melaka', quote: 'The portfolios helped us shortlist vendors quickly, and WhatsApp made every conversation direct. There were no confusing forms or middlemen.', avatar: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=300&q=85' },
    { name: 'Kavitha & Roshan', detail: 'Married in Ipoh', quote: 'Goldie understood our mixed traditions and created a plan that respected both families. That thoughtful detail made a real difference to us.', avatar: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=300&q=85' },
  ],
  vendors: [
    { name: 'Fiona Yeoh', detail: 'The Bridal Suite', quote: 'The verified profile gives couples confidence before they contact us. Enquiries arrive directly on WhatsApp, so every conversation feels warm and immediate.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=85' },
    { name: 'Ahmad Rifqi', detail: 'Cahaya Frames', quote: 'Our work is presented beautifully and couples can understand our style before reaching out. The leads we receive are much more relevant.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85' },
    { name: 'Priya Nair', detail: 'Henna Artist & Makeup Stylist', quote: 'Updating my portfolio and packages is simple. I appreciate having full control of my listing and keeping every booking commission-free.', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=85' },
    { name: 'Nurul Izzati', detail: 'Sweet Nikah Catering', quote: 'The dashboard helps us understand interest in our profile, while direct enquiries let our team respond to couples without delay.', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=85' },
    { name: 'Kevin Tan', detail: 'Bloom & Co.', quote: 'Verification made our listing feel established and trustworthy. Couples arrive already familiar with our work, which makes the first conversation easier.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85' },
    { name: 'Farid Hassan', detail: 'FH Entertainment', quote: 'Golden Promise is clean, focused, and easy to manage. Couples find us, view our portfolio, and message us directly when the fit is right.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=85' },
  ],
}

export default function Community() {
  const [audience, setAudience] = useState('couples')

  return (
    <div className="min-h-screen bg-[#FAF8F5] px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
      <section className="mx-auto max-w-7xl">
        <motion.header initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FAEDE6] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7B1F2A]">
            <Heart className="h-3.5 w-3.5" /> Testimonials
          </div>
          <h1 className="mt-6 font-display text-4xl font-medium leading-tight text-[#4E1218] sm:text-5xl lg:text-6xl">
            Kind words from our <span className="italic text-[#7B1F2A]">community</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#4E1218]/65 sm:text-base">
            Real experiences from Malaysian couples planning meaningful celebrations and vendors growing trusted wedding businesses.
          </p>
          <div className="mx-auto mt-8 flex max-w-xs rounded-full border border-[#E8C7BD] bg-white p-1 shadow-sm">
            {['couples', 'vendors'].map((item) => (
              <button key={item} type="button" onClick={() => setAudience(item)} className={`flex-1 rounded-full px-5 py-2.5 text-xs font-bold capitalize transition-all duration-300 ${audience === item ? 'bg-[#7B1F2A] text-white shadow-sm' : 'text-[#4E1218]/65 hover:text-[#7B1F2A]'}`}>
                For {item}
              </button>
            ))}
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          <motion.div key={audience} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STORIES[audience].map((story, index) => (
              <motion.article key={story.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.65, delay: index * 0.07 }} whileHover={{ y: -7 }} className="relative aspect-square overflow-hidden rounded-[28px] bg-white p-7 text-center shadow-[0_20px_55px_-35px_rgba(78,18,24,0.35)] transition-shadow duration-300 hover:shadow-[0_28px_55px_-30px_rgba(78,18,24,0.42)] sm:p-8">
                <div className="flex h-full flex-col items-center">
                  <img src={story.avatar} alt="" className="h-16 w-16 rounded-full border-4 border-[#FAEDE6] object-cover shadow-sm" />
                  <h2 className="mt-4 font-display text-xl font-semibold text-[#4E1218]">{story.name}</h2>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#7B1F2A]/60">{story.detail}</p>
                  <p className="my-auto line-clamp-5 text-sm italic leading-6 text-[#4E1218]/75">“{story.quote}”</p>
                  <span className="pointer-events-none absolute -bottom-8 right-3 font-display text-[110px] leading-none text-[#FAEDE6]">”</span>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  )
}
