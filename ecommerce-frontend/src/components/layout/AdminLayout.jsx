import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  IconDashboard, IconBox, IconTag, IconShoppingBag, IconUsers,
  IconMessageSquare, IconTicket, IconHome, IconLogOut, IconChevronRight
} from '../ui/Icons'
import './AdminLayout.css'

const navItems = [
  { to: '/admin', label: 'Gösterge Paneli', icon: IconDashboard, exact: true },
  { to: '/admin/products', label: 'Ürünler', icon: IconBox },
  { to: '/admin/categories', label: 'Kategoriler', icon: IconTag },
  { to: '/admin/orders', label: 'Siparişler', icon: IconShoppingBag },
  { to: '/admin/users', label: 'Kullanıcılar', icon: IconUsers },
  { to: '/admin/comments', label: 'Yorumlar', icon: IconMessageSquare },
  { to: '/admin/coupons', label: 'Kuponlar', icon: IconTicket },
]

export default function AdminLayout({ children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <Link to="/admin" className="sidebar-brand">
            <span className="sidebar-logo">S</span>
            {!collapsed && <span>ShopAdmin</span>}
          </Link>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Genişlet' : 'Daralt'}>
            <IconChevronRight width={14} height={14} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-link ${isActive(item) ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon width={17} height={17} className="sidebar-icon" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link" title={collapsed ? 'Siteye Dön' : undefined}>
            <IconHome width={17} height={17} className="sidebar-icon" />
            {!collapsed && <span>Siteye Dön</span>}
          </Link>
          <button className="sidebar-link sidebar-logout" onClick={handleLogout} title={collapsed ? 'Çıkış' : undefined}>
            <IconLogOut width={17} height={17} className="sidebar-icon" />
            {!collapsed && <span>Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}
