import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-top-inner">
          <div className="footer-brand">
            <span className="footer-logo">ShopApp</span>
            <p className="footer-tagline">Alışverişin en kolay yolu.</p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <p className="footer-col-title">Mağaza</p>
              <Link to="/products">Tüm Ürünler</Link>
              <Link to="/cart">Sepet</Link>
              <Link to="/orders">Siparişlerim</Link>
            </div>
            <div className="footer-col">
              <p className="footer-col-title">Hesap</p>
              <Link to="/profile">Profilim</Link>
              <Link to="/addresses">Adreslerim</Link>
              <Link to="/login">Giriş Yap</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copy">© {new Date().getFullYear()} ShopApp</p>
          <p className="footer-copy">Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
