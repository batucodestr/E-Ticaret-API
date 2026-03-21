import { useState, useEffect } from 'react'
import { adminGetComments, adminUpdateComment, adminDeleteComment } from '../../api/comments'
import Spinner from '../../components/ui/Spinner'
import StarRating from '../../components/ui/StarRating'
import Pagination from '../../components/ui/Pagination'

export default function AdminComments() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchComments = async (page = 1) => {
    setLoading(true)
    try {
      const res = await adminGetComments({ page })
      const data = res.data
      setComments(data.results || data || [])
      if (data.count) setTotalPages(Math.ceil(data.count / 10))
    } catch { }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchComments(currentPage) }, [currentPage])

  const toggleActive = async (c) => {
    setUpdatingId(c.id)
    try {
      await adminUpdateComment(c.id, { active: !c.active })
      setComments(prev => prev.map(x => x.id === c.id ? { ...x, active: !c.active } : x))
    } catch { }
    finally { setUpdatingId(null) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return
    try {
      await adminDeleteComment(id)
      setComments(prev => prev.filter(c => c.id !== id))
    } catch {}
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Yorumlar</h1>
        <p className="page-subtitle">Tüm ürün yorumlarını yönetin</p>
      </div>

      <div className="card">
        {loading ? <Spinner fullPage /> : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Kullanıcı</th>
                    <th>Ürün</th>
                    <th>Puan</th>
                    <th>Yorum</th>
                    <th>Durum</th>
                    <th>Tarih</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontSize: 13 }}>{c.user?.email || '-'}</td>
                      <td style={{ fontSize: 13 }}>{c.product?.name || c.product || '-'}</td>
                      <td><StarRating value={c.rating} readonly /></td>
                      <td style={{ maxWidth: 200, fontSize: 13, color: 'var(--text-secondary)' }}>
                        {c.description ? c.description.slice(0, 80) + (c.description.length > 80 ? '...' : '') : '-'}
                      </td>
                      <td>
                        <span className={`badge ${c.active ? 'badge-green' : 'badge-red'}`}>
                          {c.active ? 'Aktif' : 'Gizli'}
                        </span>
                      </td>
                      <td className="text-secondary text-sm">{new Date(c.created_at).toLocaleDateString('tr-TR')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className={`btn btn-sm ${c.active ? 'btn-secondary' : 'btn-success'}`}
                            onClick={() => toggleActive(c)}
                            disabled={updatingId === c.id}
                          >
                            {c.active ? 'Gizle' : 'Yayınla'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Sil</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {comments.length === 0 && (
              <div className="empty-state"><p className="empty-title">Yorum bulunamadı</p></div>
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
