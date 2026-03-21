import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../../api/products'
import { getCategories } from '../../api/categories'
import ProductCard from '../../components/products/ProductCard'
import Spinner from '../../components/ui/Spinner'
import { IconTruck, IconShield, IconRefreshCw, IconPhone, IconArrowRight } from '../../components/ui/Icons'
import './HomePage.css'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          getProducts({ page: 1 }),
          getCategories(),
        ])
        setProducts(prodRes.data.results || prodRes.data || [])
        setCategories(catRes.data.results || catRes.data || [])
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="home">

      {/* ─── Hero — Full Screen Split ─────────────────── */}
      <section className="hero-split">

        {/* Left — big panel */}
        <div className="hero-panel hero-panel-left">
          <img
            className="hero-panel-img"
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80&fit=crop&crop=top"
            alt="hero-left"
          />
          <div className="hero-panel-overlay" />
          <div className="hero-panel-content hero-panel-content-bottom">
            <p className="hero-label">Yeni Sezon</p>
            <h1 className="hero-heading">Stili<br />Keşfet.</h1>
            <Link to="/products" className="btn btn-primary">Alışverişe Başla</Link>
          </div>
        </div>

        {/* Right — two stacked panels */}
        <div className="hero-panels-right">

          <div className="hero-panel hero-panel-sm">
            <img
              className="hero-panel-img"
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80&fit=crop&crop=top"
              alt="hero-right-top"
            />
            <div className="hero-panel-overlay" />
            <div className="hero-panel-content hero-panel-content-center">
              <Link to="/products" className="btn btn-secondary">Koleksiyonu Gör</Link>
            </div>
          </div>

          <div className="hero-panel hero-panel-sm">
            <img
              className="hero-panel-img"
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&q=80&fit=crop&crop=top"
              alt="hero-right-bottom"
            />
            <div className="hero-panel-overlay" />
            <div className="hero-panel-content hero-panel-content-bottom">
              <p className="hero-label">Özel Fırsatlar</p>
              <h2 className="hero-heading-sm">Trendleri<br />Yakala.</h2>
              <Link to="/register" className="btn btn-secondary">Üye Ol</Link>
            </div>
          </div>

        </div>
      </section>

      {/* ─── Features strip ────────────────────────────── */}
      <section className="features-strip">
        <div className="container features-strip-inner">
          {[
            { icon: IconTruck, text: 'Hızlı Teslimat' },
            { icon: IconShield, text: 'Güvenli Ödeme' },
            { icon: IconRefreshCw, text: 'Kolay İade' },
            { icon: IconPhone, text: '7/24 Destek' },
          ].map((f) => {
            const Icon = f.icon
            return (
              <div key={f.text} className="feature-strip-item">
                <Icon width={18} height={18} />
                <span>{f.text}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── Categories ────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Kategoriler</h2>
              <Link to="/products" className="section-link">
                Tümünü Gör <IconArrowRight width={14} height={14} />
              </Link>
            </div>
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/products?category=${cat.id}`} className="cat-card">
                  <span className="cat-name">{cat.name}</span>
                  <IconArrowRight width={14} height={14} className="cat-arrow" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Featured Products ──────────────────────────── */}
      <section className="home-section home-section-dark">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Öne Çıkan Ürünler</h2>
            <Link to="/products" className="section-link">
              Tümünü Gör <IconArrowRight width={14} height={14} />
            </Link>
          </div>
          {loading ? (
            <Spinner fullPage />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">Henüz ürün yok</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA Banner ────────────────────────────────── */}
      <section className="cta-banner">
        <div className="container cta-inner">
          <div>
            <h2 className="cta-title">Özel Tekliflerden Haberdar Ol</h2>
            <p className="cta-desc">Ücretsiz üye ol, fırsatları kaçırma.</p>
          </div>
          <Link to="/register" className="btn btn-primary btn-lg">
            Hemen Üye Ol
          </Link>
        </div>
      </section>
    </div>
  )
}
