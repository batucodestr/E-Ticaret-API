import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart } from '../../api/cart'
import { getAddresses, createAddress, getCities } from '../../api/addresses'
import { createOrder } from '../../api/orders'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import { getApiError } from '../../api/errorHelper'
import './CheckoutPage.css'

const STEPS = ['Sepet', 'Adres', 'Ödeme']

const IYZICO_TEST_CARD = {
  cardHolderName: 'Test Kullanıcı',
  cardNumber: '5890040000000016',
  expireMonth: '12',
  expireYear: '2030',
  cvc: '123',
}

function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function StepIndicator({ current }) {
  return (
    <div className="checkout-steps">
      {STEPS.map((label, i) => {
        const status = i < current ? 'done' : i === current ? 'active' : 'pending'
        return (
          <div key={label} className={`step-item step-${status}`}>
            <div className="step-circle">{i < current ? '✓' : i + 1}</div>
            <span className="step-label">{label}</span>
            {i < STEPS.length - 1 && <div className="step-line" />}
          </div>
        )
      })}
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 0=cart(skip), 1=address, 2=payment
  const [cart, setCart] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  const [deliveryAddr, setDeliveryAddr] = useState('')
  const [billingAddr, setBillingAddr] = useState('')
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [couponCode, setCouponCode] = useState('')

  const [cardData, setCardData] = useState(IYZICO_TEST_CARD)
  const [cardFlipped, setCardFlipped] = useState(false)

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
    const effectiveBilling = sameAsBilling ? deliveryAddr : billingAddr
    if (!deliveryAddr) { setError('Lütfen teslimat adresi seçin.'); return }
    if (!effectiveBilling) { setError('Lütfen fatura adresi seçin.'); return }
    if (!cardData.cardHolderName || !cardData.cardNumber || !cardData.expireMonth || !cardData.expireYear || !cardData.cvc) {
      setError('Lütfen tüm kart bilgilerini doldurun.')
      return
    }
    setError('')
    setPlacing(true)
    try {
      const cleanCard = { ...cardData, cardNumber: cardData.cardNumber.replace(/\s/g, '') }
      const payload = {
        delivery_address_id: deliveryAddr,
        billing_address_id: effectiveBilling,
        card_data: cleanCard,
      }
      if (couponCode.trim()) payload.coupon_code = couponCode.trim()
      const res = await createOrder(payload)
      const orderId = res.data.order_id || res.data.id
      navigate(`/orders/${orderId}`)
    } catch (err) {
      setError(getApiError(err, 'Sipariş oluşturulamadı.'))
    } finally {
      setPlacing(false)
    }
  }

  const handleCardChange = (field, value) => {
    if (field === 'cardNumber') value = formatCardNumber(value)
    if (field === 'expireMonth') value = value.replace(/\D/g, '').slice(0, 2)
    if (field === 'expireYear') value = value.replace(/\D/g, '').slice(0, 4)
    if (field === 'cvc') value = value.replace(/\D/g, '').slice(0, 4)
    setCardData(prev => ({ ...prev, [field]: value }))
  }

  const goNext = () => {
    if (step === 1) {
      if (!deliveryAddr) { setError('Lütfen teslimat adresi seçin.'); return }
      setError('')
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (loading) return <Spinner fullPage />

  const items = cart?.items || []
  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0)

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const effectiveBilling = sameAsBilling ? deliveryAddr : billingAddr
  const selectedDelivery = addresses.find(a => a.id === deliveryAddr)

  return (
    <div className="page-wrapper checkout-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="checkout-breadcrumb">
          <Link to="/cart" className="breadcrumb-link">Sepet</Link>
          <span className="breadcrumb-sep">/</span>
          <span className={step === 1 ? 'breadcrumb-active' : 'breadcrumb-link'} onClick={() => step > 1 && setStep(1)}>
            Adres
          </span>
          <span className="breadcrumb-sep">/</span>
          <span className={step === 2 ? 'breadcrumb-active' : 'breadcrumb-muted'}>Ödeme</span>
        </div>

        <StepIndicator current={step} />

        <div className="checkout-layout">
          {/* LEFT PANEL */}
          <div className="checkout-left">

            {/* ─── STEP 1: ADDRESS ─── */}
            {step === 1 && (
              <>
                <div className="checkout-section">
                  <div className="checkout-section-header">
                    <h3 className="checkout-section-title">Teslimat Adresi</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowAddrModal(true)}>
                      + Yeni Adres Ekle
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="empty-addr-state">
                      <p>Kayıtlı adresiniz bulunmuyor.</p>
                      <button className="btn btn-primary" onClick={() => setShowAddrModal(true)}>
                        Adres Ekle
                      </button>
                    </div>
                  ) : (
                    <div className="addr-list">
                      {addresses.map((a) => (
                        <label key={a.id} className={`addr-option ${deliveryAddr === a.id ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="delivery"
                            value={a.id}
                            checked={deliveryAddr === a.id}
                            onChange={() => {
                              setDeliveryAddr(a.id)
                              if (sameAsBilling) setBillingAddr(a.id)
                            }}
                          />
                          <div className="addr-info">
                            <div className="addr-name">
                              {a.fullname}
                              <span className="badge badge-gray">{a.address_type === 'home' ? 'Ev' : a.address_type === 'work' ? 'İş' : a.address_type}</span>
                            </div>
                            <div className="addr-detail">{a.address_line}</div>
                            <div className="addr-detail">{a.district ? `${a.district}, ` : ''}{a.city?.name}</div>
                            <div className="addr-detail">{a.phone}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Same as billing toggle */}
                <div className="checkout-section">
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) => {
                        setSameAsBilling(e.target.checked)
                        if (e.target.checked) setBillingAddr(deliveryAddr)
                      }}
                    />
                    <span className="checkbox-label">Fatura adresi teslimat adresiyle aynı</span>
                  </label>

                  {!sameAsBilling && (
                    <div className="addr-list" style={{ marginTop: 20 }}>
                      <p className="checkout-section-title" style={{ marginBottom: 12 }}>Fatura Adresi</p>
                      {addresses.map((a) => (
                        <label key={a.id} className={`addr-option ${billingAddr === a.id ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="billing"
                            value={a.id}
                            checked={billingAddr === a.id}
                            onChange={() => setBillingAddr(a.id)}
                          />
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
                <div className="checkout-section">
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

                {error && <div className="alert alert-error">{error}</div>}

                <button
                  className="btn btn-primary btn-lg"
                  onClick={goNext}
                  disabled={addresses.length === 0}
                >
                  Ödemeye Geç
                </button>
              </>
            )}

            {/* ─── STEP 2: PAYMENT ─── */}
            {step === 2 && (
              <>
                {/* Delivery address summary */}
                {selectedDelivery && (
                  <div className="checkout-section addr-summary">
                    <div className="addr-summary-row">
                      <div>
                        <span className="addr-summary-label">Teslimat Adresi</span>
                        <div className="addr-summary-text">
                          {selectedDelivery.fullname} — {selectedDelivery.address_line}, {selectedDelivery.city?.name}
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>Değiştir</button>
                    </div>
                  </div>
                )}

                {/* Card visual + form */}
                <div className="checkout-section">
                  <h3 className="checkout-section-title">Kart Bilgileri</h3>

                  {/* Visual card */}
                  <div
                    className={`card-visual ${cardFlipped ? 'flipped' : ''}`}
                    onClick={() => setCardFlipped(f => !f)}
                  >
                    <div className="card-visual-inner">
                      {/* Front */}
                      <div className="card-face card-front">
                        <div className="card-chip" />
                        <div className="card-number-display">
                          {(cardData.cardNumber || '•••• •••• •••• ••••')
                            .padEnd(19, '•')
                            .slice(0, 19)
                            .replace(/(.{4})/g, '$1 ').trim()}
                        </div>
                        <div className="card-bottom-row">
                          <div>
                            <div className="card-field-label">Kart Sahibi</div>
                            <div className="card-field-value">{cardData.cardHolderName || 'AD SOYAD'}</div>
                          </div>
                          <div>
                            <div className="card-field-label">Son Kullanma</div>
                            <div className="card-field-value">
                              {cardData.expireMonth || 'AA'}/{(cardData.expireYear || 'YY').slice(-2)}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Back */}
                      <div className="card-face card-back">
                        <div className="card-stripe" />
                        <div className="card-cvc-row">
                          <div className="card-field-label">CVV</div>
                          <div className="card-cvc-box">{cardData.cvc ? '•'.repeat(cardData.cvc.length) : '•••'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="card-visual-hint">Kartın üzerine tıklayarak arka yüzü görebilirsiniz.</p>

                  {/* Card form */}
                  <div className="card-form">
                    <div className="form-group">
                      <label className="form-label">Kart Numarası</label>
                      <input
                        className="form-input"
                        placeholder="•••• •••• •••• ••••"
                        value={cardData.cardNumber}
                        onChange={e => handleCardChange('cardNumber', e.target.value)}
                        maxLength={19}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Kart Üzerindeki İsim</label>
                      <input
                        className="form-input"
                        placeholder="Ad Soyad"
                        value={cardData.cardHolderName}
                        onChange={e => handleCardChange('cardHolderName', e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="card-form-row">
                      <div className="form-group">
                        <label className="form-label">Son Kullanma Ay</label>
                        <input
                          className="form-input"
                          placeholder="AA"
                          value={cardData.expireMonth}
                          onChange={e => handleCardChange('expireMonth', e.target.value)}
                          maxLength={2}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Son Kullanma Yıl</label>
                        <input
                          className="form-input"
                          placeholder="YYYY"
                          value={cardData.expireYear}
                          onChange={e => handleCardChange('expireYear', e.target.value)}
                          maxLength={4}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input
                          className="form-input"
                          placeholder="•••"
                          value={cardData.cvc}
                          onFocus={() => setCardFlipped(true)}
                          onBlur={() => setCardFlipped(false)}
                          onChange={e => handleCardChange('cvc', e.target.value)}
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <button
                  className="btn btn-primary btn-lg pay-btn"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                >
                  {placing ? <Spinner size="sm" /> : `Siparişi Onayla — ${subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`}
                </button>

                <p className="secure-note">
                  Ödemeniz iyzico altyapısıyla güvenli şekilde işlenir.
                </p>
              </>
            )}
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="cart-summary card">
            <h3 className="summary-title">Sipariş Özeti</h3>
            <div className="checkout-items">
              {items.map((item) => (
                <div key={item.id} className="checkout-item">
                  <span className="checkout-item-name">{item.name} × {item.quantity}</span>
                  <span className="checkout-item-price">
                    {(Number(item.price) * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </span>
                </div>
              ))}
            </div>

            {couponCode && (
              <div className="summary-coupon">
                <span>Kupon: <strong>{couponCode}</strong></span>
              </div>
            )}

            <div className="summary-divider" />
            <div className="summary-row">
              <span>Ara Toplam</span>
              <span>{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="summary-row">
              <span>Kargo</span>
              <span className="text-success">Ücretsiz</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Toplam</span>
              <span>{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
          </div>
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
  )
}
