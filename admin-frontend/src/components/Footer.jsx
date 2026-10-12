import { Link } from 'react-router-dom'
import { Logo } from './Logo.jsx'

const sections = [
  {
    heading: 'Plan your Wedding',
    links: [
      { to: '/venues', label: 'Venues' },
      { to: '/vendors', label: 'Vendors' },
      { to: '/dashboard/budget', label: 'Budget' },
      { to: '/boutique', label: 'Boutique' },
      { to: '/dashboard/checklist', label: 'Checklist' },
    ],
  },
  {
    heading: 'About',
    links: [
      { to: '/our-story', label: 'Our Story' },
      { to: '/become-vendor', label: 'Become GolPro Vendor' },
      { to: '/referral', label: 'Referral' },
    ],
  },
  {
    heading: 'Advice & Support',
    links: [
      { to: '/contact', label: 'Contact Us' },
      { to: '/visit-us', label: 'Visit Us' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-blush-100 border-t border-burgundy-200/40 mt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        {sections.map((s) => (
          <div key={s.heading} className="min-w-0">
            <h3 className="font-display text-2xl text-burgundy-800 mb-5">{s.heading}</h3>
            <ul className="space-y-2.5">
              {s.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-burgundy-700 hover:text-burgundy-900 transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-2 xl:col-span-1 flex flex-col items-start xl:items-center xl:justify-center text-center min-w-0">
          <Logo className="h-12" compact />
          <p className="mt-3 text-sm italic text-burgundy-700">
            Where your Dream Wedding Begins
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="#"
              aria-label="X"
              className="w-9 h-9 rounded-full bg-burgundy-900 text-blush-100 flex items-center justify-center hover:bg-burgundy-700 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-burgundy-200/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 text-sm text-burgundy-700 flex flex-col md:flex-row gap-2 items-center justify-between">
          <span>© {new Date().getFullYear()} Golden Promise. All rights reserved.</span>
          <span className="italic">Made with love for couples in Malaysia.</span>
        </div>
      </div>
    </footer>
  )
}
