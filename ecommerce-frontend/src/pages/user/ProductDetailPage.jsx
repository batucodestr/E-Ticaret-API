import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct } from '../../api/products'
import { addToCart } from '../../api/cart'
import { getProductComments, createComment, updateComment, deleteComment } from '../../api/comments'
import { getApiError } from '../../api/errorHelper'
import { useAuth } from '../../context/AuthContext'
import StarRating from '../../components/ui/StarRating'
import Spinner from '../../components/ui/Spinner'
import { IconShoppingCart, IconBox, IconEdit, IconTrash } from '../../components/ui/Icons'
import './ProductDetailPage.css'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [product, setProduct] = useState(null)
  const [comments, setComments] = useState([])
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [addMsg, setAddMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const [commentForm, setCommentForm] = useState({ rating: 5, description: '' })
  const [submitingComment, setSubmitingComment] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [editingComment, setEditingComment] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProduct(slug)
        setProduct(res.data)
      } catch {
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug, navigate])

  useEffect(() => {
    if (product?.id) {
      getProductComments(product.id)
        .then(r => setComments(r.data.results || r.data || []))
        .catch(() => {})
    }
  }, [product?.id])

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setAdding(true)
    try {
      await addToCart(product.id, qty)
      setAddMsg('Ürün sepete eklendi.')
      setTimeout(() => setAddMsg(''), 3000)
    } catch (err) {
      setAddMsg(getApiError(err, 'Bir hata oluştu.'))
    } finally {
      setAdding(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login'); return }
    setCommentError('')
    setSubmitingComment(true)
    try {
      if (editingComment) {
        const res = await updateComment(editingComment.id, commentForm)
        setComments(prev => prev.map(c => c.id === editingComment.id ? res.data : c))
        setEditingComment(null)
      } else {
        const res = await createComment(product.id, commentForm)
        setComments(prev => [res.data, ...prev])
      }
      setCommentForm({ rating: 5, description: '' })
    } catch (err) {
      setCommentError(getApiError(err, 'Yorum gönderilemedi.'))
    } finally {
      setSubmitingComment(false)
    }
  }

  const handleDeleteComment = async (id) => {
    if (!confirm('Yorumu silmek istediğinize emin misiniz?')) return
    try {
      await deleteComment(id)
      setComments(prev => prev.filter(c => c.id !== id))
    } catch {}
  }

  const getImgUrl = (img) => img
    ? (img.startsWith('http') ? img : `${BASE_URL}${img}`)
    : null

  if (loading) return <Spinner fullPage />
  if (!product) return null

  const avgRating = comments.length
    ? (comments.reduce((s, c) => s + c.rating, 0) / comments.length).toFixed(1)
    : null

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="product-detail-grid">
          {/* Images */}
          <div className="product-images">
            <div className="product-main-img">
              {product.images?.[activeImg] ? (
                <img src={getImgUrl(product.images[activeImg].image)} alt={product.name} />
              ) : (
                <div className="product-noimg" style={{ color: 'var(--text-muted)' }}><IconBox width={64} height={64} /></div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="product-thumbnails">
                {product.images.map((img, i) => (
                  <button key={img.id} className={`thumb-btn ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                    <img src={getImgUrl(img.image)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            {product.category && (
              <span className="product-cat-badge">{product.category.name}</span>
            )}
            <h1 className="product-title">{product.name}</h1>

            {avgRating && (
              <div className="product-rating-row">
                <StarRating value={Math.round(avgRating)} readonly />
                <span className="rating-text">{avgRating} ({comments.length} yorum)</span>
              </div>
            )}

            <div className="product-price-row">
              <span className="product-price">{Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
              <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                {product.stock > 0 ? `${product.stock} adet stokta` : 'Stokta Yok'}
              </span>
            </div>

            {product.description && (
              <p className="product-desc">{product.description}</p>
            )}

            {product.stock > 0 && (
              <div className="add-cart-row">
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span className="qty-value">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                </div>
                <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={adding}>
                  {adding ? <Spinner size="sm" /> : (
                    <><IconShoppingCart width={17} height={17} /> Sepete Ekle</>
                  )}
                </button>
              </div>
            )}

            {addMsg && (
              <div className={`alert ${addMsg.includes('eklendi') ? 'alert-success' : 'alert-error'} mt-3`}>
                {addMsg}
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="comments-section">
          <h2 className="section-title mb-4">Ürün Yorumları ({comments.length})</h2>

          {isAuthenticated && (
            <div className="comment-form card">
              <h3 className="comment-form-title">{editingComment ? 'Yorumu Düzenle' : 'Yorum Yaz'}</h3>
              <form onSubmit={handleSubmitComment}>
                <div className="form-group">
                  <label className="form-label">Puanınız</label>
                  <StarRating value={commentForm.rating} onChange={(v) => setCommentForm(f => ({ ...f, rating: v }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Yorumunuz</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Ürün hakkında düşüncelerinizi paylaşın..."
                    value={commentForm.description}
                    onChange={(e) => setCommentForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                {commentError && <div className="alert alert-error mb-3">{commentError}</div>}
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={submitingComment}>
                    {submitingComment ? <Spinner size="sm" /> : editingComment ? 'Güncelle' : 'Gönder'}
                  </button>
                  {editingComment && (
                    <button type="button" className="btn btn-secondary" onClick={() => { setEditingComment(null); setCommentForm({ rating: 5, description: '' }) }}>
                      İptal
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {comments.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">Henüz yorum yok</p>
              <p className="empty-desc">Bu ürün için ilk yorumu siz yapın.</p>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map((c) => (
                <div key={c.id} className="comment-card card">
                  <div className="comment-header">
                    <div className="comment-author">
                      <div className="comment-avatar">{c.user?.email?.[0]?.toUpperCase() || 'K'}</div>
                      <div>
                        <div className="comment-name">{c.user?.email?.split('@')[0] || 'Kullanıcı'}</div>
                        <div className="comment-date">{new Date(c.created_at).toLocaleDateString('tr-TR')}</div>
                      </div>
                    </div>
                    <div className="comment-right">
                      <StarRating value={c.rating} readonly />
                      {user?.id === c.user?.id && (
                        <div className="comment-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => { setEditingComment(c); setCommentForm({ rating: c.rating, description: c.description || '' }) }}>
                            <IconEdit width={14} height={14} /> Düzenle
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComment(c.id)}>
                            <IconTrash width={14} height={14} /> Sil
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {c.description && <p className="comment-text">{c.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
