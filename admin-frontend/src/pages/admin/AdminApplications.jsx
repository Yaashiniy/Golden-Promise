import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Check, X, Clock, ChevronRight, FileText } from 'lucide-react'
import { Reveal } from '../../components/Reveal.jsx'
import { fetchApplications } from '../../api/vendorApplications.js'

const STATUS_STYLES = {
  pending:      { Icon: Clock,  color: 'bg-blush-200 text-burgundy-800' },
  under_review: { Icon: Search, color: 'bg-gold-400/30 text-burgundy-900' },
  approved:     { Icon: Check,  color: 'bg-burgundy-800 text-blush-100' },
  rejected:     { Icon: X,      color: 'bg-burgundy-900 text-blush-100' },
}

export default function AdminApplications() {
  const [status, setStatus] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', status],
    queryFn: () => fetchApplications(status ? { status } : {}),
  })
  const apps = data?.data ?? []

  return (
    <div className="bg-blush-100 min-h-[calc(100vh-5rem)]">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10">
        <Link to="/admin" className="inline-flex items-center gap-1 text-burgundy-700 hover:text-burgundy-900 text-sm mb-2">
          <ArrowLeft className="w-4 h-4" /> Admin
        </Link>
        <Reveal>
          <h1 className="font-display text-4xl text-burgundy-900">Vendor Applications</h1>
          <p className="text-burgundy-700 mt-1">Review, verify documents, approve or reject.</p>
        </Reveal>

        <div className="mt-6 flex gap-2 flex-wrap">
          {['', 'pending', 'under_review', 'approved', 'rejected'].map((s) => (
            <button key={s || 'all'} onClick={() => setStatus(s)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              status === s ? 'bg-burgundy-800 text-blush-100' : 'bg-blush-50 text-burgundy-800 border border-burgundy-200/60 hover:bg-blush-200'
            }`}>
              {s ? s.replace('_', ' ') : 'All'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Loader />
        ) : apps.length === 0 ? (
          <div className="mt-8 card-surface !bg-blush-50 p-12 text-center">
            <FileText className="w-10 h-10 mx-auto text-burgundy-400" />
            <p className="text-burgundy-700 mt-3">No applications match this filter.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {apps.map((a, i) => {
              const s = STATUS_STYLES[a.status] ?? STATUS_STYLES.pending
              return (
                <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link to={`/admin/applications/${a.id}`} className="card-surface !bg-blush-50 p-4 flex items-center gap-4 group">
                    <span className={`w-11 h-11 rounded-full grid place-items-center shrink-0 ${s.color}`}>
                      <s.Icon className="w-5 h-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display text-lg text-burgundy-900 truncate">{a.business_name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium ${s.color}`}>{a.status.replace('_', ' ')}</span>
                        {a.amendment_submitted_at && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold-400/20 text-burgundy-900">
                            Vendor amendment
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-burgundy-700 truncate">
                        {a.applicant_name} · {a.email} · {a.category?.name}
                      </p>
                      <p className="text-xs text-burgundy-600">
                        Ref <span className="font-mono">{a.reference}</span> · {a.city}, {a.state} · {a.amendment_submitted_at ? 'Updated' : 'Submitted'} {new Date(a.amendment_submitted_at ?? a.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-burgundy-500 group-hover:translate-x-0.5 transition shrink-0" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Loader() {
  return <div className="min-h-[30vh] grid place-items-center"><div className="w-10 h-10 rounded-full border-2 border-burgundy-300 border-t-burgundy-800 animate-spin" /></div>
}
