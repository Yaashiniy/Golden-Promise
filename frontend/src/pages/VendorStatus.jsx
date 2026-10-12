import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Check, X, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { checkApplicationStatus, resubmitApplication } from '../api/vendorApplications.js'
import { Reveal } from '../components/Reveal.jsx'

const STATUS_INFO = {
  pending:      { Icon: Clock,       color: 'bg-blush-200 text-burgundy-800', label: 'Pending review', desc: 'Your application is queued. We review in 3-5 business days.' },
  under_review: { Icon: Search,      color: 'bg-gold-400/30 text-burgundy-900', label: 'Under review', desc: 'Our team is actively reviewing your documents.' },
  approved:     { Icon: Check,       color: 'bg-burgundy-800 text-blush-100', label: 'Approved!', desc: 'Welcome! Login with your email — check your inbox for a temporary password.' },
  rejected:     { Icon: X,           color: 'bg-burgundy-900 text-blush-100', label: 'Rejected', desc: 'Unfortunately your application was not approved.' },
}

export default function VendorStatus() {
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')

  const check = useMutation({
    mutationFn: checkApplicationStatus,
    onError: () => toast.error('No application found. Double-check your reference and email.'),
  })

  const resubmit = useMutation({
    mutationFn: ({ appId, formData }) => resubmitApplication(appId, formData),
    onSuccess: () => {
      toast.success('Documents resubmitted successfully for AI verification.')
      check.mutate({ reference, email })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Resubmit failed.')
  })

  const [ssmFile, setSsmFile] = useState(null)
  const [nricFile, setNricFile] = useState(null)

  function submit(e) {
    e.preventDefault()
    if (!reference || !email) { toast.error('Please fill both fields'); return }
    check.mutate({ reference, email })
  }

  const result = check.data
  const info = result ? STATUS_INFO[result.status] : null

  return (
    <div className="bg-blush-100 min-h-[calc(100vh-5rem)]">
      <div className="max-w-2xl mx-auto px-6 lg:px-10 py-12">
        <Link to="/" className="inline-flex items-center gap-1 text-burgundy-700 hover:text-burgundy-900 text-sm mb-2">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <Reveal>
          <h1 className="font-display text-4xl text-burgundy-900">Application status</h1>
          <p className="text-burgundy-700 mt-2">Enter your reference and email to check your vendor application status.</p>
        </Reveal>

        <Reveal delay={0.05}>
          <form onSubmit={submit} className="mt-6 card-surface !bg-blush-50 p-6 space-y-4">
            <label className="block">
              <span className="block text-sm text-burgundy-700 mb-1">Reference</span>
              <input value={reference} onChange={(e) => setReference(e.target.value.toUpperCase())} placeholder="e.g. APP-XXXXXXXX" className="w-full px-4 py-2.5 bg-blush-100 border border-burgundy-200/60 rounded-lg font-mono focus:outline-none focus:border-burgundy-800" />
            </label>
            <label className="block">
              <span className="block text-sm text-burgundy-700 mb-1">Email used in application</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-blush-100 border border-burgundy-200/60 rounded-lg focus:outline-none focus:border-burgundy-800" />
            </label>
            <button type="submit" disabled={check.isPending} className="btn-primary w-full justify-center disabled:opacity-60">
              <Search className="w-4 h-4" /> {check.isPending ? 'Checking…' : 'Check status'}
            </button>
          </form>
        </Reveal>

        {result && info && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 card-surface !bg-blush-50 p-6">
            <div className="flex items-start gap-4">
              <span className={`w-12 h-12 rounded-full grid place-items-center shrink-0 ${info.color}`}>
                <info.Icon className="w-6 h-6" />
              </span>
              <div className="flex-1">
                <p className="font-display text-2xl text-burgundy-900">{info.label}</p>
                <p className="text-sm text-burgundy-700 mt-1">{info.desc}</p>
                <div className="mt-4 space-y-1 text-sm">
                  <p><span className="text-burgundy-700">Reference:</span> <span className="font-mono text-burgundy-900">{result.reference}</span></p>
                  <p><span className="text-burgundy-700">Business:</span> <span className="text-burgundy-900">{result.business_name}</span></p>
                  <p><span className="text-burgundy-700">Submitted:</span> {new Date(result.submitted_at).toLocaleString()}</p>
                  {result.reviewed_at && <p><span className="text-burgundy-700">Reviewed:</span> {new Date(result.reviewed_at).toLocaleString()}</p>}
                </div>
                {result.status === 'rejected' && result.rejection_reason && (
                  <div className="mt-4 p-3 bg-burgundy-100 rounded-lg text-sm">
                    <p className="text-xs uppercase tracking-wider text-burgundy-700 mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Reason</p>
                    <p className="text-burgundy-900">{result.rejection_reason}</p>
                  </div>
                )}
                {result.status === 'rejected' && result.ai_rejection_reason && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm">
                    <p className="text-xs uppercase tracking-wider text-red-700 mb-2 flex items-center gap-1 font-bold"><AlertCircle className="w-4 h-4" /> AI Verification Failed</p>
                    <p className="text-red-900 mb-4">{result.ai_rejection_reason}</p>
                    
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-red-800">Please re-upload the corrected documents:</p>
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">SSM Document (Optional if freelancer)</label>
                        <input type="file" onChange={(e) => setSsmFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200" />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">NRIC / Passport</label>
                        <input type="file" onChange={(e) => setNricFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200" />
                      </div>
                      <button 
                        onClick={() => {
                          if (!nricFile && !ssmFile) return toast.error('Please select at least one document to re-upload')
                          const fd = new FormData()
                          if (ssmFile) fd.append('ssm_doc', ssmFile)
                          if (nricFile) fd.append('nric_or_passport_doc', nricFile)
                          resubmit.mutate({ appId: result.id, formData: fd })
                        }}
                        disabled={resubmit.isPending}
                        className="btn-primary w-full justify-center text-xs py-2 mt-2"
                      >
                        {resubmit.isPending ? 'Resubmitting...' : 'Resubmit Application'}
                      </button>
                    </div>
                  </div>
                )}
                {result.status === 'approved' && (
                  <Link to="/login" className="btn-primary mt-4 inline-flex">Log in as vendor</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
