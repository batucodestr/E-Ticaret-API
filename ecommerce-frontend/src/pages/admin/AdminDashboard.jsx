import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminGetProducts } from '../../api/products'
import { adminGetOrders } from '../../api/orders'
import { adminGetUsers } from '../../api/users'
import { adminGetComments } from '../../api/comments'
import Spinner from '../../components/ui/Spinner'
import { IconBox, IconShoppingBag, IconUsers, IconMessageSquare, IconChevronRight } from '../../components/ui/Icons'
import './AdminDashboard.css'

const statusLabel = {
  pending: { text: 'Beklemede', cls: 'badge-yellow' },
  processing: { text: 'Hazırlanıyor', cls: 'badge-blue' },
  shipped: { text: 'Kargoda', cls: 'badge-purple' },
  completed: { text: 'Tamamlandı', cls: 'badge-green' },
  canceled: { text: 'İptal', cls: 'badge-red' },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, comments: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, ordRes, userRes, comRes] = await Promise.allSettled([
          adminGetProducts(), adminGetOrders(), adminGetUsers(), adminGetComments(),
        ])
        const getCount = (res) => {
          if (res.status !== 'fulfilled') return 0
          const d = res.value.data
          return d.count || (Array.isArray(d) ? d.length : (Array.isArray(d.results) ? d.results.length : 0))
        }
        setStats({
          products: getCount(prodRes),
          orders: getCount(ordRes),
          users: getCount(userRes),
          comments: getCount(comRes),
        })
        if (ordRes.status === 'fulfilled') {
          const orders = ordRes.value.data.results || ordRes.value.data || []
          setRecentOrders(orders.slice(0, 5))
        }
      } catch { }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  if (loading) return <Spinner fullPage />

  const cards = [
    { label: 'Toplam Ürün', value: stats.products, Icon: IconBox, to: '/admin/products' },
    { label: 'Toplam Sipariş', value: stats.orders, Icon: IconShoppingBag, to: '/admin/orders' },
    { label: 'Toplam Kullanıcı', value: stats.users, Icon: IconUsers, to: '/admin/users' },
    { label: 'Toplam Yorum', value: stats.comments, Icon: IconMessageSquare, to: '/admin/comments' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gösterge Paneli</h1>
        <p className="page-subtitle">Genel duruma göz atın.</p>
      </div>

      <div className="stat-cards">
        {cards.map((c) => {
          const Icon = c.Icon
          return (
            <Link key={c.label} to={c.to} className="stat-card card">
              <div className="stat-icon">
                <Icon width={22} height={22} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{c.value.toLocaleString('tr-TR')}</div>
                <div className="stat-label">{c.label}</div>
              </div>
              <IconChevronRight width={16} height={16} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
            </Link>
          )
        })}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="font-semibold">Son Siparişler</h3>
          <Link to="/admin/orders" className="btn btn-ghost btn-sm">Tümünü Gör</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="empty-state"><p className="empty-title">Sipariş bulunamadı</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sipariş #</th>
                  <th>Müşteri</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const st = statusLabel[o.status] || { text: o.status, cls: 'badge-gray' }
                  return (
                    <tr key={o.id}>
                      <td className="font-semibold">#{o.id}</td>
                      <td>{o.user?.email || '-'}</td>
                      <td className="font-semibold">{Number(o.total_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                      <td><span className={`badge ${st.cls}`}>{st.text}</span></td>
                      <td className="text-secondary text-sm">{new Date(o.created_at).toLocaleDateString('tr-TR')}</td>
                      <td><Link to={`/admin/orders/${o.id}`} className="btn btn-ghost btn-sm">Detay</Link></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
