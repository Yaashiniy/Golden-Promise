import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { DashboardSidebar } from '../../components/DashboardSidebar.jsx'
import DeleteAccountModal from '../../components/DeleteAccountModal.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import * as profileApi from '../../api/profile.js'

export default function Settings() {
  const { user, refresh, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen] = useState(() => localStorage.getItem('sidebar_left_open') !== 'false')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const [form, setForm] = useState({ name: '', email: '' })

  useEffect(() => {
    if (user) setForm({ name: user.name ?? '', email: user.email ?? '' })
  }, [user])

  const save = useMutation({
    mutationFn: (payload) => profileApi.updateProfile(payload),
    onSuccess: async () => {
      await refresh()
      toast.success('Account details saved')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Save failed'),
  })

  const remove = useMutation({
    mutationFn: (password) => deleteAccount(password),
    onSuccess: () => {
      toast.success('Account deleted')
      navigate('/')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to delete account'),
  })

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#2C2A29]">
      <DashboardSidebar />

      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-[270px]' : 'lg:pl-0'} px-5 lg:px-10 pt-28 pb-16 max-w-3xl mx-auto w-full`}>
        <h1 className="font-display text-4xl text-burgundy-900 font-medium">Account Settings</h1>
        <p className="text-neutral-600 mt-2">Manage the details of the account you registered with Golden Promise.</p>

        <form
          onSubmit={(e) => { e.preventDefault(); save.mutate(form) }}
          className="mt-8 bg-white rounded-2xl border border-burgundy-900/10 shadow-sm p-6 space-y-5"
        >
          <h2 className="font-display text-xl text-burgundy-900">Account Information</h2>

          <div>
            <label className="text-xs font-semibold text-neutral-700">Full name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm outline-none focus:border-burgundy-700"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700">Email address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm outline-none focus:border-burgundy-700"
            />
          </div>

          <button
            type="submit"
            disabled={save.isPending}
            className="px-5 py-2.5 rounded-full bg-burgundy-800 hover:bg-burgundy-900 disabled:opacity-60 text-white text-sm font-bold transition"
          >
            {save.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <div className="mt-8 bg-white rounded-2xl border border-red-200 shadow-sm p-6">
          <h2 className="font-display text-xl text-red-700">Danger Zone</h2>
          <p className="mt-1.5 text-sm text-neutral-600">
            Deleting your account permanently removes your wedding plan, budget, checklist and favourites. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="mt-4 px-5 py-2.5 rounded-full border border-red-300 text-red-700 hover:bg-red-50 text-sm font-bold transition"
          >
            Delete my account
          </button>
        </div>
      </main>

      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={(password) => remove.mutate(password)}
        isPending={remove.isPending}
        warning="This will permanently delete your account, wedding plan, budget, checklist and favourites. This action cannot be undone."
      />
    </div>
  )
}
