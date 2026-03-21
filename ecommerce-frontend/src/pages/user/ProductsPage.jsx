import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../../api/products'
import { getCategories } from '../../api/categories'
import ProductCard from '../../components/products/ProductCard'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import './ProductsPage.css'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const currentPage = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const priceMin = searchParams.get('price__gte') || ''
  const priceMax = searchParams.get('price__lte') || ''
  const ordering = searchParams.get('ordering') || ''

  const [searchInput, setSearchInput] = useState(search)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: currentPage }
      if (search) params.search = search
      if (category) params.category = category
      if (priceMin) params.price__gte = priceMin
      if (priceMax) params.price__lte = priceMax
      if (ordering) params.ordering = ordering

      const res = await getProducts(params)
      const data = res.data
      setProducts(data.results || data || [])
      if (data.count) {
        setTotalPages(Math.ceil(data.count / 5))
      }
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, category, priceMin, priceMax, ordering])

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.results || r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateParam('search', searchInput)
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams({})
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Ürünler</h1>
          {(search || category || priceMin || priceMax) && (
            <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Filtreleri Temizle</button>
          )}
        </div>

        <div className="products-layout">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar card">
            <h3 className="filter-title">Filtrele</h3>

            <form onSubmit={handleSearch} className="filter-section">
              <label className="form-label">Arama</label>
              <div className="search-row">
                <input
                  className="form-input"
                  placeholder="Ürün ara..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">Ara</button>
              </div>
            </form>

            <div className="filter-section">
              <label className="form-label">Kategori</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => updateParam('category', e.target.value)}
              >
                <option value="">Tümü</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug || c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-section">
              <label className="form-label">Fiyat Aralığı</label>
              <div className="price-range">
                <input
                  className="form-input"
                  type="number"
                  placeholder="Min ₺"
                  value={priceMin}
                  onChange={(e) => updateParam('price__gte', e.target.value)}
                  min="0"
                />
                <span>—</span>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Max ₺"
                  value={priceMax}
                  onChange={(e) => updateParam('price__lte', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="filter-section">
              <label className="form-label">Sıralama</label>
              <select
                className="form-select"
                value={ordering}
                onChange={(e) => updateParam('ordering', e.target.value)}
              >
                <option value="">Varsayılan</option>
                <option value="price">Fiyat: Düşükten Yükseğe</option>
                <option value="-price">Fiyat: Yüksekten Düşüğe</option>
                <option value="name">İsim: A-Z</option>
                <option value="-name">İsim: Z-A</option>
              </select>
            </div>
          </aside>

          {/* Products */}
          <div className="products-main">
            {loading ? (
              <Spinner fullPage />
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p className="empty-title">Ürün bulunamadı</p>
                <p className="empty-desc">Filtrelerinizi değiştirmeyi deneyin.</p>
                <button className="btn btn-primary" onClick={clearFilters}>Filtreleri Temizle</button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    const next = new URLSearchParams(searchParams)
                    next.set('page', p)
                    setSearchParams(next)
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
