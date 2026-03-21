import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder } from '../../api/orders'
import Spinner from '../../components/ui/Spinner'
import { IconArrowLeft, IconBox, IconCheckCircle } from '../../components/ui/Icons'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const statusLabel = {
  pending: { text: 'Beklemede', cls: 'badge-yellow' },
  processing: { text: 'Hazırlanıyor', cls: 'badge-blue' },
  shipped: { text: 'Kargoda', cls: 'badge-purple' },
  completed: { text: 'Tamamlandı', cls: 'badge-green' },
  canceled: { text: 'İptal Edildi', cls: 'badge-red' },
}

const steps = ['pending', 'processing', 'shipped', 'completed']

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrder(id)
      .then(r => setOrder(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner fullPage />
  if (!order) return (
    <div className="page-wrapper"><div className="container">
      <div className="empty-state"><p className="empty-title">Sipariş bulunamadı</p><Link to="/orders" className="btn btn-primary">Siparişlere Dön</Link></div>
    </div></div>
  )

  const st = statusLabel[order.status] || { text: order.status, cls: 'badge-gray' }
  const stepIdx = steps.indexOf(order.status)

  const getImgUrl = (img) => img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : null

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="page-header flex items-center gap-3">
          <Link to="/orders" className="btn btn-secondary btn-sm"><IconArrowLeft width={14} height={14} /> Geri</Link>
          <div>
            <h1 className="page-title">Sipariş #{order.id}</h1>
            <p className="page-subtitle">{new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <span className={`badge ${st.cls}`} style={{ marginLeft: 'auto' }}>{st.text}</span>
        </div>

        {/* Progress */}
        {order.status !== 'canceled' && (
          <div className="card order-progress">
            {steps.map((s, i) => (
              <div key={s} className="step-item">
                <div className={`step-dot ${i <= stepIdx ? 'done' : ''}`}>{i < stepIdx ? '✓' : i + 1}</div>
                <div className="step-label">{statusLabel[s]?.text}</div>
                {i < steps.length - 1 && <div className={`step-line ${i < stepIdx ? 'done' : ''}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Items */}
        <div className="card" style={{ padding: 24, marginTop: 16 }}>
          <h3 className="font-semibold mb-4">Ürünler</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {order.items?.map((item) => {
              const img = item.product?.images?.[0]?.image
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 56, height: 56, overflow: 'hidden', background: '#111', flexShrink: 0, border: '1px solid var(--border)' }}>
                    {img ? <img src={getImgUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><IconBox width={22} height={22} /></div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    {item.product?.slug ? (
                      <Link to={`/products/${item.product.slug}`} style={{ fontWeight: 700, fontSize: 14, color: '#fff', textDecoration: 'none' }}>
                        {item.product.name}
                      </Link>
                    ) : (
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{item.product?.name || 'Ürün'}</div>
                    )}
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>× {item.quantity} adet</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{(Number(item.price) * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontWeight: 800, fontSize: 18 }}>
            <span>Toplam</span>
            <span>{Number(order.total_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
          </div>
        </div>

        {/* Addresses */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          {order.addresses?.delivery_address && (
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Teslimat Adresi</h4>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <div style={{ fontWeight: 700, color: '#fff' }}>{order.addresses.delivery_address.fullname}</div>
                <div>{order.addresses.delivery_address.address_line}</div>
                <div>{order.addresses.delivery_address.district ? `${order.addresses.delivery_address.district}, ` : ''}{order.addresses.delivery_address.city?.name}</div>
                <div>{order.addresses.delivery_address.phone}</div>
              </div>
            </div>
          )}
          {order.addresses?.billing_address && (
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Fatura Adresi</h4>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <div style={{ fontWeight: 700, color: '#fff' }}>{order.addresses.billing_address.fullname}</div>
                <div>{order.addresses.billing_address.address_line}</div>
                <div>{order.addresses.billing_address.district ? `${order.addresses.billing_address.district}, ` : ''}{order.addresses.billing_address.city?.name}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .order-progress { display: flex; align-items: flex-start; justify-content: space-between; padding: 24px; position: relative; margin-top: 16px; }
        .step-item { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; position: relative; }
        .step-dot { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--border); background: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--text-muted); z-index: 1; }
        .step-dot.done { background: var(--success); border-color: var(--success); color: #fff; font-size: 10px; }
        .step-label { font-size: 12px; font-weight: 600; text-align: center; color: var(--text-secondary); }
        .step-line { position: absolute; top: 16px; left: 50%; width: 100%; height: 2px; background: var(--border); z-index: 0; }
        .step-line.done { background: var(--success); }
        @media (max-width: 600px) { .order-progress { flex-direction: column; gap: 16px; align-items: flex-start; } }
      `}</style>
    </div>
  )
}
