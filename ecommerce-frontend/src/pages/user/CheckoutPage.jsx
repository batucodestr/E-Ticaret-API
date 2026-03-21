import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart } from '../../api/cart'
import { getAddresses, createAddress, getCities } from '../../api/addresses'
import { createOrder } from '../../api/orders'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import { getApiError } from '../../api/errorHelper'
import './CheckoutPage.css'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  const [deliveryAddr, setDeliveryAddr] = useState('')
  const [billingAddr, setBillingAddr] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [showAddrModal, setShowAddrModal] = useState(false)
  const [newAddr, setNewAddr] = useState({
    fullname: '', phone: '', address_line: '', district: '',
    street: '', postal_code: '', city: '', address_type: 'home', is_default: false,
  })
  const [addrError, setAddrError] = useState('')
  const [savingAddr, setSavingAddr] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const [cartRes, addrRes, cityRes] = await Promise.all([
          getCart(), getAddresses(), getCities(),
        ])
        setCart(cartRes.data)
        const addrs = addrRes.data.results || addrRes.data || []
        setAddresses(addrs)
        setCities(cityRes.data.results || cityRes.data || [])
        const def = addrs.find(a => a.is_default) || addrs[0]
        if (def) { setDeliveryAddr(def.id); setBillingAddr(def.id) }
      } catch { }
      finally { setLoading(false) }
    }
    init()
  }, [])

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setAddrError('')
    if (!newAddr.city) { setAddrError('Lütfen şehir seçin.'); return }
    setSavingAddr(true)
    try {
      const res = await createAddress(newAddr)
      const saved = res.data
      setAddresses(prev => [...prev, saved])
      setDeliveryAddr(saved.id)
      setBillingAddr(saved.id)
      setShowAddrModal(false)
      setNewAddr({ fullname: '', phone: '', address_line: '', district: '', street: '', postal_code: '', city: '', address_type: 'home', is_default: false })
    } catch (err) {
      setAddrError(getApiError(err, 'Adres eklenemedi.'))
    } finally {
      setSavingAddr(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!deliveryAddr) { setError('Lütfen teslimat adresi seçin.'); return }
    if (!billingAddr) { setError('Lütfen fatura adresi seçin.'); return }
    setError('')
    setPlacing(true)
    try {
      const payload = {
        delivery_address: deliveryAddr,
        billing_address: billingAddr,
      }
      if (couponCode) payload.coupon_code = couponCode
      const res = await createOrder(payload)
      navigate(`/orders/${res.data.id || res.data.order?.id}`)
    } catch (err) {
      setError(getApiError(err, 'Sipariş oluşturulamadı.'))
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return <Spinner fullPage />

  const items = cart?.items || []
  const total = items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0)

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Siparişi Tamamla</h1>
        </div>

        <div className="checkout-layout">
          <div className="checkout-left">
            {/* Delivery Address */}
            <div className="card checkout-section">
              <div className="checkout-section-header">
                <h3>Teslimat Adresi</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAddrModal(true)}>+ Yeni Adres</button>
              </div>
              {addresses.length === 0 ? (
                <div className="alert alert-warning">
                  Kayıtlı adresiniz yok. Lütfen yeni bir adres ekleyin.
                </div>
              ) : (
                <div className="addr-list">
                  {addresses.map((a) => (
                    <label key={a.id} className={`addr-option ${deliveryAddr === a.id ? 'selected' : ''}`}>
                      <input type="radio" name="delivery" value={a.id} checked={deliveryAddr === a.id} onChange={() => setDeliveryAddr(a.id)} />
                      <div className="addr-info">
                        <div className="addr-name">{a.fullname} <span className="badge badge-gray">{a.address_type}</span></div>
                        <div className="addr-detail">{a.address_line}, {a.district}, {a.city?.name}</div>
                        <div className="addr-detail">{a.phone}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Billing Address */}
            <div className="card checkout-section">
              <h3 className="checkout-section-title">Fatura Adresi</h3>
              {addresses.length > 0 && (
                <div className="addr-list">
                  {addresses.map((a) => (
                    <label key={a.id} className={`addr-option ${billingAddr === a.id ? 'selected' : ''}`}>
                      <input type="radio" name="billing" value={a.id} checked={billingAddr === a.id} onChange={() => setBillingAddr(a.id)} />
                      <div className="addr-info">
                        <div className="addr-name">{a.fullname}</div>
                        <div className="addr-detail">{a.address_line}, {a.city?.name}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="card checkout-section">
              <h3 className="checkout-section-title">Kupon Kodu</h3>
              <div className="coupon-row">
                <input
                  className="form-input"
                  placeholder="Kupon kodunuz varsa girin"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="cart-summary card">
            <h3 className="summary-title">Sipariş Özeti</h3>
            <div className="checkout-items">
              {items.map((item) => (
                <div key={item.id} className="checkout-item">
                  <span className="checkout-item-name">{item.product.name} × {item.quantity}</span>
                  <span>{(Number(item.product.price) * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                </div>
              ))}
            </div>
            <div className="summary-divider" />
            <div className="summary-row">
              <span>Ara Toplam</span>
              <span>{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="summary-row">
              <span>Kargo</span>
              <span className="text-success">Ücretsiz</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Toplam</span>
              <span>{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
            {error && <div className="alert alert-error mb-3">{error}</div>}
            <button className="btn btn-primary btn-lg w-full" onClick={handlePlaceOrder} disabled={placing || addresses.length === 0}>
              {placing ? <Spinner size="sm" /> : '✓ Siparişi Ver'}
            </button>
          </div>
        </div>

        {/* New Address Modal */}
        <Modal open={showAddrModal} onClose={() => setShowAddrModal(false)} title="Yeni Adres Ekle" size="md">
          <form onSubmit={handleAddAddress}>
            <div className="form-group">
              <label className="form-label">Ad Soyad *</label>
              <input className="form-input" required value={newAddr.fullname} onChange={e => setNewAddr(p => ({ ...p, fullname: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Telefon *</label>
              <input className="form-input" required value={newAddr.phone} onChange={e => setNewAddr(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Adres Satırı *</label>
              <input className="form-input" required value={newAddr.address_line} onChange={e => setNewAddr(p => ({ ...p, address_line: e.target.value }))} />
            </div>
            <div className="addr-form-row">
              <div className="form-group">
                <label className="form-label">İlçe</label>
                <input className="form-input" value={newAddr.district} onChange={e => setNewAddr(p => ({ ...p, district: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Sokak</label>
                <input className="form-input" value={newAddr.street} onChange={e => setNewAddr(p => ({ ...p, street: e.target.value }))} />
              </div>
            </div>
            <div className="addr-form-row">
              <div className="form-group">
                <label className="form-label">Posta Kodu</label>
                <input className="form-input" value={newAddr.postal_code} onChange={e => setNewAddr(p => ({ ...p, postal_code: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Şehir *</label>
                <select className="form-select" required value={newAddr.city} onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))}>
                  <option value="">Seçin</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Adres Tipi</label>
              <select className="form-select" value={newAddr.address_type} onChange={e => setNewAddr(p => ({ ...p, address_type: e.target.value }))}>
                <option value="home">Ev</option>
                <option value="work">İş</option>
                <option value="billing">Fatura</option>
                <option value="shipping">Teslimat</option>
              </select>
            </div>
            {addrError && <div className="alert alert-error mb-3">{addrError}</div>}
            <button type="submit" className="btn btn-primary w-full" disabled={savingAddr}>
              {savingAddr ? <Spinner size="sm" /> : 'Adresi Kaydet'}
            </button>
          </form>
        </Modal>
      </div>
    </div>
  )
}
