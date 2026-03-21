import { useAuth } from '../../context/AuthContext'
import { IconUser, IconLogOut } from '../../components/ui/Icons'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, logout } = useAuth()

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="page-header">
          <h1 className="page-title">Profilim</h1>
        </div>

        <div className="card profile-card">
          <div className="profile-avatar">
            <IconUser width={36} height={36} />
          </div>
          <div className="profile-info">
            <div className="profile-field">
              <span className="profile-label">E-posta</span>
              <span className="profile-value">{user?.email}</span>
            </div>
            {user?.phone && (
              <div className="profile-field">
                <span className="profile-label">Telefon</span>
                <span className="profile-value">{user.phone}</span>
              </div>
            )}
            <div className="profile-field">
              <span className="profile-label">Hesap Tipi</span>
              <span className={`badge ${user?.role === 'admin' ? 'badge-blue' : 'badge-green'}`}>
                {user?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
              </span>
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn btn-danger" onClick={logout}>
              <IconLogOut width={15} height={15} /> Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
