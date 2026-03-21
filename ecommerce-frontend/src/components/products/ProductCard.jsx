import { Link } from 'react-router-dom'
import { addToCart } from '../../api/cart'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { IconShoppingCart, IconBox } from '../ui/Icons'
import './ProductCard.css'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const imageUrl = product.images?.[0]?.image
    ? (product.images[0].image.startsWith('http') ? product.images[0].image : `${BASE_URL}${product.images[0].image}`)
    : null

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    setAdding(true)
    try {
      await addToCart(product.id, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      // silently fail
    } finally {
      setAdding(false)
    }
  }

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card-img">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-noimg">
            <IconBox width={36} height={36} />
          </div>
        )}
        {product.stock === 0 && <span className="product-card-badge-out">Stok Yok</span>}
      </div>
      <div className="product-card-body">
        {product.category && (
          <span className="product-card-cat">{product.category.name}</span>
        )}
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-footer">
          <span className="product-card-price">{Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
          <button
            className={`btn btn-sm ${added ? 'btn-success' : 'btn-primary'}`}
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            title="Sepete Ekle"
          >
            <IconShoppingCart width={14} height={14} />
          </button>
        </div>
      </div>
    </Link>
  )
}
