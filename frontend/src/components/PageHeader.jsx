import { Link } from 'react-router-dom'
import { ArrowLeft, Search, Heart, User } from 'lucide-react'

export function PageHeader({ title, backTo = '/', showSearch = true }) {
  return (
    <div className="bg-blush-100 border-b border-burgundy-200/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to={backTo}
            className="inline-flex items-center gap-1 text-burgundy-700 hover:text-burgundy-900 text-sm mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="font-display text-3xl md:text-4xl text-burgundy-900">{title}</h1>
        </div>
        {showSearch && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-72 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-burgundy-500" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full pl-11 pr-4 py-2.5 bg-blush-50 border border-burgundy-200/60 rounded-full text-burgundy-900 placeholder:text-burgundy-400 focus:outline-none focus:border-burgundy-800 transition"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
