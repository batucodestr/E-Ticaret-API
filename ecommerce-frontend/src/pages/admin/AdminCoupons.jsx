import { useState, useEffect } from 'react'
import { adminGetCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon } from '../../api/coupons'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import { IconPlus, IconEdit, IconTrash } from '../../components/ui/Icons'
import { getApiError } from '../../api/errorHelper'

const emptyForm = {
  code: '', discount_percent: '', discount_amount: '',
  start_date: '', end_date: '', active: true, usage_limit: '',
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchCoupons = () =>
    adminGetCoupons().then(r => setCoupons(r.data.results || r.data || [])).catch(() => {})

  useEffect(() => { fetchCoupons().finally(() => setLoading(false)) }, [])

  const openAdd = () => {
    setEditing(null); setForm(emptyForm); setError(''); setShowModal(true)
  }
  const openEdit = (c) => {
    setEditing(c)
    setForm({
      code: c.code || '',
      discount_percent: c.discount_percent || '',
      discount_amount: c.discount_amount || '',
      start_date: c.start_date ? c.start_date.slice(0, 16) : '',
      end_date: c.end_date ? c.end_date.slice(0, 16) : '',
      active: c.active,
      usage_limit: c.usage_limit || '',
    })
    setError(''); setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setError(''); setSaving(true)
    const payload = { ...form }
    if (!payload.discount_percent) delete payload.discount_percent
    if (!payload.discount_amount) delete payload.discount_amount
    if (!payload.usage_limit) delete payload.usage_limit
    try {
      if (editing) await adminUpdateCoupon(editing.id, payload)
      else await adminCreateCoupon(payload)
      await fetchCoupons()
      setShowModal(false)
    } catch (err) {
      setError(getApiError(err, 'Kaydedilemedi.'))
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu kuponu silmek istediğinize emin misiniz?')) return
    try {
      await adminDeleteCoupon(id)
      setCoupons(prev => prev.filter(c => c.id !== id))
    } catch (err) { alert(getApiError(err, 'Kupon silinemedi.')) }
  }

  if (loading) return <Spinner fullPage />

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Kuponlar</h1>
          <p className="page-subtitle">İndirim kuponlarını yönetin</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><IconPlus width={15} height={15} /> Yeni Kupon</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kod</th>
                <th>İndirim</th>
                <th>Kullanım</th>
                <th>Durum</th>
                <th>Başlangıç</th>
                <th>Bitiş</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td><span className="badge badge-purple">{c.code}</span></td>
                  <td>
                    {c.discount_percent ? `%${c.discount_percent}` : ''}
                    {c.discount_percent && c.discount_amount ? ' / ' : ''}
                    {c.discount_amount ? `${Number(c.discount_amount).toLocaleString('tr-TR')} ₺` : ''}
                    {!c.discount_percent && !c.discount_amount ? '-' : ''}
                  </td>
                  <td>{c.usage_count} / {c.usage_limit || '∞'}</td>
                  <td><span className={`badge ${c.active ? 'badge-green' : 'badge-red'}`}>{c.active ? 'Aktif' : 'Pasif'}</span></td>
                  <td className="text-sm text-secondary">{c.start_date ? new Date(c.start_date).toLocaleDateString('tr-TR') : '-'}</td>
                  <td className="text-sm text-secondary">{c.end_date ? new Date(c.end_date).toLocaleDateString('tr-TR') : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}><IconEdit width={14} height={14} /> Düzenle</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}><IconTrash width={14} height={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {coupons.length === 0 && (
          <div className="empty-state"><p className="empty-title">Kupon bulunamadı</p></div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Kuponu Düzenle' : 'Yeni Kupon'} size="md">
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Kupon Kodu *</label>
            <input className="form-input" required value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="YILBASI20" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">İndirim % (opsiyonel)</label>
              <input className="form-input" type="number" min="1" max="100" value={form.discount_percent} onChange={e => setForm(p => ({ ...p, discount_percent: e.target.value }))} placeholder="20" />
            </div>
            <div className="form-group">
              <label className="form-label">İndirim Tutarı ₺ (opsiyonel)</label>
              <input className="form-input" type="number" min="0" step="0.01" value={form.discount_amount} onChange={e => setForm(p => ({ ...p, discount_amount: e.target.value }))} placeholder="50.00" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Başlangıç Tarihi *</label>
              <input className="form-input" type="datetime-local" required value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Bitiş Tarihi *</label>
              <input className="form-input" type="datetime-local" required value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Kullanım Limiti</label>
            <input className="form-input" type="number" min="1" value={form.usage_limit} onChange={e => setForm(p => ({ ...p, usage_limit: e.target.value }))} placeholder="Sınırsız için boş bırakın" />
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="coupon_active" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />
            <label htmlFor="coupon_active" className="form-label" style={{ marginBottom: 0 }}>Aktif</label>
          </div>
          {error && <div className="alert alert-error mb-3">{error}</div>}
          <button type="submit" className="btn btn-primary w-full" disabled={saving}>
            {saving ? <Spinner size="sm" /> : editing ? 'Güncelle' : 'Oluştur'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
