# 🛍️ Django E-Ticaret REST API

> Django REST Framework ile geliştirilmiş, saf REST API mimarisine sahip bir e-ticaret backend sistemi.

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2.3-092E20?style=flat-square&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.16.1-red?style=flat-square)
![License](https://img.shields.io/badge/Lisans-MIT-green?style=flat-square)

---

## 📋 İçindekiler

| Bölüm | Açıklama |
|---|---|
| [🎯 Problem](#-problem) | Projenin çözmeyi hedeflediği problem |
| [🛠 Teknolojiler](#-teknolojiler) | Kullanılan kütüphane ve araçlar |
| [📦 Kurulum](#-kurulum) | Yerel geliştirme ortamı kurulumu |
| [✨ Özellikler](#-özellikler) | Sistemin sunduğu tüm özellikler |
| [📖 API Dokümantasyonu](#-api-dokümantasyonu) | Swagger & Endpoint referansı |
| [📁 Proje Yapısı](#-proje-yapısı) | Dizin ve dosya ağacı |
| [🔒 Güvenlik](#-güvenlik) | Rate limiting, CORS ve ortam değişkenleri |
| [🚀 Production Deployment](#-production-deployment) | Canlı ortama geçiş rehberi |

---

## 🎯 Problem

Küçük ve orta ölçekli e-ticaret projelerinde, ürün/kategori/sepet/sipariş/ödeme gibi tekrar eden iş
mantığını her seferinde sıfırdan kurmak zaman kaybına yol açar. Bu proje, bu ihtiyaca yönelik olarak
kimlik doğrulama, ürün kataloğu, sepet, sipariş, kupon ve ödeme (iyzico) akışlarını tek bir **REST
API** üzerinden sunan, herhangi bir istemciye (web, mobil, üçüncü parti entegrasyon) bağımsız olarak
bağlanabilecek bir backend sağlar. Proje kasıtlı olarak sadece API katmanına odaklanır; bir arayüz
(frontend) veya yönetim paneli (admin) içermez — tüketen taraf istediği istemciyi kendisi geliştirir.

---

## 🛠 Teknolojiler

| Kategori | Paket | Versiyon |
|---|---|---|
| **Web Framework** | Django | 5.2.3 |
| **REST API** | Django REST Framework | 3.16.1 |
| **Authentication** | djangorestframework-simplejwt | 5.5.1 |
| **API Docs** | drf-spectacular | 0.29.0 |
| **Filtreleme** | django-filter | 25.2 |
| **Ödeme** | iyzipay | 1.0.46 |
| **API Key** | djangorestframework-api-key | 2.3.0 |
| **CORS** | django-cors-headers | 4.9.0 |
| **Görsel** | Pillow | 12.1.1 |
| **Veritabanı** | SQLite3 *(dev)* / PostgreSQL *(prod)* | — |

---

## 📦 Kurulum

### Ön Gereksinimler

- Python **3.10** veya üzeri
- `pip` paket yöneticisi
- Virtual environment (önerilir)

### Adım Adım Kurulum

**1. Projeyi klonlayın**
```bash
git clone <repository-url>
cd e-ticaret-api
```

**2. Virtual environment oluşturun ve aktive edin**
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

**3. Bağımlılıkları yükleyin**
```bash
pip install -r requirements.txt
```

**4. Veritabanı migrasyonlarını uygulayın**
```bash
python manage.py makemigrations
python manage.py migrate
```

**5. Static dosyaları toplayın**
```bash
python manage.py collectstatic --noinput
```

**6. Sunucuyu başlatın**
```bash
python manage.py runserver
```

Uygulama `http://127.0.0.1:8000/` adresinde çalışacaktır.

---

## ✨ Özellikler

<table>
<tr>
<td>

**🔐 Kimlik Doğrulama**
- JWT (Access + Refresh token)
- Access token: 1 saat
- Refresh token: 7 gün
- Rol bazlı yetkilendirme (Admin / User)
- API Key authentication

</td>
<td>

**🛒 Alışveriş**
- Ürün katalog yönetimi (CRUD)
- Kategori bazlı filtreleme
- Gelişmiş arama & sıralama
- Ürün görselleri yönetimi
- Sepet & sipariş sistemi
- İndirim kuponu desteği

</td>
</tr>
<tr>
<td>

**💳 Ödeme**
- İyzico entegrasyonu
- Güvenli ödeme akışı
- Sandbox & production modu

</td>
<td>

**🚀 Performans & Güvenlik**
- Rate limiting & throttling
- CORS yapılandırması
- Sayfalama (pagination)
- Detaylı loglama sistemi
- Özel hata yönetimi

</td>
</tr>
<tr>
<td colspan="2">

**📚 Dokümantasyon**
- Swagger UI & ReDoc entegrasyonu
- OpenAPI 3.0 otomatik schema

</td>
</tr>
</table>

---

## 📖 API Dokümantasyonu

| Arayüz | URL |
|---|---|
| **Swagger UI** | `/api/docs` |
| **ReDoc** | `/api/redoc` |
| **OpenAPI Schema** | `/api/schema` |

### Endpoint Referansı

#### Ürünler

| Metod | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| `GET` | `/api/products/` | Herkese açık | Ürün listesi (filtre + arama) |
| `GET` | `/api/products/{slug}/` | Herkese açık | Ürün detayı |
| `POST` | `/api/products/admin/create/` | Yönetici rolü | Ürün oluşturma |
| `PUT` | `/api/products/admin/{id}/` | Yönetici rolü | Ürün güncelleme |
| `DELETE` | `/api/products/admin/{id}/` | Yönetici rolü | Ürün silme |
| `POST` | `/api/products/admin/{id}/images/` | Yönetici rolü | Görsel yükleme |

#### Sepet

| Metod | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| `GET` | `/api/cards/` | Kullanıcı | Sepeti görüntüle |
| `POST` | `/api/cards/add/` | Kullanıcı | Sepete ürün ekle |
| `PUT` | `/api/cards/items/{item_id}/` | Kullanıcı | Ürün miktarını güncelle |
| `DELETE` | `/api/cards/items/{item_id}/` | Kullanıcı | Ürünü sepetten çıkar |

#### Siparişler

| Metod | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| `GET` | `/api/orders/` | Kullanıcı | Siparişleri listele |
| `POST` | `/api/orders/create/` | Kullanıcı | Sipariş oluştur |
| `GET` | `/api/orders/{id}/` | Kullanıcı | Sipariş detayı |

#### Yorumlar

| Metod | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| `GET` | `/api/comments/` | Herkese açık | Yorumları listele |
| `POST` | `/api/comments/create/` | Kullanıcı | Yorum ekle |
| `DELETE` | `/api/comments/{id}/` | Kullanıcı / Yönetici rolü | Yorum sil |

> Rol bazlı yetkilendirme, JWT token içindeki kullanıcı rolüne göre yapılır; ayrı bir yönetim paneli
> (Django admin) bulunmaz.

---

## 📁 Proje Yapısı

```
e-ticaret-api/
├── 📁 app/                      # Ana proje ayarları
│   ├── settings.py              # Django ayarları
│   ├── urls.py                  # Ana URL yapılandırması
│   ├── throttles.py             # Rate limiting ayarları
│   └── wsgi.py                  # WSGI yapılandırması
│
├── 📁 users/                    # Kullanıcı yönetimi
├── 📁 products/                 # Ürün yönetimi
├── 📁 categories/               # Kategori yönetimi
├── 📁 cards/                    # Sepet yönetimi
├── 📁 orders/                   # Sipariş yönetimi
├── 📁 comments/                 # Yorum sistemi
├── 📁 addresses/                # Adres yönetimi
├── 📁 coupons/                  # Kupon sistemi
├── 📁 payments/                 # Ödeme sistemi
│
├── 📁 core/                     # Ortak araçlar
│   ├── paginations.py           # Sayfalama ayarları
│   ├── permissions.py           # Özel izin sınıfları
│   ├── exceptions.py            # Özel hata yönetimi
│   └── utils.py                 # Yardımcı fonksiyonlar
│
├── 📁 media/product_images/     # Yüklenen ürün görselleri
├── 📁 staticfiles/              # Static dosyalar
├── 📁 logs/django.log           # Uygulama logları
│
├── db.sqlite3                   # SQLite veritabanı
├── manage.py                    # Django yönetim komutları
├── requirements.txt             # Python bağımlılıkları
└── README.md                    # Bu dosya
```

Her uygulama klasörü standart olarak şu dosyaları içerir:
`models.py` · `serializers.py` · `views.py` · `urls.py` · `services.py`

---

## 🔒 Güvenlik

### Rate Limiting

| Kullanıcı Tipi | Min. İstek / Gün | Maks. İstek / Gün |
|---|---|---|
| Anonim | 25 | 50 |
| Kimlikli | 50 | 100 |

### CORS

Geliştirme ortamında tüm origin'lere izin verilir. Production için:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]
```

### Ortam Değişkenleri

```python
# settings.py — production ayarları
DEBUG = False
SECRET_KEY = "production-secret-key"
ALLOWED_HOSTS = ["yourdomain.com"]

IYZICO_API_KEY    = "your-production-api-key"
IYZICO_SECRET_KEY = "your-production-secret-key"
IYZICO_BASE_URL   = "api.iyzipay.com"
```

### Loglama

Loglar `logs/django.log` dosyasında saklanır:

| Seviye | Açıklama |
|---|---|
| `INFO` | Genel bilgi mesajları |
| `WARNING` | Uyarılar |
| `ERROR` | Hatalar |
| `CRITICAL` | Kritik hatalar |

---

## 🧪 Test

```bash
# Tüm testleri çalıştır
python manage.py test

# Belirli bir uygulama için
python manage.py test products
```

---

## 🚀 Production Deployment

```python
# 1. Debug modunu kapat
DEBUG = False

# 2. Güçlü secret key üret
import secrets
SECRET_KEY = secrets.token_urlsafe(50)

# 3. PostgreSQL yapılandır
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "your_db_name",
        "USER": "your_db_user",
        "PASSWORD": "your_db_password",
        "HOST": "localhost",
        "PORT": "5432",
    }
}

# 4. HTTPS güvenlik ayarları
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

```bash
# 5. Static dosyaları topla
python manage.py collectstatic
```

---

## 🤝 Katkıda Bulunma

1. Bu repoyu **fork** yapın
2. Yeni bir feature branch oluşturun: `git checkout -b feature/amazing-feature`
3. Değişikliklerinizi commit edin: `git commit -m 'feat: add amazing feature'`
4. Branch'inizi push edin: `git push origin feature/amazing-feature`
5. **Pull Request** açın

---

## 📞 İletişim & Lisans

📧 [batuhanyilmaz0011@gmail.com](mailto:batuhanyilmaz0011@gmail.com)

Bu proje **MIT lisansı** altında lisanslanmıştır.
