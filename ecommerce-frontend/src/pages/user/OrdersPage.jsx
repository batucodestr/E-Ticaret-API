import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOrders } from '../../api/orders'
import Spinner from '../../components/ui/Spinner'
import { IconShoppingBag, IconChevronRight } from '../../components/ui/Icons'
import './OrdersPage.css'

const statusLabel = {
  pending: { text: 'Beklemede', cls: 'badge-yellow' },
  processing: { text: 'Hazırlanıyor', cls: 'badge-blue' },
  shipped: { text: 'Kargoda', cls: 'badge-purple' },
  completed: { text: 'Tamamlandı', cls: 'badge-green' },
  canceled: { text: 'İptal', cls: 'badge-red' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrders()
      .then(r => setOrders(r.data.results || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner fullPage />

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Siparişlerim</h1>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
              <IconShoppingBag width={44} height={44} />
            </div>
            <p className="empty-title">Henüz siparişiniz yok</p>
            <p className="empty-desc">İlk siparişinizi vermek için alışverişe başlayın.</p>
            <Link to="/products" className="btn btn-primary">Alışverişe Git</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const st = statusLabel[order.status] || { text: order.status, cls: 'badge-gray' }
              return (
                <Link key={order.id} to={`/orders/${order.id}`} className="order-card card">
                  <div className="order-card-header">
                    <div>
                      <div className="order-number">Sipariş #{order.id}</div>
                      <div className="order-date">{new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`badge ${st.cls}`}>{st.text}</span>
                      <IconChevronRight width={16} height={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                  <div className="order-card-footer">
                    <span className="order-items-count">{order.items?.length || 0} ürün</span>
                    <span className="order-total">{Number(order.total_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
