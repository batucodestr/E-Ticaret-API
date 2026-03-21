import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart, updateCartItem, removeCartItem, clearCart } from '../../api/cart'
import Spinner from '../../components/ui/Spinner'
import { IconShoppingCart, IconBox, IconTrash } from '../../components/ui/Icons'
import './CartPage.css'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function CartPage() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const navigate = useNavigate()

  const fetchCart = async () => {
    try {
      const res = await getCart()
      setCart(res.data)
    } catch {
      setCart(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCart() }, [])

  const handleUpdateQty = async (itemId, qty) => {
    if (qty < 1) return
    setUpdating(itemId)
    try { await updateCartItem(itemId, qty); await fetchCart() } catch {}
    setUpdating(null)
  }

  const handleRemove = async (itemId) => {
    setUpdating(itemId)
    try { await removeCartItem(itemId); await fetchCart() } catch {}
    setUpdating(null)
  }

  const handleClear = async () => {
    if (!confirm('Sepeti tamamen temizlemek istediğinize emin misiniz?')) return
    try { await clearCart(); await fetchCart() } catch {}
  }

  const getImgUrl = (img) => img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : null

  if (loading) return <Spinner fullPage />

  const items = cart?.items || []
  const total = items.reduce((s, item) => s + Number(item.product.price) * item.quantity, 0)

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page-title">Sepetim</h1>
          {items.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleClear}>Sepeti Temizle</button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
              <IconShoppingCart width={44} height={44} />
            </div>
            <p className="empty-title">Sepetiniz boş</p>
            <p className="empty-desc">Alışverişe başlamak için ürünlerimize göz atın.</p>
            <Link to="/products" className="btn btn-primary">Ürünlere Git</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => {
                const img = item.product.images?.[0]?.image
                return (
                  <div key={item.id} className="cart-item card">
                    <div className="cart-item-img">
                      {img ? (
                        <img src={getImgUrl(img)} alt={item.product.name} />
                      ) : (
                        <div className="cart-item-noimg"><IconBox width={24} height={24} /></div>
                      )}
                    </div>
                    <div className="cart-item-info">
                      <Link to={`/products/${item.product.slug}`} className="cart-item-name">
                        {item.product.name}
                      </Link>
                      <div className="cart-item-price">{Number(item.product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                    </div>
                    <div className="cart-item-controls">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => handleUpdateQty(item.id, item.quantity - 1)} disabled={updating === item.id || item.quantity <= 1}>−</button>
                        <span className="qty-value">{updating === item.id ? '...' : item.quantity}</span>
                        <button className="qty-btn" onClick={() => handleUpdateQty(item.id, item.quantity + 1)} disabled={updating === item.id || item.quantity >= item.product.stock}>+</button>
                      </div>
                      <div className="cart-item-subtotal">
                        {(Number(item.product.price) * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </div>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemove(item.id)} disabled={updating === item.id}>
                        <IconTrash width={14} height={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="cart-summary card">
              <h3 className="summary-title">Sipariş Özeti</h3>
              <div className="summary-row">
                <span>Ürünler ({items.length})</span>
                <span>{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
              </div>
              <div className="summary-row">
                <span>Kargo</span>
                <span className="text-success">Ücretsiz</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row summary-total">
                <span>Toplam</span>
                <span>{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
              </div>
              <button className="btn btn-primary btn-lg w-full" onClick={() => navigate('/checkout')}>
                Siparişi Tamamla
              </button>
              <Link to="/products" className="btn btn-secondary w-full mt-2">Alışverişe Devam Et</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
