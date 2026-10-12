import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { refresh } = useAuth()
  const [status, setStatus] = useState('processing')
  const sessionId = searchParams.get('session_id')

  const verifyPayment = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post('/vendor-portal/checkout-success', { session_id: id })
      return data
    },
    onSuccess: async (data) => {
      setStatus('success')
      
      // Refresh Auth user context immediately
      await refresh()
      
      // Invalidate all query caches to ensure dashboards and listings load fresh database attributes
      qc.invalidateQueries()
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7B1F2A', '#C08E3F', '#4E1218']
      })
      
      toast.success(data.message)
      
      setTimeout(() => {
        navigate('/vendor-portal')
      }, 3000)
    },
    onError: (err) => {
      setStatus('error')
      toast.error(err.response?.data?.message || 'Payment verification failed')
      setTimeout(() => {
        navigate('/vendor-portal')
      }, 3000)
    }
  })

  useEffect(() => {
    if (sessionId) {
      verifyPayment.mutate(sessionId)
    } else {
      setStatus('error')
      toast.error('Invalid payment session')
      navigate('/vendor-portal')
    }
  }, [sessionId])

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full border border-neutral-100">
        {status === 'processing' && (
          <>
            <div className="w-12 h-12 rounded-full border-4 border-burgundy-100 border-t-burgundy-800 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-burgundy-950 mb-2">Verifying Payment...</h2>
            <p className="text-sm text-neutral-500">Please wait while we confirm your subscription upgrade.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-display font-bold text-burgundy-950 mb-2">Payment Successful!</h2>
            <p className="text-sm text-neutral-500">Your subscription has been upgraded. Redirecting...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-display font-bold text-burgundy-950 mb-2">Verification Failed</h2>
            <p className="text-sm text-neutral-500">Redirecting back to dashboard...</p>
          </>
        )}
      </div>
    </div>
  )
}
