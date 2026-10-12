import { useState } from 'react'
import toast from 'react-hot-toast'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { ContentPage } from '../components/ContentPage.jsx'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSending(true)
    await new Promise((r) => setTimeout(r, 700))
    setSending(false)
    setForm({ name: '', email: '', message: '' })
    toast.success("Thanks! We'll be in touch within 24 hours.")
  }

  return (
    <ContentPage eyebrow="Contact Us" title="We'd love to hear from you.">
      <div className="mt-10 grid md:grid-cols-2 gap-10">
        <div className="space-y-5">
          <ContactRow Icon={Mail} label="Email" value="hello@goldenpromise.my" />
          <ContactRow Icon={Phone} label="Phone" value="+60 7 123 4567" />
          <ContactRow
            Icon={MapPin}
            label="Office"
            value="60B, Jalan Tun Abdul Razak, 80100 Johor Bahru"
          />
        </div>
        <form onSubmit={submit} className="card-surface !bg-blush-50 p-6 space-y-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Your name"
            className="w-full px-4 py-2.5 bg-blush-100 border border-burgundy-200/60 rounded-lg focus:outline-none focus:border-burgundy-800"
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2.5 bg-blush-100 border border-burgundy-200/60 rounded-lg focus:outline-none focus:border-burgundy-800"
          />
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            rows={4}
            placeholder="How can we help?"
            className="w-full px-4 py-2.5 bg-blush-100 border border-burgundy-200/60 rounded-lg focus:outline-none focus:border-burgundy-800"
          />
          <button type="submit" disabled={sending} className="btn-primary w-full justify-center">
            {sending ? 'Sending…' : (<><Send className="w-4 h-4" /> Send message</>)}
          </button>
        </form>
      </div>
    </ContentPage>
  )
}

function ContactRow({ Icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-10 h-10 rounded-full bg-burgundy-800 text-blush-100 grid place-items-center shrink-0">
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <p className="text-sm uppercase tracking-wider text-burgundy-700">{label}</p>
        <p className="text-burgundy-900 font-medium">{value}</p>
      </div>
    </div>
  )
}
