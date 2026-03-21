import { useState, useEffect } from 'react'
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../api/categories'
import { getApiError } from '../../api/errorHelper'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import { IconPlus, IconEdit, IconTrash } from '../../components/ui/Icons'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchCategories = () =>
    adminGetCategories().then(r => setCategories(r.data.results || r.data || [])).catch(() => {})

  useEffect(() => { fetchCategories().finally(() => setLoading(false)) }, [])

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '' }); setError(''); setShowModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '' }); setError(''); setShowModal(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      if (editing) await adminUpdateCategory(editing.id, form)
      else await adminCreateCategory(form)
      await fetchCategories()
      setShowModal(false)
    } catch (err) {
      setError(getApiError(err, 'Kaydedilemedi.'))
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return
    try {
      await adminDeleteCategory(id)
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      alert(getApiError(err, 'Bu kategoriye bağlı ürünler olduğu için silinemiyor.'))
    }
  }

  if (loading) return <Spinner fullPage />

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Kategoriler</h1>
          <p className="page-subtitle">{categories.length} kategori</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><IconPlus width={15} height={15} /> Yeni Kategori</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Kategori Adı</th>
                <th>Açıklama</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="text-muted text-sm">{c.id}</td>
                  <td className="font-semibold">{c.name}</td>
                  <td className="text-secondary">{c.description || '-'}</td>
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
        {categories.length === 0 && (
          <div className="empty-state"><p className="empty-title">Kategori bulunamadı</p></div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Kategori Düzenle' : 'Yeni Kategori'} size="sm">
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Kategori Adı *</label>
            <input className="form-input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Açıklama</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ minHeight: 80 }} />
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
