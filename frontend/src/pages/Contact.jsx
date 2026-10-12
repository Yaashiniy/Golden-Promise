import { useState } from 'react'
import toast from 'react-hot-toast'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Clock3, Mail, MapPin, Phone, Send } from 'lucide-react'

const initialForm = {
  name: '',
  phone: '',
  email: '',
  subject: '',
  message: '',
  consent: false,
}

export default function Contact() {
  const [form, setForm] = useState(initialForm)
  const [sending, setSending] = useState(false)
  const reduceMotion = useReducedMotion()

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  async function submit(event) {
    event.preventDefault()
    setSending(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setSending(false)
    setForm(initialForm)
    toast.success("Thank you. We'll be in touch within one business day.")
  }

  return (
    <motion.main
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[#FAF8F5] px-4 pb-20 pt-28 text-[#4E1218] sm:px-6 sm:pt-32 lg:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-9 max-w-2xl sm:mb-12">
          <p className="font-script text-3xl leading-none text-[#C08E3F] sm:text-4xl">Let&apos;s talk</p>
          <h1 className="mt-3 text-balance font-display text-4xl font-medium leading-[1.08] tracking-[-0.025em] sm:text-5xl lg:text-6xl">
            We&apos;re here to help with your wedding journey.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-[#70494E] sm:text-base sm:leading-7">
            Have a question about Golden Promise, your account, or a business listing? Send us a message and our team will point you in the right direction.
          </p>
        </header>

        <div className="grid overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_-24px_rgba(78,18,24,0.30)] lg:grid-cols-[0.78fr_1.22fr]">
          <motion.aside
            initial={reduceMotion ? false : { opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col bg-[#4E1218] px-7 py-9 text-[#FAEDE6] sm:px-10 sm:py-12 lg:px-11"
          >
            <div>
              <h2 className="font-display text-3xl font-medium">Contact details</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#FAEDE6]/75">
                Reach the Golden Promise team directly. We usually reply within one business day.
              </p>
            </div>

            <div className="mt-9 divide-y divide-[#FAEDE6]/15 border-y border-[#FAEDE6]/15">
              <ContactLink
                Icon={Mail}
                label="Email"
                value="hello@goldenpromise.my"
                href="mailto:hello@goldenpromise.my"
              />
              <ContactLink
                Icon={Phone}
                label="Phone"
                value="+60 7 123 4567"
                href="tel:+6071234567"
              />
              <ContactLink
                Icon={MapPin}
                label="Office"
                value="60B, Jalan Tun Abdul Razak, 80100 Johor Bahru, Johor"
                href="https://www.google.com/maps/search/?api=1&query=Jalan+Tun+Abdul+Razak+Johor+Bahru"
                external
              />
            </div>

            <div className="mt-auto pt-9">
              <div className="flex items-center gap-3 text-sm text-[#FAEDE6]/80">
                <Clock3 className="h-4 w-4 text-[#C08E3F]" />
                <span>Monday–Friday, 9:00 AM–5:30 PM</span>
              </div>
            </div>
          </motion.aside>

          <motion.section
            initial={reduceMotion ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="px-7 py-9 sm:px-10 sm:py-12 lg:px-12"
          >
            <div className="mb-8">
              <h2 className="font-display text-3xl font-medium sm:text-4xl">Send us a message</h2>
              <p className="mt-2 text-sm leading-6 text-[#785A5E]">
                Tell us what you need help with and include any useful details.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" required>
                  <input name="name" value={form.name} onChange={updateField} required autoComplete="name" placeholder="Your full name" className="contact-input" />
                </Field>
                <Field label="Phone number">
                  <input name="phone" value={form.phone} onChange={updateField} type="tel" autoComplete="tel" placeholder="+60 12 345 6789" className="contact-input" />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" required>
                  <input name="email" value={form.email} onChange={updateField} required type="email" autoComplete="email" placeholder="you@example.com" className="contact-input" />
                </Field>
                <Field label="Subject" required>
                  <input name="subject" value={form.subject} onChange={updateField} required placeholder="How can we help?" className="contact-input" />
                </Field>
              </div>

              <Field label="Message" required>
                <textarea name="message" value={form.message} onChange={updateField} required rows={6} placeholder="Write your message here…" className="contact-input resize-none" />
              </Field>

              <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-[#785A5E] sm:text-sm">
                <input
                  name="consent"
                  type="checkbox"
                  checked={form.consent}
                  onChange={updateField}
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#7B1F2A]"
                />
                <span>I agree that Golden Promise may use these details to respond to my enquiry.</span>
              </label>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex min-w-48 items-center justify-center gap-2 rounded-full bg-[#7B1F2A] px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#4E1218] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7B1F2A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? 'Sending…' : <><Send className="h-4 w-4" /> Send message</>}
              </button>
            </form>
          </motion.section>
        </div>
      </div>

      <style>{`
        .contact-input {
          width: 100%;
          border: 1px solid rgba(123, 31, 42, 0.20);
          border-radius: 0.75rem;
          background: #FEF9F7;
          padding: 0.8rem 0.95rem;
          color: #4E1218;
          font-size: 0.875rem;
          line-height: 1.4;
          outline: none;
          transition: border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
        }
        .contact-input::placeholder { color: #8B6A6E; }
        .contact-input:focus {
          border-color: #7B1F2A;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(123, 31, 42, 0.10);
        }
      `}</style>
    </motion.main>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#4E1218]">
        {label}{required && <span className="ml-1 text-[#C08E3F]">*</span>}
      </span>
      {children}
    </label>
  )
}

function ContactLink({ Icon, label, value, href, external = false }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="group flex items-start gap-4 py-6"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#FAEDE6]/10 text-[#C08E3F] transition-colors group-hover:bg-[#C08E3F] group-hover:text-[#4E1218]">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#C08E3F]">{label}</span>
        <span className="mt-1.5 block text-sm leading-6 text-[#FAEDE6]/90">{value}</span>
      </span>
      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#FAEDE6]/45 transition-colors group-hover:text-[#C08E3F]" />
    </a>
  )
}
