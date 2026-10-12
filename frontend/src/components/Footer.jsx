import { Heart, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

const sections = [
  {
    heading: 'Explore',
    links: [
      { to: '/venues', label: 'Venues' },
      { to: '/vendors', label: 'Vendors' },
      { to: '/our-story', label: 'Our Story' },
      { to: '/community', label: 'Community' },
    ],
  },
  {
    heading: 'Planning Tools',
    links: [
      { to: '/dashboard/budget', label: 'Smart Budget' },
      { to: '/dashboard/checklist', label: 'Checklist' },
    ],
  },
  {
    heading: 'For Vendors',
    links: [
      { to: '/become-vendor', label: 'Become a Vendor' },
      { to: '/login', label: 'Vendor Login' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { to: '/contact', label: 'Contact Us' },
    ],
  },
]

const quickLinks = [
  { to: '/contact', label: 'Contact Golden Promise', Icon: Mail },
  { to: '/our-story', label: 'Our story', Icon: Heart },
]

export function Footer() {
  return (
    <footer className="mt-16 bg-[#4E1218] text-[#FAEDE6]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_repeat(4,1fr)] lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="font-script text-4xl leading-none text-[#F3C76B] transition-colors hover:text-[#FFE09A]"
            >
              Golden Promise
            </Link>
            <p className="mt-4 max-w-[220px] text-sm leading-6 text-[#FAEDE6]/90">
              Malaysia’s trusted wedding venue and vendor directory.
            </p>
          </div>

          {sections.map((section) => (
            <nav key={section.heading} aria-label={section.heading}>
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#C08E3F]">
                {section.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-[#FAEDE6]/90 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-[#FAEDE6]/20 pt-8">
          <div className="flex justify-center gap-3">
            {quickLinks.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#FAEDE6]/45 text-[#FAEDE6] transition-colors duration-200 hover:border-[#C08E3F] hover:bg-[#C08E3F] hover:text-[#4E1218]"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-2 text-center text-xs text-[#FAEDE6]/75 md:flex-row md:text-left">
            <span>Copyright © {new Date().getFullYear()} Golden Promise. All rights reserved.</span>
            <span>Content, branding, and materials may not be reproduced without permission.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
