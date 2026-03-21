import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminGetOrders, adminUpdateOrderStatus } from '../../api/orders'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'

const statusLabel = {
  pending: { text: 'Beklemede', cls: 'badge-yellow' },
  processing: { text: 'Hazırlanıyor', cls: 'badge-blue' },
  shipped: { text: 'Kargoda', cls: 'badge-purple' },
  completed: { text: 'Tamamlandı', cls: 'badge-green' },
  canceled: { text: 'İptal', cls: 'badge-red' },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = async (page = 1, status = filterStatus) => {
    setLoading(true)
    try {
      const params = { page }
      if (status) params.status = status
      const res = await adminGetOrders(params)
      const data = res.data
      setOrders(data.results || data || [])
      if (data.count) setTotalPages(Math.ceil(data.count / 10))
    } catch { }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders(currentPage) }, [currentPage, filterStatus])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await adminUpdateOrderStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch { }
    finally { setUpdatingId(null) }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Siparişler</h1>
        <p className="page-subtitle">Tüm siparişleri yönetin</p>
      </div>

      <div className="card">
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select className="form-select" style={{ maxWidth: 200 }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1) }}>
            <option value="">Tüm Durumlar</option>
            {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v.text}</option>)}
          </select>
        </div>

        {loading ? <Spinner fullPage /> : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Sipariş #</th>
                    <th>Müşteri</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th>Tarih</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const st = statusLabel[o.status] || { text: o.status, cls: 'badge-gray' }
                    return (
                      <tr key={o.id}>
                        <td className="font-semibold">#{o.id}</td>
                        <td style={{ fontSize: 13 }}>{o.user?.email || '-'}</td>
                        <td className="font-semibold">{Number(o.total_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                        <td>
                          <select
                            className="form-select"
                            style={{ fontSize: 13, padding: '4px 8px', minWidth: 140 }}
                            value={o.status}
                            onChange={e => handleStatusChange(o.id, e.target.value)}
                            disabled={updatingId === o.id}
                          >
                            {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v.text}</option>)}
                          </select>
                        </td>
                        <td className="text-secondary text-sm">{new Date(o.created_at).toLocaleDateString('tr-TR')}</td>
                        <td><Link to={`/admin/orders/${o.id}`} className="btn btn-ghost btn-sm">Detay</Link></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {orders.length === 0 && (
              <div className="empty-state"><p className="empty-title">Sipariş bulunamadı</p></div>
            )}
            <div style={{ padding: 16 }}>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
