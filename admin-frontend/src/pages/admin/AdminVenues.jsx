import { Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { Reveal } from '../../components/Reveal.jsx'
import { venues } from '../../lib/mockData.js'

export default function AdminVenues() {
  return (
    <div className="bg-blush-100 min-h-[calc(100vh-5rem)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <Link to="/admin" className="inline-flex items-center gap-1 text-burgundy-700 hover:text-burgundy-900 text-sm mb-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center justify-between mb-6">
          <Reveal>
            <h1 className="font-display text-4xl text-burgundy-900">Venues</h1>
          </Reveal>
          <button className="btn-primary">+ Add venue</button>
        </div>
        <div className="card-surface !bg-blush-50 overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead className="border-b border-burgundy-200/60 text-burgundy-800">
              <tr><th className="px-5 py-4 font-medium">Name</th><th className="px-5 py-4 font-medium">Area</th><th className="px-5 py-4 font-medium">From</th><th className="px-5 py-4 font-medium">Rating</th><th className="px-5 py-4 w-0" /></tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v.slug} className="border-b border-burgundy-200/40 hover:bg-blush-100/60">
                  <td className="px-5 py-4 text-burgundy-900">{v.name}</td>
                  <td className="px-5 py-4 text-burgundy-700">{v.area}</td>
                  <td className="px-5 py-4 text-burgundy-700">RM {v.price_from?.toLocaleString()}</td>
                  <td className="px-5 py-4 text-burgundy-700">{v.rating?.toFixed?.(1)}</td>
                  <td className="px-5 py-4"><div className="flex gap-1.5">
                    <button className="p-2 rounded hover:bg-burgundy-100 text-burgundy-800" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                    <button className="p-2 rounded hover:bg-burgundy-100 text-burgundy-800" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
