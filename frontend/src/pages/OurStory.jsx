import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

export default function OurStory() {
  const reduceMotion = useReducedMotion()
  const textContainer = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: 0.65,
        staggerChildren: 0.16,
      },
    },
  }
  const textItem = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <motion.main
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#FAF8F5] text-[#4E1218]"
    >
      <section className="px-4 sm:px-6 lg:px-10 pt-28 sm:pt-32 pb-10 lg:pb-14">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 48, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 1.2, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-[1180px] overflow-hidden rounded-2xl bg-[#FAEDE6]"
        >
          <div className="grid lg:h-[620px] lg:grid-cols-[1.04fr_0.96fr]">
            <motion.figure
              initial={reduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: reduceMotion ? 0 : 1.45, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-[360px] overflow-hidden bg-[#E8C7BD] sm:h-[440px] lg:h-full"
            >
              <img
                src="/our-story-malaysian-weddings.png"
                alt="Malay, Chinese, and Indian Malaysian couples celebrating their wedding traditions"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </motion.figure>

            <div className="flex items-center px-7 py-12 sm:px-10 sm:py-14 lg:h-full lg:px-10 lg:py-8 xl:px-12">
              <motion.div
                variants={reduceMotion ? undefined : textContainer}
                initial={reduceMotion ? false : 'hidden'}
                animate="visible"
                className="mx-auto w-full max-w-[560px]"
              >
                <motion.p variants={textItem} className="mb-4 text-sm font-semibold text-[#7B1F2A] lg:mb-3">
                  Made for Malaysian celebrations
                </motion.p>

                <motion.h1 variants={textItem} className="font-display text-[clamp(2.5rem,4vw,4rem)] font-medium leading-[1.03] tracking-[-0.025em] text-balance lg:text-[3rem] xl:text-[3.25rem]">
                  Every love story deserves a{' '}
                  <span className="italic font-normal text-[#7B1F2A]">golden beginning.</span>
                </motion.h1>

                <motion.div variants={textItem} className="mt-6 space-y-4 text-justify text-[15px] leading-6 text-[#623A3F] lg:mt-4 lg:space-y-3 lg:text-[13px] lg:leading-5 xl:text-sm">
                  <p>
                    Golden Promise began with a simple idea: finding trusted wedding
                    businesses in Malaysia should feel exciting, not exhausting. Couples
                    needed one clear place to discover verified vendors, understand their
                    options, and make contact without another person standing in between.
                  </p>
                  <p>
                    We built a verified directory shaped around the way Malaysian weddings
                    are really planned—across cultures, locations, guest lists, and budgets.
                    Enquiries go directly to vendors through WhatsApp, with no booking
                    commissions or payment handling by Golden Promise.
                  </p>
                </motion.div>

                <motion.blockquote variants={textItem} className="mt-6 border-y border-[#7B1F2A]/20 py-4 font-display text-lg italic leading-relaxed text-[#4E1218] lg:mt-4 lg:py-3 lg:text-base">
                  “Rooted in culture, guided by trust, and made for every kind of love.”
                </motion.blockquote>

                <motion.div variants={textItem}>
                  <Link
                    to="/vendors"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#7B1F2A] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4E1218] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7B1F2A] lg:mt-4 lg:py-2.5"
                  >
                    Explore the directory
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="px-6 py-20 sm:py-24 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <motion.h2
              initial={reduceMotion ? false : { opacity: 0, y: 38 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: reduceMotion ? 0 : 1.05, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl font-medium leading-tight sm:text-5xl"
            >
              What we promise
              <span className="block italic text-[#7B1F2A]">to every couple.</span>
            </motion.h2>

            <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
              <StoryPrinciple
                index={0}
                reduceMotion={reduceMotion}
                title="Trust before choice"
                text="Businesses submit their registration and identification details for review before earning a verified badge."
              />
              <StoryPrinciple
                index={1}
                reduceMotion={reduceMotion}
                title="Culture belongs here"
                text="Our planning tools and directory filters recognise that Malaysian weddings are beautifully varied and often multicultural."
              />
              <StoryPrinciple
                index={2}
                reduceMotion={reduceMotion}
                title="Direct means direct"
                text="Couples contact businesses through WhatsApp. There are no booking commissions, hidden markups, or platform middlemen."
              />
              <StoryPrinciple
                index={3}
                reduceMotion={reduceMotion}
                title="Planning should feel lighter"
                text="Goldie helps couples shape a practical checklist and budget around their celebration, guests, location, and traditions."
              />
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  )
}

function StoryPrinciple({ title, text, index, reduceMotion }) {
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: reduceMotion ? 0 : 0.95, delay: reduceMotion ? 0 : index * 0.14, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-[#C08E3F]/55 pt-5"
    >
      <h3 className="font-display text-2xl font-semibold text-[#4E1218]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#714E52]">{text}</p>
    </motion.article>
  )
}
