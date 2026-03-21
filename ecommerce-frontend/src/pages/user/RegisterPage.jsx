import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/ui/Spinner'
import './AuthPage.css'

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    if (form.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.')
      return
    }
    const res = await register({ email: form.email, phone: form.phone, password: form.password })
    if (res.success) {
      navigate('/')
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-logo">S</div>
          <h1 className="auth-title">Kayıt Ol</h1>
          <p className="auth-subtitle">Ücretsiz hesap oluşturun</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">E-posta *</label>
            <input
              type="email"
              className="form-input"
              placeholder="ornek@mail.com"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Telefon</label>
            <input
              type="tel"
              className="form-input"
              placeholder="05xx xxx xx xx"
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre *</label>
            <input
              type="password"
              className="form-input"
              placeholder="En az 8 karakter"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre Tekrar *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Şifrenizi tekrar girin"
              value={form.confirm}
              onChange={(e) => setForm(f => ({ ...f, confirm: e.target.value }))}
              required
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Kayıt Ol'}
          </button>
        </form>

        <div className="auth-footer">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="text-primary font-semibold">Giriş Yap</Link>
        </div>
      </div>
    </div>
  )
}
