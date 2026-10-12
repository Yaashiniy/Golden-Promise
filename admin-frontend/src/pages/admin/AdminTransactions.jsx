import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Reveal } from '../../components/Reveal.jsx'
import { fetchAdminTransactions } from '../../api/admin.js'

const statusIcons = {
  success: { Icon: CheckCircle2, cls: 'text-burgundy-700' },
  failed: { Icon: XCircle, cls: 'text-burgundy-900' },
  pending: { Icon: Clock, cls: 'text-burgundy-500' },
}

export default function AdminTransactions() {
  const { data: txs = [], isLoading } = useQuery({ queryKey: ['admin-transactions'], queryFn: fetchAdminTransactions })

  return (
    <div className="bg-blush-100 min-h-[calc(100vh-5rem)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <Link to="/admin" className="inline-flex items-center gap-1 text-burgundy-700 hover:text-burgundy-900 text-sm mb-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <Reveal>
          <h1 className="font-display text-4xl text-burgundy-900">Transactions</h1>
          <p className="text-burgundy-700 mt-2">Every payment that runs through the platform.</p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-6 card-surface !bg-blush-50 overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="border-b border-burgundy-200/60 text-burgundy-800">
                <tr>
                  <th className="px-5 py-4 font-medium">Ref</th>
                  <th className="px-5 py-4 font-medium">Booking</th>
                  <th className="px-5 py-4 font-medium">User</th>
                  <th className="px-5 py-4 font-medium">Gateway</th>
                  <th className="px-5 py-4 font-medium">Type</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium text-right">Amount</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-burgundy-700">Loading…</td></tr>
                ) : txs.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-burgundy-700">No transactions yet.</td></tr>
                ) : txs.map((t) => {
                  const s = statusIcons[t.status] ?? statusIcons.pending
                  return (
                    <tr key={t.id} className="border-b border-burgundy-200/40 hover:bg-blush-100/60">
                      <td className="px-5 py-4 text-burgundy-900 font-mono text-xs">{t.gateway_ref ?? '—'}</td>
                      <td className="px-5 py-4 text-burgundy-800">{t.booking?.reference}</td>
                      <td className="px-5 py-4 text-burgundy-700 truncate max-w-[180px]">{t.booking?.user?.email}</td>
                      <td className="px-5 py-4 text-burgundy-700 capitalize">{t.gateway}</td>
                      <td className="px-5 py-4 text-burgundy-700 capitalize">{t.type}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm capitalize"><s.Icon className={`w-3.5 h-3.5 ${s.cls}`} />{t.status}</span>
                      </td>
                      <td className="px-5 py-4 text-burgundy-900 text-right">RM {Number(t.amount).toLocaleString()}</td>
                      <td className="px-5 py-4 text-burgundy-700 text-sm whitespace-nowrap">{new Date(t.created_at).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
