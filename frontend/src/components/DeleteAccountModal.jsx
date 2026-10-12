import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function DeleteAccountModal({ open, onClose, onConfirm, isPending, warning }) {
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')

  if (!open) return null

  const canSubmit = password.length > 0 && confirmText.trim().toUpperCase() === 'DELETE'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit || isPending) return
    onConfirm(password)
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="mt-3 font-display text-xl text-burgundy-900">Delete your account?</h2>
          <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">
            {warning ?? 'This will permanently delete your account and all associated data. This action cannot be undone.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700">Confirm your password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm outline-none focus:border-burgundy-700"
                placeholder="Password"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">
                Type <span className="font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm outline-none focus:border-burgundy-700"
                placeholder="DELETE"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit || isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
              >
                {isPending ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
