import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminGetOrder, adminUpdateOrderStatus } from '../../api/orders'
import Spinner from '../../components/ui/Spinner'
import { IconArrowLeft, IconBox } from '../../components/ui/Icons'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const statusLabel = {
  pending: { text: 'Beklemede', cls: 'badge-yellow' },
  processing: { text: 'Hazırlanıyor', cls: 'badge-blue' },
  shipped: { text: 'Kargoda', cls: 'badge-purple' },
  completed: { text: 'Tamamlandı', cls: 'badge-green' },
  canceled: { text: 'İptal', cls: 'badge-red' },
}

export default function AdminOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    adminGetOrder(id).then(r => setOrder(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (status) => {
    setUpdating(true)
    try {
      await adminUpdateOrderStatus(id, status)
      setOrder(prev => ({ ...prev, status }))
    } catch { }
    finally { setUpdating(false) }
  }

  const getImgUrl = (img) => img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : null

  if (loading) return <Spinner fullPage />
  if (!order) return <div className="page-wrapper"><div className="container"><div className="empty-state"><p>Sipariş bulunamadı.</p><Link to="/admin/orders" className="btn btn-primary">Geri Dön</Link></div></div></div>

  const st = statusLabel[order.status] || { text: order.status, cls: 'badge-gray' }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Link to="/admin/orders" className="btn btn-secondary btn-sm"><IconArrowLeft width={14} height={14} /> Siparişler</Link>
        <div>
          <h1 className="page-title">Sipariş #{order.id}</h1>
          <p className="page-subtitle">{new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`badge ${st.cls}`}>{st.text}</span>
          <select className="form-select" style={{ width: 180 }} value={order.status} onChange={e => handleStatusChange(e.target.value)} disabled={updating}>
            {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v.text}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Customer */}
          <div className="card" style={{ padding: 20 }}>
            <h3 className="font-semibold mb-3">Müşteri Bilgileri</h3>
            <div style={{ fontSize: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div><span className="text-secondary">E-posta: </span>{order.user?.email}</div>
              {order.user?.phone && <div><span className="text-secondary">Telefon: </span>{order.user.phone}</div>}
            </div>
          </div>

          {/* Items */}
          <div className="card" style={{ padding: 20 }}>
            <h3 className="font-semibold mb-4">Ürünler ({order.items?.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {order.items?.map((item) => {
                const img = item.product?.images?.[0]?.image
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', background: '#f8fafc', flexShrink: 0, border: '1px solid var(--border)' }}>
                      {img ? <img src={getImgUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><IconBox width={18} height={18} /></div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="font-semibold" style={{ fontSize: 14 }}>{item.product?.name || 'Ürün silindi'}</div>
                      <div className="text-secondary text-sm">Birim: {Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                    </div>
                    <div>× {item.quantity}</div>
                    <div className="font-semibold">{(Number(item.price) * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontWeight: 800, fontSize: 18 }}>
              <span>Toplam</span>
              <span>{Number(order.total_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {order.delivery_address && (
            <div className="card" style={{ padding: 20 }}>
              <h4 className="font-semibold mb-3">Teslimat Adresi</h4>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <div className="font-semibold" style={{ color: 'var(--text)' }}>{order.delivery_address.fullname}</div>
                <div>{order.delivery_address.address_line}</div>
                <div>{order.delivery_address.district}, {order.delivery_address.city?.name}</div>
                <div>{order.delivery_address.phone}</div>
              </div>
            </div>
          )}
          {order.billing_address && (
            <div className="card" style={{ padding: 20 }}>
              <h4 className="font-semibold mb-3">Fatura Adresi</h4>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <div className="font-semibold" style={{ color: 'var(--text)' }}>{order.billing_address.fullname}</div>
                <div>{order.billing_address.address_line}</div>
                <div>{order.billing_address.city?.name}</div>
              </div>
            </div>
          )}
          {order.coupon && (
            <div className="card" style={{ padding: 20 }}>
              <h4 className="font-semibold mb-2">Kupon</h4>
              <span className="badge badge-purple">{order.coupon.code}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
