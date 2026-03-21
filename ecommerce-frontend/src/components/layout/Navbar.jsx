import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getCategories } from '../../api/categories'
import {
  IconShoppingCart, IconUser, IconChevronDown, IconMenu, IconX,
  IconHome, IconBox, IconTag, IconShoppingBag, IconMapPin, IconSettings, IconLogOut
} from '../ui/Icons'
import './Navbar.css'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const [catDropdown, setCatDropdown] = useState(false)
  const [categories, setCategories] = useState([])
  const userRef = useRef(null)
  const catRef = useRef(null)

  useEffect(() => {
    getCategories()
      .then(r => setCategories(r.data.results || r.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropdown(false)
      if (catRef.current && !catRef.current.contains(e.target)) setCatDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserDropdown(false)
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <>
      <div className="announce-bar">
        <div className="announce-track">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="announce-item">
              <span className="announce-dot" />
              Ücretsiz Kargo — 500 TL ve Üzeri Siparişlerde
            </span>
          ))}
        </div>
      </div>
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">ShopApp</Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            <IconHome width={15} height={15} />
            Ana Sayfa
          </Link>

          <Link to="/products" className={`nav-link ${isActive('/products')}`}>
            <IconBox width={15} height={15} />
            Ürünler
          </Link>

          {/* Categories Dropdown */}
          {categories.length > 0 && (
            <div className="nav-dropdown" ref={catRef}>
              <button className="nav-link nav-dropdown-trigger" onClick={() => setCatDropdown(!catDropdown)}>
                <IconTag width={15} height={15} />
                Kategoriler
                <IconChevronDown width={12} height={12} style={{ marginLeft: 2 }} />
              </button>
              {catDropdown && (
                <div className="nav-dropdown-menu nav-cat-menu">
                  <Link to="/products" className="dropdown-item dropdown-item-all" onClick={() => setCatDropdown(false)}>
                    Tüm Ürünler
                  </Link>
                  <div className="dropdown-divider" />
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      className="dropdown-item"
                      onClick={() => setCatDropdown(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {isAuthenticated && (
            <Link to="/cart" className={`nav-link ${isActive('/cart')}`}>
              <IconShoppingCart width={15} height={15} />
              Sepet
            </Link>
          )}

          {isAuthenticated ? (
            <div className="nav-dropdown" ref={userRef}>
              <button className="nav-user-btn" onClick={() => setUserDropdown(!userDropdown)}>
                <span className="nav-avatar">{user?.email?.[0]?.toUpperCase()}</span>
                <span className="nav-username">{user?.email?.split('@')[0]}</span>
                <IconChevronDown width={12} height={12} />
              </button>
              {userDropdown && (
                <div className="nav-dropdown-menu">
                  <Link to="/orders" className="dropdown-item" onClick={() => setUserDropdown(false)}>
                    <IconShoppingBag width={15} height={15} />
                    Siparişlerim
                  </Link>
                  <Link to="/addresses" className="dropdown-item" onClick={() => setUserDropdown(false)}>
                    <IconMapPin width={15} height={15} />
                    Adreslerim
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setUserDropdown(false)}>
                    <IconUser width={15} height={15} />
                    Profilim
                  </Link>
                  {isAdmin && (
                    <>
                      <div className="dropdown-divider" />
                      <Link to="/admin" className="dropdown-item dropdown-item-admin" onClick={() => setUserDropdown(false)}>
                        <IconSettings width={15} height={15} />
                        Yönetim Paneli
                      </Link>
                    </>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                    <IconLogOut width={15} height={15} />
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Giriş Yap</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Kayıt Ol</Link>
            </div>
          )}
        </div>

        <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="menu">
          {menuOpen ? <IconX width={20} height={20} /> : <IconMenu width={20} height={20} />}
        </button>
      </div>
    </nav>
    </>
  )
}
