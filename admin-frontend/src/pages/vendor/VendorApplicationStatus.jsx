import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileText, ShieldCheck, AlertCircle, FileUp, Sparkles, User, Phone, MapPin, Building, CreditCard, AlignLeft, ArrowRight, CheckCircle2, XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { api } from '../../api/client.js'
import { VendorSidebar } from '../../components/VendorSidebar.jsx'
import { BadgeClaimPrinter, VerificationReceipt } from '../../components/BadgeClaimPrinter.jsx'
import { SuccessCard } from '../../components/SuccessCard.jsx'

const MALAYSIAN_STATES = [
  'Kuala Lumpur', 'Selangor', 'Johor', 'Penang', 'Perak', 'Kedah', 'Pahang',
  'Malacca', 'Negeri Sembilan', 'Kelantan', 'Terengganu', 'Perlis', 'Sabah',
  'Sarawak', 'Labuan', 'Putrajaya'
]

export default function VendorApplicationStatus() {
  const { user, refresh } = useAuth()
  const qc = useQueryClient()
  const [sidebarOpen] = useState(() => localStorage.getItem('sidebar_left_open') !== 'false')
  const [celebrate, setCelebrate] = useState(false)
  const [printerOpen, setPrinterOpen] = useState(false)
  const [successDismissed, setSuccessDismissed] = useState(false)

  const tier = user?.vendor?.subscription_tier ?? 'free' // 'elite', 'premium', or 'free'
  const isPaid = (tier === 'premium' || tier === 'elite')

  // Form states
  const [reqType, setReqType] = useState('ssm') // 'ssm', 'startup', 'homemade'
  const [ssmNumber, setSsmNumber] = useState('')
  const [socialLink, setSocialLink] = useState('')
  const [ssmDoc, setSsmDoc] = useState(null)
  const [nricDoc, setNricDoc] = useState(null)
  const [paymentProof, setPaymentProof] = useState(null)

  // Registration profile details states
  const [applicantName, setApplicantName] = useState('')
  const [phone, setPhone] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankAccountHolder, setBankAccountHolder] = useState('')
  const [bio, setBio] = useState('')

  // Prefill when user data is ready
  useEffect(() => {
    if (user) {
      setApplicantName(user.name || '')
      setBankAccountHolder(user.name || '')
      if (user.vendor) {
        setPhone(user.vendor.whatsapp_phone || '')
        setBusinessName(user.vendor.name || '')
        setAddress(user.vendor.address === 'Pending Setup' ? '' : (user.vendor.address || ''))
        setCity(user.vendor.area === 'Kuala Lumpur' ? '' : (user.vendor.area || ''))
        setState(user.vendor.state === 'Kuala Lumpur' ? '' : (user.vendor.state || ''))
        setBio(user.vendor.bio || '')
      }
    }
  }, [user])

  const { data: app, isLoading, refetch } = useQuery({
    queryKey: ['my-application-status'],
    queryFn: async () => (await api.get('/vendor-portal/my-application')).data,
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
  })

  const submitVerification = useMutation({
    mutationFn: async () => {
      // Validations
      if (!applicantName.trim()) throw new Error('Contact Person Name is required')
      if (!phone.trim()) throw new Error('WhatsApp Phone Number is required')
      if (!businessName.trim()) throw new Error('Shop / Business Name is required')
      if (!address.trim()) throw new Error('Full Address is required')
      if (!city.trim()) throw new Error('City / Area is required')
      if (!state) throw new Error('State is required')
      if (!bankName.trim()) throw new Error('Bank Name is required')
      if (!bankAccountNumber.trim()) throw new Error('Bank Account Number is required')
      if (!bankAccountHolder.trim()) throw new Error('Bank Account Holder Name is required')
      if (!bio.trim()) throw new Error('Bio / Business Description is required')
      
      const fd = new FormData()
      fd.append('business_type', reqType)
      fd.append('nric_doc', nricDoc)

      fd.append('applicant_name', applicantName)
      fd.append('phone', phone)
      fd.append('business_name', businessName)
      fd.append('business_address', address)
      fd.append('city', city)
      fd.append('state', state)
      fd.append('bank_name', bankName)
      fd.append('bank_account_number', bankAccountNumber)
      fd.append('bank_account_holder', bankAccountHolder)
      fd.append('bio', bio)

      if (reqType === 'ssm') {
        if (!ssmNumber.trim()) throw new Error('SSM Registration Number is required')
        if (!ssmDoc) throw new Error('SSM Certificate document is required')
        fd.append('ssm_number', ssmNumber)
        fd.append('ssm_doc', ssmDoc)
      } else {
        if (!socialLink.trim()) throw new Error('Link to social media / portfolio is required')
        fd.append('social_link', socialLink)
      }

      if (!nricDoc) throw new Error('NRIC / Passport identification document copy is required')

      if (isPaid) {
        if (!paymentProof) throw new Error(`Proof of subscription payment is required for ${tier === 'elite' ? 'Elite' : 'Premium'} tier accounts`)
        fd.append('payment_proof', paymentProof)
      }

      const { data } = await api.post('/vendor-portal/my-application', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => {
      toast.success('Verification request submitted!')
      refetch()
      refresh()
      qc.invalidateQueries({ queryKey: ['my-vendor'] })
      qc.invalidateQueries({ queryKey: ['my-vendor-detail'] })
    },
    onError: (err) => {
      toast.error(err.message || err.response?.data?.message || 'Failed to submit request')
    },
  })

  const claimBadge = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/vendor-portal/claim-badge')
      return data
    },
    onSuccess: () => {
      toast.success('Badge claimed successfully!')
      setCelebrate(true)
      refetch()
      refresh()
      qc.invalidateQueries({ queryKey: ['my-vendor'] })
      qc.invalidateQueries({ queryKey: ['my-vendor-detail'] })
      qc.invalidateQueries({ queryKey: ['vendor-analytics'] })
      qc.invalidateQueries({ queryKey: ['vendor-analytics-sidebar'] })
      setTimeout(() => setCelebrate(false), 5000)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to claim badge')
    },
  })

  if (isLoading) return <Loader />

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#2C2A29] flex overflow-hidden">
      <style>{`
        .gp-app-receipt {
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.06));
        }
        .gp-app-receipt .receipt {
          background-color: #fff;
          position: relative;
          padding: 30px;
          border-radius: 4px;
        }
        /* Jagged top/bottom using repeating linear gradient */
        .gp-app-receipt .receipt::before,
        .gp-app-receipt .receipt::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          height: 8px;
          background-size: 16px 16px;
        }
        .gp-app-receipt .receipt::before {
          top: -8px;
          background-image: linear-gradient(135deg, transparent 50%, #fff 50%),
                            linear-gradient(-135deg, transparent 50%, #fff 50%);
          background-position: top left, top left;
        }
        .gp-app-receipt .receipt::after {
          bottom: -8px;
          background-image: linear-gradient(135deg, #fff 50%, transparent 50%),
                            linear-gradient(-135deg, #fff 50%, transparent 50%);
          background-position: bottom left, bottom left;
        }
        .gp-app-receipt .header {
          text-align: center;
          margin-bottom: 25px;
          border-bottom: 2px dashed #ddd;
          padding-bottom: 15px;
        }
        .gp-app-receipt .title {
          font-family: "Great Vibes", cursive;
          font-size: 2rem;
          color: #7B1F2A;
          margin-bottom: 5px;
        }
        .gp-app-receipt .subtitle {
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: bold;
          margin-bottom: 10px;
          color: #4E1218;
        }
        .gp-app-receipt .info {
          text-align: center;
          font-size: 0.85rem;
          margin-bottom: 18px;
          line-height: 1.5;
          color: #666;
        }
        .gp-app-receipt .section {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #7B1F2A;
          border-top: 1px dashed #ddd;
          padding-top: 12px;
          margin-bottom: 6px;
        }
        .gp-app-receipt table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 0.85rem;
        }
        .gp-app-receipt table th,
        .gp-app-receipt table td {
          padding: 6px 4px;
          text-align: left;
          border-bottom: 1px solid #eee;
          vertical-align: top;
        }
        .gp-app-receipt table td:last-child {
          text-align: right;
          font-weight: 600;
          color: #4E1218;
          word-break: break-word;
        }
        .gp-app-receipt table td.mono { font-family: ui-monospace, "Roboto Mono", monospace; }
        .gp-app-receipt table a { color: #7B1F2A; text-decoration: underline; }
        .gp-app-receipt table a:hover { color: #4E1218; }
        .gp-app-receipt .note {
          font-size: 0.8rem;
          line-height: 1.6;
          white-space: pre-wrap;
          background: #fafafa;
          border-radius: 6px;
          padding: 10px 12px;
          margin-bottom: 15px;
          color: #444;
        }
        .gp-app-receipt .total {
          display: flex;
          justify-content: space-between;
          font-size: 1rem;
          font-weight: bold;
          margin-bottom: 15px;
          border-top: 1px dashed #ddd;
          padding-top: 12px;
          color: #4E1218;
        }
        .gp-app-receipt .total p { margin: 0; }
        .gp-app-receipt .thanks {
          font-size: 0.85rem;
          text-align: center;
          margin-top: 10px;
          color: #666;
        }
      `}</style>
      <VendorSidebar />

      {/* Rendered outside the approved banner: claiming flips is_badge_claimed, which
          unmounts that banner — the receipt has to survive so it stays until X. */}
      <BadgeClaimPrinter
        open={printerOpen}
        onClose={() => setPrinterOpen(false)}
        onClaim={() => claimBadge.mutate()}
        isPending={claimBadge.isPending}
        vendorName={user?.vendor?.name ?? app?.business_name ?? 'Your business'}
        businessTypeLabel={
          app?.business_type === 'ssm' ? 'SSM COMPANY'
            : app?.business_type === 'startup' ? 'STARTUP TEAM'
            : 'FREELANCER'
        }
        applicationId={app?.id}
        approvedDate={(app?.reviewed_at ?? app?.updated_at ?? '').slice(0, 10) || undefined}
      />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:pl-[270px]' : 'lg:pl-0'} px-4 sm:px-6 lg:px-8 pt-28 pb-16 max-w-[1536px] mx-auto`}>
        {celebrate && <ConfettiOverlay />}

        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="font-display text-4xl text-burgundy-900 font-bold">My Verification Status</h1>
            <p className="text-burgundy-700 mt-1 text-sm">Submit your complete business registration information and files to get verified.</p>
          </div>
          {app && app.id && (
            <StatusLabel status={app.status} claimed={!!user?.vendor?.is_badge_claimed} />
          )}
        </div>

        {app && app.id ? (
          <div className="mt-8 space-y-6">
            {/* Approved & unclaimed banner */}
            {app.status === 'approved' && !user?.vendor?.is_badge_claimed && (
              <div className="relative overflow-hidden rounded-2xl bg-white border border-burgundy-900/10 shadow-[0_18px_45px_-30px_rgba(78,18,24,0.4)]">
                {/* thin gold hairline instead of a heavy border */}
                <div className="h-[3px] w-full bg-gradient-to-r from-[#C08E3F] via-[#E2C178] to-[#C08E3F]" />

                <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#C08E3F]/10 px-3 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C08E3F]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C08E3F]">Approved</span>
                    </span>

                    <h3 className="mt-3.5 font-display text-2xl leading-snug text-burgundy-950">
                      Your application has been approved
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-neutral-600 max-w-xl">
                      Verified as{' '}
                      <strong className="font-semibold text-burgundy-900">
                        {app.business_type === 'ssm' ? 'SSM Registered Company' : app.business_type === 'startup' ? 'Startup Team' : 'Homemade / Freelancer'}
                      </strong>
                      . Print your verification receipt to claim your badge and go live in the public directory.
                    </p>
                  </div>

                  <button
                    onClick={() => setPrinterOpen(true)}
                    className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-burgundy-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-burgundy-955 hover:-translate-y-0.5 shadow-[0_12px_28px_-14px_rgba(78,18,24,0.8)] cursor-pointer"
                  >
                    Claim badge
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Approved & claimed — success toast. The printed receipt lives beside
                the details card below, not here. */}
            {app.status === 'approved' && user?.vendor?.is_badge_claimed && !successDismissed && (
              <SuccessCard
                title="Badge Claimed & Active!"
                subtitle="Your page is ready to be published."
                onDismiss={() => setSuccessDismissed(true)}
              />
            )}

            {/* Details card, with the printed receipt beside it (top-right) once claimed */}
            <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* w-full so it still fills the width when stacked — `items-start` on the
                row would otherwise shrink it to its content on mobile. Capped on
                desktop so the label/value rows don't stretch too far apart. */}
            <div className="gp-app-receipt w-full lg:w-auto lg:max-w-[780px] flex-1 min-w-0">
              <div className="receipt">
                <p className="shop-name">{app.business_name}</p>
                <p className="info">
                  {app.business_address}<br />
                  {app.city}, {app.state}<br />
                  Submitted: {(app.created_at ?? '').slice(0, 10) || '—'}
                </p>

                <p className="section">Contact &amp; Shop Basics</p>
                <table>
                  <tbody>
                    <tr><td>Contact Person</td><td>{app.applicant_name}</td></tr>
                    <tr><td>WhatsApp Phone</td><td>{app.phone}</td></tr>
                    <tr><td>Shop / Business</td><td>{app.business_name}</td></tr>
                    <tr><td>City &amp; State</td><td>{app.city}, {app.state}</td></tr>
                  </tbody>
                </table>

                {app.bio && (
                  <>
                    <p className="section">Bio / Description</p>
                    <p className="note">{app.bio}</p>
                  </>
                )}

                <p className="section">Banking Credentials</p>
                <table>
                  <tbody>
                    <tr><td>Bank Name</td><td>{app.bank_name}</td></tr>
                    <tr><td>Account Number</td><td className="mono">{app.bank_account_number}</td></tr>
                    <tr><td>Account Holder</td><td>{app.bank_account_holder}</td></tr>
                  </tbody>
                </table>

                <p className="section">Legal Documents &amp; Uploads</p>
                <table>
                  <tbody>
                    <tr>
                      <td>Requested Setup Type</td>
                      <td>{app.business_type === 'ssm' ? 'SSM Registered' : app.business_type === 'startup' ? 'Startup Team' : 'Homemade / Freelancer'}</td>
                    </tr>
                    {app.business_type === 'ssm' ? (
                      <>
                        <tr><td>SSM Registration No.</td><td className="mono">{app.ssm_number}</td></tr>
                        {app.ssm_doc_path && (
                          <tr>
                            <td>SSM Certificate</td>
                            <td><a href={`/storage/${app.ssm_doc_path}`} target="_blank" rel="noreferrer">View file</a></td>
                          </tr>
                        )}
                      </>
                    ) : (
                      <tr>
                        <td>Social / Portfolio Link</td>
                        <td><a href={app.website} target="_blank" rel="noreferrer">{app.website}</a></td>
                      </tr>
                    )}
                    {app.nric_or_passport_doc_path && (
                      <tr>
                        <td>NRIC / Passport Copy</td>
                        <td><a href={`/storage/${app.nric_or_passport_doc_path}`} target="_blank" rel="noreferrer">View file</a></td>
                      </tr>
                    )}
                    {app.payment_proof_path && (
                      <tr>
                        <td>Payment Proof</td>
                        <td><a href={`/storage/${app.payment_proof_path}`} target="_blank" rel="noreferrer">View file</a></td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Admin approval alone isn't the finish line — the badge still has to
                    be claimed, so don't call it Approved until that's actually done. */}
                <div className="total">
                  <p>Status</p>
                  <p className="capitalize">
                    {app.status === 'approved'
                      ? (user?.vendor?.is_badge_claimed ? 'Approved' : 'Pending claim')
                      : app.status}
                  </p>
                </div>

                <p className="thanks">Thank you for verifying with Golden Promise!</p>
              </div>

            </div>

              {/* Printed receipt — sits top-right beside the details card once claimed */}
              {app.status === 'approved' && user?.vendor?.is_badge_claimed && (
                <div className="shrink-0 mx-auto lg:mx-0">
                  <VerificationReceipt
                    vendorName={user?.vendor?.name ?? app.business_name ?? 'Your business'}
                    businessTypeLabel={
                      app.business_type === 'ssm' ? 'SSM COMPANY'
                        : app.business_type === 'startup' ? 'STARTUP TEAM'
                        : 'FREELANCER'
                    }
                    applicationId={app.id}
                    approvedDate={(app.reviewed_at ?? app.updated_at ?? '').slice(0, 10) || undefined}
                  />
                  <button
                    onClick={() => setPrinterOpen(true)}
                    className="mt-3 w-full text-xs font-bold underline text-burgundy-900 hover:text-burgundy-700 cursor-pointer"
                  >
                    Reprint receipt
                  </button>
                </div>
              )}
            </div>

            {/* Re-submission Form if Rejected */}
            {app.status === 'rejected' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-900">
                  <p className="font-bold text-sm">Rejection Reason from Admin:</p>
                  <p className="text-xs mt-1">{app.admin_notes || app.rejection_reason || 'No notes provided. Please check credentials and resubmit.'}</p>
                </div>
                <SubmitForm
                  reqType={reqType} setReqType={setReqType}
                  ssmNumber={ssmNumber} setSsmNumber={setSsmNumber}
                  socialLink={socialLink} setSocialLink={setSocialLink}
                  setSsmDoc={setSsmDoc} setNricDoc={setNricDoc}
                  ssmDocName={ssmDoc?.name} nricDocName={nricDoc?.name}
                  applicantName={applicantName} setApplicantName={setApplicantName}
                  phone={phone} setPhone={setPhone}
                  businessName={businessName} setBusinessName={setBusinessName}
                  address={address} setAddress={setAddress}
                  city={city} setCity={setCity}
                  state={state} setState={setState}
                  bankName={bankName} setBankName={setBankName}
                  bankAccountNumber={bankAccountNumber} setBankAccountNumber={setBankAccountNumber}
                  bankAccountHolder={bankAccountHolder} setBankAccountHolder={setBankAccountHolder}
                  bio={bio} setBio={setBio}
                  onSubmit={() => submitVerification.mutate()}
                  isPending={submitVerification.isPending}
                  tier={tier}
                  paymentProof={paymentProof}
                  setPaymentProof={setPaymentProof}
                  paymentProofName={paymentProof?.name}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-white border border-burgundy-900/10 shadow-[0_18px_45px_-30px_rgba(78,18,24,0.4)] w-full lg:max-w-4xl mx-auto">
              <div className="h-[3px] w-full bg-gradient-to-r from-[#C08E3F] via-[#E2C178] to-[#C08E3F]" />
              <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-600">Pending Setup</span>
                  </span>
                  
                  <h3 className="mt-3.5 font-display text-2xl leading-snug text-burgundy-950">
                    Verification Details Required
                  </h3>
                  
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 max-w-xl">
                    Please provide your complete business registration information, banking details, bio, and upload required documents below. Admin will review these to activate your verified trust badge.
                  </p>
                </div>
                <div className="shrink-0 hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 text-orange-500">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            <SubmitForm
              reqType={reqType} setReqType={setReqType}
              ssmNumber={ssmNumber} setSsmNumber={setSsmNumber}
              socialLink={socialLink} setSocialLink={setSocialLink}
              setSsmDoc={setSsmDoc} setNricDoc={setNricDoc}
              ssmDocName={ssmDoc?.name} nricDocName={nricDoc?.name}
              applicantName={applicantName} setApplicantName={setApplicantName}
              phone={phone} setPhone={setPhone}
              businessName={businessName} setBusinessName={setBusinessName}
              address={address} setAddress={setAddress}
              city={city} setCity={setCity}
              state={state} setState={setState}
              bankName={bankName} setBankName={setBankName}
              bankAccountNumber={bankAccountNumber} setBankAccountNumber={setBankAccountNumber}
              bankAccountHolder={bankAccountHolder} setBankAccountHolder={setBankAccountHolder}
              bio={bio} setBio={setBio}
              onSubmit={() => submitVerification.mutate()}
              isPending={submitVerification.isPending}
              tier={tier}
              paymentProof={paymentProof}
              setPaymentProof={setPaymentProof}
              paymentProofName={paymentProof?.name}
            />
          </div>
        )}
      </main>
    </div>
  )
}

function SubmitForm({
  reqType, setReqType, ssmNumber, setSsmNumber, socialLink, setSocialLink,
  setSsmDoc, setNricDoc, ssmDocName, nricDocName, onSubmit, isPending,
  applicantName, setApplicantName, phone, setPhone, businessName, setBusinessName,
  address, setAddress, city, setCity, state, setState, bankName, setBankName,
  bankAccountNumber, setBankAccountNumber, bankAccountHolder, setBankAccountHolder, bio, setBio,
  tier, paymentProof, setPaymentProof, paymentProofName
}) {
  const isPaid = (tier === 'premium' || tier === 'elite')

  return (
    <div className="gp-app-receipt w-full lg:max-w-4xl mx-auto my-6">
      <div className="receipt space-y-6 !p-6 sm:!p-10">
        <div className="header border-none pb-0 mb-8">
          <div className="title font-display text-4xl mb-2">Golden Promise Directory</div>
          <div className="subtitle text-neutral-500">VENDOR VERIFICATION APPLICATION</div>
        </div>

      {/* SECTION 1: Contact Details */}
      <div className="space-y-4">
        <h4 className="font-display text-xl text-burgundy-900 font-bold border-b border-neutral-100 pb-3 mb-4">
          <span className="text-[#C08E3F] mr-1">1.</span> Contact Person & Owner Info
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs text-burgundy-700 mb-1 font-semibold">Contact Person Name *</span>
            <input
              type="text" required value={applicantName} onChange={(e) => setApplicantName(e.target.value)}
              placeholder="Full name of contact person"
              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-burgundy-955 text-sm shadow-sm"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-burgundy-700 mb-1 font-semibold">WhatsApp Phone Number *</span>
            <input
              type="text" required value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 60123456789"
              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-burgundy-955 text-sm shadow-sm"
            />
          </label>
        </div>
      </div>

      {/* SECTION 2: Shop & Business Address */}
      <div className="space-y-4 pt-4">
        <h4 className="font-display text-xl text-burgundy-900 font-bold border-b border-neutral-100 pb-3 mb-4">
          <span className="text-[#C08E3F] mr-1">2.</span> Business Details & Location
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block sm:col-span-2">
            <span className="block text-xs text-burgundy-700 mb-1 font-semibold">Shop / Business Name *</span>
            <input
              type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Always Wonder Catering"
              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-burgundy-955 text-sm shadow-sm"
            />
          </label>
          
          <label className="block">
            <span className="block text-xs text-burgundy-700 mb-1 font-semibold">City / Area *</span>
            <input
              type="text" required value={city} onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Petaling Jaya"
              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-burgundy-955 text-sm shadow-sm"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-burgundy-700 mb-1 font-semibold">State *</span>
            <select
              required value={state} onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-burgundy-955 text-sm shadow-sm"
            >
              <option value="">Select State...</option>
              {MALAYSIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="block text-xs text-burgundy-700 mb-1 font-semibold">Full Address *</span>
            <input
              type="text" required value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder="Full shop street address"
              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-burgundy-955 text-sm shadow-sm"
            />
          </label>
          
          <label className="block sm:col-span-2">
            <span className="block text-xs text-burgundy-700 mb-1 font-semibold">Bio / Description *</span>
            <textarea
              required value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="Tell couples about your services, style, and what makes you unique."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-2xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-burgundy-955 text-sm shadow-sm"
            />
          </label>
        </div>
      </div>

      {/* SECTION 3: Banking Credentials */}
      <div className="space-y-4 pt-4">
        <h4 className="font-display text-xl text-burgundy-900 font-bold border-b border-neutral-100 pb-3 mb-4">
          <span className="text-[#C08E3F] mr-1">3.</span> Banking Details (For Verification)
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block sm:col-span-2">
            <span className="block text-xs text-burgundy-700 mb-1 font-semibold">Bank Name *</span>
            <input
              type="text" required value={bankName} onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Maybank, CIMB, Public Bank"
              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-burgundy-955 text-sm shadow-sm"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-burgundy-700 mb-1 font-semibold">Account Number *</span>
            <input
              type="text" required value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)}
              placeholder="e.g. 164010XXXXXX"
              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-burgundy-955 text-sm font-mono shadow-sm"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-burgundy-700 mb-1 font-semibold">Account Holder Name *</span>
            <input
              type="text" required value={bankAccountHolder} onChange={(e) => setBankAccountHolder(e.target.value)}
              placeholder="Full name on bank account"
              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-burgundy-955 text-sm shadow-sm"
            />
          </label>
        </div>
      </div>

      {/* SECTION 4: Setup Type & Documents */}
      <div className="space-y-4 pt-4">
        <h4 className="font-display text-xl text-burgundy-900 font-bold border-b border-neutral-100 pb-3 mb-4">
          <span className="text-[#C08E3F] mr-1">4.</span> Setup Type & Verification Files
        </h4>

        <div className="space-y-1">
          <span className="block text-xs text-burgundy-700 font-semibold">Business Setup Type *</span>
          <div className="grid grid-cols-3 gap-2.5 mt-1">
            {[
              { id: 'ssm', label: 'SSM Registered Company', desc: 'Enterprise / Sdn Bhd' },
              { id: 'startup', label: 'Startup Team / Agency', desc: 'No SSM, multi-person' },
              { id: 'homemade', label: 'Homemade / Freelancer', desc: 'Solo operator / Home based' },
            ].map((t) => (
              <button
                key={t.id} type="button" onClick={() => setReqType(t.id)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-20 cursor-pointer ${
                  reqType === t.id
                    ? 'border-burgundy-855 bg-burgundy-900/5 ring-1 ring-burgundy-800'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50'
                }`}
              >
                <span className="text-xs font-bold text-burgundy-950 block">{t.label}</span>
                <span className="text-[9px] text-neutral-500 block leading-tight">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {reqType === 'ssm' ? (
          <div className="space-y-4">
            <label className="block">
              <span className="block text-xs text-burgundy-700 mb-1 font-semibold">SSM Registration Number *</span>
              <input
                type="text" value={ssmNumber} onChange={(e) => setSsmNumber(e.target.value)}
                placeholder="e.g. 20260312XXXX"
                className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-burgundy-955 text-sm shadow-sm"
              />
            </label>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-300 hover:border-burgundy-800 rounded-xl cursor-pointer transition bg-white/50 hover:bg-white text-neutral-500 hover:text-burgundy-955">
              <FileUp className="w-5 h-5 mb-1" />
              <span className="text-[11px] font-bold text-center">{ssmDocName || 'Upload SSM Certificate (PDF / Image) *'}</span>
              <input type="file" accept=".pdf,image/*" onChange={(e) => setSsmDoc(e.target.files[0])} className="hidden" />
            </label>
          </div>
        ) : (
          <label className="block">
            <span className="block text-xs text-burgundy-700 mb-1 font-semibold">Active Social Media / Portfolio URL *</span>
            <input
              type="url" value={socialLink} onChange={(e) => setSocialLink(e.target.value)}
              placeholder="e.g. https://instagram.com/myweddingbrand"
              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-burgundy-955 text-sm shadow-sm"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">To showcase that you're a real startup / entrepreneur, please provide an active link (Instagram, website, or Facebook) showcasing your past wedding bookings.</span>
          </label>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="block text-xs text-burgundy-700 font-semibold">NRIC / Owner Passport Copy *</span>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-300 hover:border-burgundy-800 rounded-xl cursor-pointer transition bg-white/50 hover:bg-white text-neutral-500 hover:text-burgundy-955 h-[120px]">
              <FileUp className="w-5 h-5 mb-1" />
              <span className="text-[11px] font-bold text-center leading-snug">{nricDocName || 'Upload NRIC Copy (PDF / Image) *'}</span>
              <input type="file" accept=".pdf,image/*" onChange={(e) => setNricDoc(e.target.files[0])} className="hidden" />
            </label>
          </div>

          {isPaid && (
            <div className="space-y-2">
              <span className="block text-xs text-burgundy-700 font-semibold">Subscription Payment Proof *</span>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-300 hover:border-burgundy-800 rounded-xl cursor-pointer transition bg-white/50 hover:bg-white text-neutral-500 hover:text-burgundy-955 h-[120px]">
                <FileUp className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-bold text-center leading-snug">{paymentProofName || 'Upload Transfer Receipt *'}</span>
                <input type="file" accept=".pdf,image/*" onChange={(e) => setPaymentProof(e.target.files[0])} className="hidden" />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Documents Submission Checklist Status */}
      <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2.5 text-xs">
        <p className="font-bold text-burgundy-950">Documents Submission Checklist Status:</p>
        <div className="grid sm:grid-cols-2 gap-2 mt-1">
          {reqType === 'ssm' ? (
            <>
              <div className="flex items-center gap-2">
                {ssmNumber.trim() ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-neutral-300" />}
                <span className="text-neutral-600 font-medium">SSM Number</span>
              </div>
              <div className="flex items-center gap-2">
                {ssmDocName ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-neutral-300" />}
                <span className="text-neutral-600 font-medium">SSM Certificate File</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {socialLink.trim() ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-neutral-300" />}
              <span className="text-neutral-600 font-medium">Social Media / Portfolio URL</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {nricDocName ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-neutral-300" />}
            <span className="text-neutral-600 font-medium">NRIC / Owner Passport Copy</span>
          </div>
          {isPaid && (
            <div className="flex items-center gap-2">
              {paymentProofName ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-neutral-300" />}
              <span className="text-neutral-600 font-medium">Payment Receipt File</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-3">
        <button
          onClick={onSubmit}
          disabled={isPending}
          className="flex items-center justify-center font-bold cursor-pointer text-sm py-3 px-12 rounded-full bg-burgundy-900 text-white hover:bg-burgundy-955 transition-colors shadow-sm active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? 'Submitting...' : 'Submit'}
        </button>
      </div>
      </div>
    </div>
  )
}

function StatusLabel({ status, claimed }) {
  if (status === 'approved') {
    if (claimed) {
      // No pill once claimed — the success card already communicates this.
      return null
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold border bg-gold-400/20 text-burgundy-955 border-gold-400/40 animate-pulse">
          Pending Claim
        </span>
      )
    }
  }

  const map = {
    pending: { label: 'Pending Review', color: 'bg-gold-500/10 text-gold-700 border-gold-500/20' },
    under_review: { label: 'Under Review', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    rejected: { label: 'Verification Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
  }
  const item = map[status] ?? map.pending
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.color}`}>
      {item.label}
    </span>
  )
}

function Loader() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#FAF8F5]">
      <div className="w-10 h-10 rounded-full border-2 border-burgundy-300 border-t-burgundy-800 animate-spin" />
    </div>
  )
}

function ConfettiOverlay() {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div className="absolute inset-0 bg-gold-500/15 animate-pulse" />
      <div className="bg-white/95 backdrop-blur-md border border-gold-200 p-8 rounded-3xl text-center shadow-2xl max-w-sm mx-auto space-y-3 transform scale-up pointer-events-auto">
        <Sparkles className="w-12 h-12 text-gold-500 mx-auto animate-spin" />
        <h4 className="font-display text-2xl font-bold text-burgundy-950">Badge Active!</h4>
        <p className="text-xs text-neutral-600 leading-relaxed">Confetti! Your setup badge has been claimed and your listing is now officially live on the directory.</p>
      </div>
    </div>
  )
}
