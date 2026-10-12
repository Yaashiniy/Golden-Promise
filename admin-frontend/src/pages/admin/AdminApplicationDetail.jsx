import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Check, X, FileText, ExternalLink, Building2, User as UserIcon,
  Mail, Phone, MapPin, CreditCard, Sparkles, AlertCircle, ShieldCheck, Wallet,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchApplication, approveApplication, rejectApplication } from '../../api/vendorApplications.js'
import { Reveal } from '../../components/Reveal.jsx'

export default function AdminApplicationDetail() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { data: a, isLoading } = useQuery({ queryKey: ['admin-app', id], queryFn: () => fetchApplication(id) })

  const [reason, setReason] = useState('')
  const [commission, setCommission] = useState('')
  const [businessType, setBusinessType] = useState('ssm')
  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [tempPassword, setTempPassword] = useState(null)

  useEffect(() => {
    if (a?.business_type) setBusinessType(a.business_type)
  }, [a?.business_type])

  const approve = useMutation({
    mutationFn: () => approveApplication(id, {
      commission_rate: commission ? Number(commission) : null,
      business_type: businessType,
    }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-app', id] })
      qc.invalidateQueries({ queryKey: ['admin-applications'] })
      setTempPassword(res.temp_password)
      setShowApprove(false)
      toast.success('Approved!')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Approve failed'),
  })

  const reject = useMutation({
    mutationFn: () => rejectApplication(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-app', id] })
      qc.invalidateQueries({ queryKey: ['admin-applications'] })
      setShowReject(false)
      toast.success('Application rejected')
    },
  })

  if (isLoading) return <Loader />
  if (!a) return null

  const canReview = a.status === 'pending' || a.status === 'under_review'

  return (
    <div className="bg-blush-100 min-h-[calc(100vh-5rem)]">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10">
        <Link to="/admin/applications" className="inline-flex items-center gap-1 text-burgundy-700 hover:text-burgundy-900 text-sm mb-2">
          <ArrowLeft className="w-4 h-4" /> All applications
        </Link>

        <Reveal>
          <div className="flex items-baseline justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-burgundy-700 font-mono">{a.reference}</p>
              <h1 className="font-display text-3xl text-burgundy-900">{a.business_name}</h1>
              <p className="text-sm text-burgundy-700 mt-1">Applied {new Date(a.created_at).toLocaleString()}</p>
            </div>
            <StatusBadge status={a.status} />
          </div>
        </Reveal>

        {/* Approved success banner */}
        {tempPassword && (
          <div className="mt-4 card-surface !bg-burgundy-800 text-blush-100 p-5">
            <p className="font-display text-xl">🎉 Vendor account created</p>
            <p className="text-sm opacity-90 mt-1">Share these credentials with the vendor (they should reset after first login):</p>
            <div className="mt-3 p-3 bg-blush-100/10 rounded-lg font-mono text-sm">
              Email: {a.email}<br />
              Temp password: <span className="font-bold text-gold-400">{tempPassword}</span>
            </div>
          </div>
        )}

        {a.amendment_submitted_at && a.amendment_changes?.length > 0 && (
          <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-full bg-gold-400/20 text-burgundy-900 grid place-items-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl text-burgundy-900">Vendor-submitted changes</h2>
                <p className="text-xs text-burgundy-600 mt-0.5">Submitted {new Date(a.amendment_submitted_at).toLocaleString()}</p>
                <div className="mt-4 divide-y divide-burgundy-900/10">
                  {a.amendment_changes.map((change, index) => (
                    <div key={`${change.field}-${index}`} className="py-3 first:pt-0 last:pb-0 grid sm:grid-cols-[11rem_1fr] gap-1 sm:gap-4 text-sm">
                      <span className="font-semibold text-burgundy-900">{change.label}</span>
                      <span className="text-burgundy-700 break-words">
                        <span className="line-through opacity-60">{change.from || 'Not provided'}</span>
                        <span className="mx-2 text-gold-600">→</span>
                        <span className="font-medium text-burgundy-900">{change.to || 'Not provided'}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Applicant */}
            <Card title="Applicant" Icon={UserIcon}>
              <Row Icon={UserIcon} label="Name" value={a.applicant_name} />
              <Row Icon={Mail} label="Email" value={a.email} />
              <Row Icon={Phone} label="Phone" value={a.phone} />
            </Card>

            {/* Business */}
            <Card title="Business" Icon={Building2}>
              <Row label="Business name" value={a.business_name} />
              <Row label="Category" value={a.category?.name} />
              <Row label="Requested Setup Type" value={<span className="capitalize font-bold text-burgundy-900">{a.business_type === 'ssm' ? 'SSM Registered' : a.business_type === 'startup' ? 'Startup Team' : 'Homemade / Freelancer'}</span>} />
              <Row Icon={MapPin} label="Address" value={`${a.business_address}, ${a.city}, ${a.state} ${a.postcode ?? ''}`} />
            </Card>

            {/* Documents */}
            <Card title="Legal documents" Icon={FileText}>
              {a.business_type === 'ssm' ? (
                <>
                  <Row label="SSM number" value={<span className="font-mono">{a.ssm_number}</span>} />
                  <DocRow label="SSM certificate" path={a.ssm_doc_path} required />
                </>
              ) : (
                <Row label="Portfolio / Social Link" value={<a href={a.website} target="_blank" rel="noreferrer" className="text-burgundy-800 hover:underline font-bold break-all">{a.website}</a>} />
              )}
              <DocRow label="NRIC / passport" path={a.nric_or_passport_doc_path} required />
            </Card>

            {/* Banking */}
            <Card title="Banking (for payouts)" Icon={CreditCard}>
              <Row label="Bank" value={a.bank_name} />
              <Row label="Account number" value={<span className="font-mono">{a.bank_account_number}</span>} />
              <Row label="Account holder" value={a.bank_account_holder} />
            </Card>

            {/* Subscription + Payment */}
            <Card title="Subscription" Icon={Wallet}>
              <Row label="Plan requested" value={<span className="capitalize font-medium">{a.subscription_tier_requested === 'golpro' ? 'Elite' : a.subscription_tier_requested}</span>} />
              {a.subscription_tier_requested !== 'free' && (
                <DocRow label="Payment proof" path={a.payment_proof_path} required />
              )}
            </Card>

            {/* Public profile */}
            <Card title="Public profile" Icon={Sparkles}>
              <div>
                <p className="text-xs text-burgundy-600 uppercase mb-1">Bio</p>
                <p className="text-sm text-burgundy-800 whitespace-pre-line">{a.bio}</p>
              </div>
              <Row label="Starting price" value={`RM ${Number(a.price_from ?? 0).toLocaleString()}`} />
              <Row label="Years experience" value={a.years_experience ?? '—'} />
              <Row label="Instagram" value={a.instagram ? `@${a.instagram}` : '—'} />
              <Row label="Website" value={a.website ?? '—'} />
              {a.specialties?.length > 0 && (
                <div>
                  <p className="text-xs text-burgundy-600 uppercase mb-1">Specialties</p>
                  <div className="flex flex-wrap gap-1">
                    {a.specialties.map((s) => <span key={s} className="px-2 py-0.5 rounded-full bg-blush-200 text-burgundy-800 text-xs">{s}</span>)}
                  </div>
                </div>
              )}
              {a.languages?.length > 0 && <Row label="Languages" value={a.languages.join(', ')} />}
              {a.religion_focus?.length > 0 && <Row label="Cultures served" value={a.religion_focus.join(', ')} />}
              {a.portfolio_urls?.length > 0 && (
                <div>
                  <p className="text-xs text-burgundy-600 uppercase mb-1">Portfolio links</p>
                  {a.portfolio_urls.map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noreferrer" className="block text-sm text-burgundy-800 hover:underline truncate">{u}</a>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar — actions */}
          <aside>
            <div className="card-surface !bg-blush-50 p-5 sticky top-28">
              <h2 className="font-display text-xl text-burgundy-900 mb-3">Review actions</h2>

              {!canReview ? (
                <div className="p-3 rounded-lg bg-blush-100 text-sm">
                  {a.status === 'approved' ? (
                    <>
                      <p className="text-burgundy-900 font-medium flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Approved</p>
                      {a.vendor && (
                        <Link to={`/vendor/${a.vendor.slug}`} className="mt-3 inline-flex items-center gap-1 text-burgundy-800 underline text-xs">
                          View live profile <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-burgundy-900 font-medium flex items-center gap-1.5"><X className="w-4 h-4" /> Rejected</p>
                      {a.rejection_reason && <p className="text-xs text-burgundy-700 mt-2">Reason: {a.rejection_reason}</p>}
                    </>
                  )}
                  {a.reviewed_at && <p className="text-[10px] text-burgundy-600 mt-2">Reviewed {new Date(a.reviewed_at).toLocaleString()} by {a.reviewer?.name}</p>}
                </div>
              ) : !showApprove && !showReject ? (
                <div className="space-y-2">
                  <button onClick={() => setShowApprove(true)} className="btn-primary w-full justify-center">
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => setShowReject(true)} className="btn-ghost w-full justify-center">
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <p className="text-[11px] text-burgundy-600 mt-3 flex gap-1.5 items-start">
                    <AlertCircle className="w-3 h-3 mt-0.5" />
                    {a.created_vendor_id ? 'Approving verifies the amended legal information. The existing public listing remains available.' : "Approving creates the vendor's login and profile."}
                  </p>
                </div>
              ) : showApprove ? (
                <div className="space-y-3">
                  <p className="font-medium text-burgundy-900">Approve this vendor?</p>
                  
                  <label className="block">
                    <span className="text-xs text-burgundy-700 font-bold block mb-1">Verify Business Type Setup</span>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-3 py-2 bg-blush-100 border border-burgundy-200/60 rounded text-sm focus:outline-none focus:border-burgundy-800"
                    >
                      <option value="ssm">SSM Registered Company</option>
                      <option value="startup">Startup Team / Agency</option>
                      <option value="homemade">Homemade / Freelancer</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs text-burgundy-700">Custom commission % (optional, default 10%)</span>
                    <input type="number" min="0" max="30" step="0.5" value={commission} onChange={(e) => setCommission(e.target.value)} className="w-full mt-1 px-3 py-1.5 bg-blush-100 border border-burgundy-200/60 rounded text-sm focus:outline-none focus:border-burgundy-800" placeholder="10" />
                  </label>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => approve.mutate()} disabled={approve.isPending} className="flex-1 btn-primary text-sm !py-1.5">
                      {approve.isPending ? 'Approving…' : 'Confirm approve'}
                    </button>
                    <button onClick={() => setShowApprove(false)} className="btn-ghost !py-1.5"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-burgundy-900 mb-2">Rejection reason</p>
                  <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 bg-blush-100 border border-burgundy-200/60 rounded text-sm focus:outline-none focus:border-burgundy-800" placeholder="Explain why (min 10 chars, will be shown to applicant)" />
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => reason.length >= 10 && reject.mutate()} disabled={reason.length < 10 || reject.isPending} className="flex-1 btn-primary text-sm !py-1.5 disabled:opacity-40">
                      {reject.isPending ? 'Rejecting…' : 'Confirm reject'}
                    </button>
                    <button onClick={() => setShowReject(false)} className="btn-ghost !py-1.5"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Card({ title, Icon, children }) {
  return (
    <div className="card-surface !bg-blush-50 p-5">
      <h3 className="font-display text-lg text-burgundy-900 flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" /> {title}
      </h3>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  )
}
function Row({ Icon, label, value }) {
  return (
    <div className="flex gap-3 items-start">
      {Icon && <Icon className="w-4 h-4 text-burgundy-500 mt-0.5 shrink-0" />}
      <span className="text-burgundy-700 w-32 shrink-0">{label}</span>
      <span className="text-burgundy-900 flex-1">{value ?? '—'}</span>
    </div>
  )
}
function DocRow({ label, path, required }) {
  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-blush-100">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="w-4 h-4 text-burgundy-700 shrink-0" />
        <p className="text-sm text-burgundy-900 truncate">{label}{required && ' *'}</p>
      </div>
      {path ? (
        <a href={`/storage/${path}`} target="_blank" rel="noreferrer" className="text-xs px-2.5 py-1 rounded-full bg-burgundy-800 text-blush-100 inline-flex items-center gap-1">
          View <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <span className="text-xs text-burgundy-500">Not provided</span>
      )}
    </div>
  )
}
function StatusBadge({ status }) {
  const map = {
    pending: 'bg-blush-200 text-burgundy-800',
    under_review: 'bg-gold-400/30 text-burgundy-900',
    approved: 'bg-burgundy-800 text-blush-100',
    rejected: 'bg-burgundy-900 text-blush-100',
  }
  return <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${map[status] ?? ''}`}>{status.replace('_', ' ')}</span>
}
function Loader() {
  return <div className="min-h-[60vh] grid place-items-center"><div className="w-10 h-10 rounded-full border-2 border-burgundy-300 border-t-burgundy-800 animate-spin" /></div>
}
