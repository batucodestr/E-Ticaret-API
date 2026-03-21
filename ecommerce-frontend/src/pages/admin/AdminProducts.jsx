import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminGetProducts, adminDeleteProduct, adminCreateProduct, adminUpdateProduct, adminUploadProductImage, adminDeleteProductImage, adminGetProduct } from '../../api/products'
import { getCategories } from '../../api/categories'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import { IconBox, IconPlus, IconEdit, IconTrash, IconEye } from '../../components/ui/Icons'
import { getApiError } from '../../api/errorHelper'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const emptyForm = { name: '', description: '', price: '', stock: '', category: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [showImageModal, setShowImageModal] = useState(false)
  const [imageProduct, setImageProduct] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [productImages, setProductImages] = useState([])

  const fetchProducts = async (page = 1, q = search) => {
    setLoading(true)
    try {
      const params = { page }
      if (q) params.search = q
      const res = await adminGetProducts(params)
      const data = res.data
      setProducts(data.results || data || [])
      if (data.count) setTotalPages(Math.ceil(data.count / 5))
    } catch { }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchProducts(currentPage)
    getCategories().then(r => setCategories(r.data.results || r.data || [])).catch(() => {})
  }, [currentPage])

  const openAdd = () => {
    setEditing(null); setForm(emptyForm); setFormError(''); setShowModal(true)
  }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, category: p.category?.id || '' })
    setFormError(''); setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setFormError(''); setSaving(true)
    try {
      if (editing) {
        await adminUpdateProduct(editing.id, form)
      } else {
        await adminCreateProduct(form)
      }
      await fetchProducts(currentPage)
      setShowModal(false)
    } catch (err) {
      setFormError(getApiError(err, 'Kaydedilemedi.'))
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    try {
      await adminDeleteProduct(id)
      await fetchProducts(currentPage)
    } catch {}
  }

  const openImages = async (product) => {
    setImageProduct(product)
    try {
      const res = await adminGetProduct(product.id)
      setProductImages(res.data.images || [])
    } catch { setProductImages([]) }
    setImageFile(null); setShowImageModal(true)
  }

  const handleUploadImage = async (e) => {
    e.preventDefault()
    if (!imageFile) return
    setUploadingImg(true)
    const fd = new FormData()
    fd.append('image', imageFile)
    try {
      const res = await adminUploadProductImage(imageProduct.id, fd)
      setProductImages(prev => [...prev, res.data])
      setImageFile(null)
    } catch {} finally { setUploadingImg(false) }
  }

  const handleDeleteImage = async (imgId) => {
    try {
      await adminDeleteProductImage(imgId)
      setProductImages(prev => prev.filter(i => i.id !== imgId))
    } catch {}
  }

  const getImgUrl = (img) => img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : null

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Ürünler</h1>
          <p className="page-subtitle">Tüm ürünleri yönetin</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><IconPlus width={15} height={15} /> Yeni Ürün</button>
      </div>

      <div className="card">
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); fetchProducts(1, search) }} style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="Ürün ara..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
            <button type="submit" className="btn btn-secondary btn-sm">Ara</button>
          </form>
        </div>

        {loading ? <Spinner fullPage /> : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Kategori</th>
                    <th>Fiyat</th>
                    <th>Stok</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const img = p.images?.[0]?.image
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: '#f8fafc', flexShrink: 0, border: '1px solid var(--border)' }}>
                              {img ? <img src={getImgUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><IconBox width={18} height={18} /></div>}
                            </div>
                            <div>
                              <div className="font-semibold" style={{ fontSize: 14 }}>{p.name}</div>
                              <div className="text-muted text-xs">{p.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td>{p.category?.name || '-'}</td>
                        <td className="font-semibold">{Number(p.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                        <td>
                          <span className={`badge ${p.stock > 0 ? 'badge-green' : 'badge-red'}`}>{p.stock}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openImages(p)}><IconEye width={14} height={14} /> Görseller</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}><IconEdit width={14} height={14} /> Düzenle</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}><IconTrash width={14} height={14} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {products.length === 0 && (
              <div className="empty-state"><p className="empty-title">Ürün bulunamadı</p></div>
            )}
            <div style={{ padding: 16 }}>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </div>

      {/* Product Form Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Ürünü Düzenle' : 'Yeni Ürün'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Ürün Adı *</label>
            <input className="form-input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Açıklama</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Fiyat (₺) *</label>
              <input className="form-input" type="number" step="0.01" min="0" required value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Stok *</label>
              <input className="form-input" type="number" min="0" required value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              <option value="">Kategori Seçin</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {formError && <div className="alert alert-error mb-3">{formError}</div>}
          <button type="submit" className="btn btn-primary w-full" disabled={saving}>
            {saving ? <Spinner size="sm" /> : editing ? 'Güncelle' : 'Oluştur'}
          </button>
        </form>
      </Modal>

      {/* Images Modal */}
      <Modal open={showImageModal} onClose={() => setShowImageModal(false)} title={`${imageProduct?.name || ''} - Görseller`} size="lg">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, marginBottom: 20 }}>
          {productImages.length === 0 && <p className="text-muted text-sm" style={{ gridColumn: '1/-1' }}>Henüz görsel yok.</p>}
          {productImages.map((img) => (
            <div key={img.id} style={{ position: 'relative' }}>
              <img src={getImgUrl(img.image)} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
              <button
                className="btn btn-danger btn-sm"
                style={{ position: 'absolute', top: 4, right: 4, padding: '3px 6px', fontSize: 11, minHeight: 'unset' }}
                onClick={() => handleDeleteImage(img.id)}
              >✕</button>
            </div>
          ))}
        </div>
        <form onSubmit={handleUploadImage} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Görsel Yükle</label>
            <input type="file" accept="image/*" className="form-input" onChange={e => setImageFile(e.target.files[0])} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!imageFile || uploadingImg}>
            {uploadingImg ? <Spinner size="sm" /> : 'Yükle'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
