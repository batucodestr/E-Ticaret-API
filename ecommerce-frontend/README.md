# E-Commerce Frontend

Django e-ticaret API'si için React + Vite ile geliştirilmiş modern arayüz.

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini aç.

## API URL Ayarı

`.env` dosyasını düzenle:

```
VITE_API_BASE_URL=http://localhost:8000
```

Canlı ortam için:
```
VITE_API_BASE_URL=https://batuhanyilmaz1.pythonanywhere.com
```

## Özellikler

### Kullanıcı Tarafı
- Ana sayfa (hero, kategoriler, öne çıkan ürünler)
- Ürün listesi (filtre, arama, sayfalama)
- Ürün detay (görseller, yorum & puan sistemi)
- Alışveriş sepeti
- Sipariş tamamlama (adres seçimi, kupon kodu)
- Sipariş geçmişi ve sipariş detay
- Adres yönetimi
- Profil sayfası

### Admin Paneli (`/admin`)
- Gösterge paneli (istatistikler, son siparişler)
- Ürün yönetimi (CRUD + görsel yükleme)
- Kategori yönetimi (CRUD)
- Sipariş yönetimi (durum güncelleme)
- Kullanıcı yönetimi (rol değiştirme)
- Yorum moderasyonu (yayınla/gizle)
- Kupon yönetimi (CRUD)

## Klasörü Taşıma

Bu klasör tamamen bağımsızdır. Başka bir konuma taşıdığında:
1. `npm install` çalıştır
2. `.env` dosyasında API URL'ini güncelle
3. `npm run dev` ile başlat

## Build

```bash
npm run build
```

`dist/` klasörü herhangi bir statik sunucuya deploy edilebilir.
