import { useState, useEffect } from 'react'
import { getAddresses, createAddress, updateAddress, deleteAddress, getCities } from '../../api/addresses'
import { getApiError } from '../../api/errorHelper'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import { IconMapPin, IconPlus, IconEdit, IconTrash } from '../../components/ui/Icons'
import './AddressesPage.css'

const typeLabels = { home: 'Ev', work: 'İş', billing: 'Fatura', shipping: 'Teslimat' }
const emptyForm = { fullname: '', phone: '', address_line: '', district: '', street: '', postal_code: '', city: '', address_type: 'home', is_default: false }

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchAddresses = () =>
    getAddresses().then(r => setAddresses(r.data.results || r.data || []))

  useEffect(() => {
    Promise.all([fetchAddresses(), getCities().then(r => setCities(r.data.results || r.data || []))])
      .finally(() => setLoading(false))
  }, [])

  const openAdd = () => {
    setEditing(null); setForm(emptyForm); setError(''); setShowModal(true)
  }

  const openEdit = (addr) => {
    setEditing(addr)
    setForm({
      fullname: addr.fullname || '', phone: addr.phone || '',
      address_line: addr.address_line || '', district: addr.district || '',
      street: addr.street || '', postal_code: addr.postal_code || '',
      city: addr.city?.id || '', address_type: addr.address_type || 'home',
      is_default: addr.is_default || false,
    })
    setError(''); setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      if (editing) await updateAddress(editing.id, form)
      else await createAddress(form)
      await fetchAddresses()
      setShowModal(false)
    } catch (err) {
      setError(getApiError(err, 'Kaydedilemedi.'))
    } finally { setSaving(false) }
  }

  const [deleteError, setDeleteError] = useState('')

  const handleDelete = async (id) => {
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return
    setDeleteError('')
    try {
      await deleteAddress(id)
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      setDeleteError(getApiError(err, 'Adres silinemedi.'))
    }
  }

  if (loading) return <Spinner fullPage />

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page-title">Adreslerim</h1>
          <button className="btn btn-primary" onClick={openAdd}>
            <IconPlus width={15} height={15} /> Yeni Adres
          </button>
        </div>

        {deleteError && <div className="alert alert-error mb-3">{deleteError}</div>}
        {addresses.length === 0 ? (
          <div className="empty-state">
            <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
              <IconMapPin width={44} height={44} />
            </div>
            <p className="empty-title">Kayıtlı adres yok</p>
            <p className="empty-desc">İlk adresinizi ekleyin.</p>
            <button className="btn btn-primary" onClick={openAdd}>Adres Ekle</button>
          </div>
        ) : (
          <div className="addresses-grid">
            {addresses.map((a) => (
              <div key={a.id} className="address-card card">
                <div className="addr-card-header">
                  <div>
                    <span className="badge badge-blue">{typeLabels[a.address_type] || a.address_type}</span>
                    {a.is_default && <span className="badge badge-green" style={{ marginLeft: 6 }}>Varsayılan</span>}
                  </div>
                  <div className="addr-card-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>
                      <IconEdit width={14} height={14} /> Düzenle
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>
                      <IconTrash width={14} height={14} />
                    </button>
                  </div>
                </div>
                <div className="addr-card-body">
                  <div className="addr-card-name">{a.fullname}</div>
                  <div className="addr-card-detail">{a.address_line}</div>
                  {a.district && <div className="addr-card-detail">{a.district} / {a.city?.name}</div>}
                  <div className="addr-card-detail">{a.phone}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Ad Soyad *</label>
              <input className="form-input" required value={form.fullname} onChange={e => setForm(p => ({ ...p, fullname: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Telefon *</label>
              <input className="form-input" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Adres Satırı *</label>
              <input className="form-input" required value={form.address_line} onChange={e => setForm(p => ({ ...p, address_line: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">İlçe</label>
                <input className="form-input" value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Sokak</label>
                <input className="form-input" value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Posta Kodu</label>
                <input className="form-input" value={form.postal_code} onChange={e => setForm(p => ({ ...p, postal_code: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Şehir *</label>
                <select className="form-select" required value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                  <option value="">Seçin</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Adres Tipi</label>
              <select className="form-select" value={form.address_type} onChange={e => setForm(p => ({ ...p, address_type: e.target.value }))}>
                <option value="home">Ev</option>
                <option value="work">İş</option>
                <option value="billing">Fatura</option>
                <option value="shipping">Teslimat</option>
              </select>
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="is_default" checked={form.is_default} onChange={e => setForm(p => ({ ...p, is_default: e.target.checked }))} />
              <label htmlFor="is_default" className="form-label" style={{ marginBottom: 0 }}>Varsayılan adres olarak ayarla</label>
            </div>
            {error && <div className="alert alert-error mb-3">{error}</div>}
            <button type="submit" className="btn btn-primary w-full" disabled={saving}>
              {saving ? <Spinner size="sm" /> : 'Kaydet'}
            </button>
          </form>
        </Modal>
      </div>
    </div>
  )
}
