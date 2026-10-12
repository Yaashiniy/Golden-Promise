import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Reveal } from '../../components/Reveal.jsx'

const users = [
  { name: 'Yaashniny K.', email: 'yash@example.com', role: 'couple', joined: '2025-09-12' },
  { name: 'Leonard Hon', email: 'leonard@example.com', role: 'vendor', joined: '2024-11-03' },
  { name: 'Tang Chao', email: 'tang@example.com', role: 'vendor', joined: '2025-01-21' },
  { name: 'Admin', email: 'admin@example.com', role: 'admin', joined: '2024-10-01' },
]

export default function AdminUsers() {
  return (
    <div className="bg-blush-100 min-h-[calc(100vh-5rem)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <Link to="/admin" className="inline-flex items-center gap-1 text-burgundy-700 hover:text-burgundy-900 text-sm mb-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <Reveal>
          <h1 className="font-display text-4xl text-burgundy-900">Users</h1>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-6 card-surface !bg-blush-50 overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead className="border-b border-burgundy-200/60 text-burgundy-800">
                <tr><th className="px-5 py-4 font-medium">Name</th><th className="px-5 py-4 font-medium">Email</th><th className="px-5 py-4 font-medium">Role</th><th className="px-5 py-4 font-medium">Joined</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.email} className="border-b border-burgundy-200/40 hover:bg-blush-100/60">
                    <td className="px-5 py-4 text-burgundy-900">{u.name}</td>
                    <td className="px-5 py-4 text-burgundy-700">{u.email}</td>
                    <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-full bg-burgundy-800/10 text-burgundy-800 text-xs capitalize">{u.role}</span></td>
                    <td className="px-5 py-4 text-burgundy-700">{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
