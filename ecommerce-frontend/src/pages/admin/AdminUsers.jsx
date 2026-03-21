import { useState, useEffect } from 'react'
import { adminGetUsers, adminUpdateUser } from '../../api/users'
import Spinner from '../../components/ui/Spinner'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminGetUsers()
      .then(r => setUsers(r.data.results || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleRoleChange = async (userId, isStaff) => {
    setUpdatingId(userId)
    try {
      await adminUpdateUser(userId, { is_staff: isStaff, is_superuser: isStaff })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_staff: isStaff, is_superuser: isStaff, role: isStaff ? 'admin' : 'user' } : u))
    } catch { }
    finally { setUpdatingId(null) }
  }

  const filtered = search
    ? users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()))
    : users

  if (loading) return <Spinner fullPage />

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Kullanıcılar</h1>
        <p className="page-subtitle">{users.length} kullanıcı</p>
      </div>

      <div className="card">
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <input className="form-input" placeholder="E-posta ile ara..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>Rol</th>
                <th>Üyelik</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="text-muted text-sm">{u.id}</td>
                  <td className="font-semibold">{u.email}</td>
                  <td className="text-secondary">{u.phone || '-'}</td>
                  <td><span className={`badge ${u.role === 'admin' || u.is_staff ? 'badge-blue' : 'badge-green'}`}>{u.role === 'admin' || u.is_staff ? 'Admin' : 'Kullanıcı'}</span></td>
                  <td className="text-secondary text-sm">{u.date_joined ? new Date(u.date_joined).toLocaleDateString('tr-TR') : '-'}</td>
                  <td>
                    <select
                      className="form-select"
                      style={{ fontSize: 13, padding: '4px 8px', width: 140 }}
                      value={u.is_staff || u.role === 'admin' ? 'admin' : 'user'}
                      onChange={e => handleRoleChange(u.id, e.target.value === 'admin')}
                      disabled={updatingId === u.id}
                    >
                      <option value="user">Kullanıcı</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty-state"><p className="empty-title">Kullanıcı bulunamadı</p></div>
        )}
      </div>
    </div>
  )
}
