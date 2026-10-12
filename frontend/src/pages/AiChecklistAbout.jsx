import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, BrainCircuit, Globe, Merge, CalendarClock, ArrowRight } from 'lucide-react'
import { Reveal } from '../components/Reveal.jsx'

export default function AiChecklistAbout() {
  return (
    <div className="min-h-screen bg-transparent text-[#4E1218] overflow-hidden pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Content */}
          <div className="space-y-10">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/60 border border-[#E8C7BD] px-4 py-2 text-sm font-semibold text-[#7B1F2A] shadow-sm backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                AI Powered
              </div>
            </Reveal>

            <div className="space-y-6">
              <Reveal delay={0.1}>
                <h1 className="font-display text-5xl lg:text-6xl font-medium leading-tight text-[#4E1218]">
                  Smart AI Checklist for <span className="italic text-[#7B1F2A]">Mixed Cultures</span>
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-lg text-[#7B1F2A]/80 leading-relaxed max-w-xl">
                  Planning a multicultural wedding in Malaysia? Our intelligent AI uses advanced logic to seamlessly blend traditions, generating a single, unified timeline tailored precisely to your unique heritage.
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.3}>
              <div className="grid sm:grid-cols-2 gap-8 border-t border-b border-[#E8C7BD]/50 py-8">
                
                {/* Feature 1 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Merge className="w-6 h-6 text-[#C08E3F]" />
                    <h3 className="font-semibold text-[#4E1218]">Smart Merging</h3>
                  </div>
                  <p className="text-sm text-[#7B1F2A]/70 leading-relaxed">
                    Automatically combine Malay, Chinese, and Indian customs into one logical flow without overlaps.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="w-6 h-6 text-[#C08E3F]" />
                    <h3 className="font-semibold text-[#4E1218]">Advanced AI Reasoning</h3>
                  </div>
                  <p className="text-sm text-[#7B1F2A]/70 leading-relaxed">
                    Powered by a high-performance AI model selected for fast, thoughtful, and reliable cultural planning.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-[#C08E3F]" />
                    <h3 className="font-semibold text-[#4E1218]">15+ Cultures Trained</h3>
                  </div>
                  <p className="text-sm text-[#7B1F2A]/70 leading-relaxed">
                    Extensively trained on diverse Malaysian traditions, ensuring respectful and accurate task generation.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CalendarClock className="w-6 h-6 text-[#C08E3F]" />
                    <h3 className="font-semibold text-[#4E1218]">Dynamic Timelines</h3>
                  </div>
                  <p className="text-sm text-[#7B1F2A]/70 leading-relaxed">
                    Instantly sets up preparation reminders based on your exact wedding date, down to the week.
                  </p>
                </div>

              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7B1F2A] to-[#4E1218] px-8 py-4 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
              >
                Generate Your Checklist <ArrowRight className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>

          {/* Right Column - Checklist Examples */}
          <div className="relative grid grid-cols-1 content-center gap-5 lg:min-h-[520px]">
              
              <motion.div 
                initial={{ opacity: 0, y: 50, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ x: 10, y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                className="group relative z-10 min-w-0 overflow-hidden rounded-2xl bg-white p-6 shadow-[0_16px_35px_-24px_rgba(78,18,24,0.28)] transition-[background-color,box-shadow] duration-500 hover:bg-[#FFF9F6] hover:shadow-[0_30px_55px_-22px_rgba(78,18,24,0.46)]"
              >
                <span className="absolute inset-y-0 left-0 w-1 origin-center scale-y-0 rounded-full bg-[#7B1F2A] transition-transform duration-500 ease-out group-hover:scale-y-100" />
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAEDE6] text-[#7B1F2A] transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-semibold leading-snug text-[#4E1218]">15+ Malaysian Cultures</h4>
                    <p className="mt-2 text-sm leading-6 text-[#7B1F2A]/70">
                      Generate checklists tailored to Malay, Chinese, Indian, Sikh, Christian, Buddhist, Hindu, and more.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 50, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                whileHover={{ x: 10, y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                className="group relative z-10 min-w-0 overflow-hidden rounded-2xl bg-white p-6 shadow-[0_16px_35px_-24px_rgba(78,18,24,0.28)] transition-[background-color,box-shadow] duration-500 hover:bg-[#FFF9F6] hover:shadow-[0_30px_55px_-22px_rgba(78,18,24,0.46)]"
              >
                <span className="absolute inset-y-0 left-0 w-1 origin-center scale-y-0 rounded-full bg-[#7B1F2A] transition-transform duration-500 ease-out group-hover:scale-y-100" />
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAEDE6] text-[#7B1F2A] transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110">
                    <Merge className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-semibold leading-snug text-[#4E1218]">Mixed Culture Ready</h4>
                    <p className="mt-2 text-sm leading-6 text-[#7B1F2A]/70">
                      Automatically combines multiple traditions into one smooth wedding timeline.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 50, x: -10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                whileHover={{ x: 10, y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                className="group relative z-10 min-w-0 overflow-hidden rounded-2xl bg-white p-6 shadow-[0_16px_35px_-24px_rgba(78,18,24,0.28)] transition-[background-color,box-shadow] duration-500 hover:bg-[#FFF9F6] hover:shadow-[0_30px_55px_-22px_rgba(78,18,24,0.46)]"
              >
                <span className="absolute inset-y-0 left-0 w-1 origin-center scale-y-0 rounded-full bg-[#7B1F2A] transition-transform duration-500 ease-out group-hover:scale-y-100" />
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAEDE6] text-[#7B1F2A] transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-semibold leading-snug text-[#4E1218]">Smart Timeline</h4>
                    <p className="mt-2 text-sm leading-6 text-[#7B1F2A]/70">
                      Creates a personalized checklist, reminders, and countdown based on your wedding date.
                    </p>
                  </div>
                </div>
              </motion.div>

          </div>

        </div>
      </div>
    </div>
  )
}
