# 🍔 My Menu

🇹🇷 Türkçe | [🇬🇧 English](README.en.md)

QR tabanlı masadan sipariş uygulaması. Müşteri menüden siparişini oluşturur ve masa numarasını girer. Uygulama siparişe ait bir **QR kod** üretir; garson bu QR'ı okutup siparişi onaylar. Kiosk deneyiminin masaya taşınmış hali.

> 🚧 **Geliştirme aşamasında.** Şu an backend API'si yazılıyor. Web arayüzü ve mobil uygulama sonraki fazlarda gelecek. Ayrıntılı plan için [ROADMAP.md](ROADMAP.md) dosyasına bakın.

## İçindekiler

- [Teknolojiler](#teknolojiler)
- [Mimari](#mimari)
- [Kurulum](#kurulum)
- [API](#api)
- [Testler ve kod kalitesi](#testler-ve-kod-kalitesi)
- [Proje durumu](#proje-durumu)
- [Dokümanlar](#dokümanlar)
- [Lisans](#lisans)

## Teknolojiler

| Katman         | Teknoloji                                                   |
| -------------- | ----------------------------------------------------------- |
| Çalışma ortamı | Node.js (ESM, JavaScript)                                   |
| Backend        | [Fastify 5](https://fastify.dev/) + JSON Schema validasyonu |
| Veritabanı     | PostgreSQL 17                                               |
| ORM            | Prisma 7 (`@prisma/adapter-pg` driver adapter)              |
| Altyapı        | Docker Compose (PostgreSQL, Adminer, API)                   |
| Test           | Node.js dahili test çalıştırıcısı (`node --test`)           |
| Kod kalitesi   | ESLint + `eslint-plugin-boundaries`, Prettier               |
| Web (planlı)   | React + Vite                                                |
| Mobil (planlı) | React Native                                                |

## Mimari

Proje bir **modüler monolit** olarak tasarlandı. Tek bir uygulama olarak çalışır ama içeride birbirinden yalıtılmış modüllere ayrılır. Her modül kendi katmanlarına sahiptir:

```
apps/api/src/
├── modules/
│   ├── menu/            # Kategoriler ve ürünler
│   ├── table/           # Masalar ve masa doğrulama
│   ├── ordering/        # Siparişler (Faz 5)
│   └── identity/        # Personel girişi ve roller (Faz 10)
│       ├── domain/          # Entity'ler ve iş kuralları, framework/ORM bilmez
│       ├── application/     # Use case'ler + repository sözleşmeleri
│       ├── infrastructure/  # Prisma ve in-memory repository'ler
│       ├── presentation/    # Fastify route'ları ve şemaları
│       └── index.js         # Modülün dışarıya açık tek kapısı (public API)
├── shared/              # config, database, errors, http, health
├── container.js         # Dependency Injection (composition root)
├── app.js               # Fastify uygulamasını kurar
└── server.js            # Sunucuyu başlatır
```

Temel kurallar:

- Bir modül başka bir modülün iç klasörlerine import yapamaz, yalnızca `index.js` üzerinden erişir. Bu kural ESLint (`eslint-plugin-boundaries`) ile otomatik denetlenir.
- Bağımlılık yönü içe doğrudur: `presentation → application → domain`.
- Prisma yalnızca `infrastructure/` ve `shared/database/` içinde kullanılır. Use case'ler ORM'i tanımaz; bu sayede testlerde in-memory repository kullanılabilir.

Monorepo yapısı npm workspaces ile kuruldu:

```
apps/api/          # Backend API
packages/shared/   # Uygulamalar arası paylaşılan kod
docs/              # ADR'ler ve domain dokümanları
```

## Kurulum

### Gereksinimler

- [Node.js](https://nodejs.org/) (güncel sürüm; `--env-file` ve `--watch` desteği gerekir)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Projeyi indirin ve bağımlılıkları kurun

```bash
git clone https://github.com/AEVYEN/QR_Restuarant_Automation_App.git
cd QR_Restuarant_Automation_App
npm install
```

### 2. Ortam değişkenlerini ayarlayın

```bash
cp .env.example .env
```

`.env` dosyasında `POSTGRES_PASSWORD` değerini değiştirin ve `DATABASE_URL`'i aynı bilgilerle doldurun:

```env
DATABASE_URL=postgresql://mymenu:SIFRENIZ@localhost:5432/mymenu_dev
```

| Değişken               | Açıklama                                 | Varsayılan    |
| ---------------------- | ---------------------------------------- | ------------- |
| `DATABASE_URL`         | PostgreSQL bağlantı adresi (**zorunlu**) | —             |
| `PORT`                 | API'nin dinleyeceği port                 | `3000`        |
| `NODE_ENV`             | `development`, `production` veya `test`  | `development` |
| `LOG_LEVEL`            | `fatal` … `trace`                        | `info`        |
| `ORDER_EXPIRY_MINUTES` | Onaylanmayan siparişin geçerlilik süresi | `15`          |

Değişkenler uygulama açılırken `env-schema` ile doğrulanır. Eksik veya hatalı bir değer varsa uygulama hiç başlamaz.

### 3. Veritabanını başlatın

```bash
docker compose up -d db adminer
```

Adminer arayüzü üzerinden veritabanına göz atabilirsiniz: <http://localhost:8080>

### 4. Prisma istemcisini üretin, tabloları oluşturun ve örnek veriyi yükleyin

```bash
cd apps/api
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
cd ../..
```

Seed verisi örnek bir menü (Burgerler, Salatalar, İçecekler, Tatlılar) ve 1–20 arası masaları ekler. Fiyatlar **kuruş** cinsinden saklanır (`28000` = 280,00 ₺).

### 5. API'yi çalıştırın

```bash
npm run dev --workspace=@my-menu/api
```

API, `.env` dosyasındaki `PORT` üzerinde açılır. Kontrol etmek için:

```bash
curl http://localhost:3000/health
```

### Alternatif: Her şeyi Docker ile çalıştırma

```bash
docker compose up -d --build
```

Bu komut veritabanını, Adminer'ı ve API'yi birlikte başlatır. Docker'daki API **4000** portundan yayın yapar: <http://localhost:4000/health>. Container migration çalıştırmaz, bu yüzden 4. adımı bir kez host üzerinden çalıştırmanız gerekir.

## API

Tüm iş endpoint'leri `/api/v1` önekiyle sunulur. `/health` altyapı ucu olduğu için versiyonsuzdur.

| Method | Path                              | Açıklama                                                                              |
| ------ | --------------------------------- | ------------------------------------------------------------------------------------- |
| GET    | `/health`                         | API ve veritabanı bağlantısının durumu                                                |
| GET    | `/api/v1/menu`                    | Aktif kategorilere göre gruplanmış ürünler (tükenenler dahil, `isAvailable` alanıyla) |
| GET    | `/api/v1/tables/:number/validate` | Masanın var ve aktif olup olmadığını kontrol eder                                     |

### Yanıt formatı

Tüm yanıtlar aynı zarf (envelope) yapısını kullanır.

Başarılı yanıt:

```json
{ "data": { "number": 5 } }
```

Hatalı yanıt:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Kaynak bulunamadı"
  }
}
```

Hata kodları: `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `SERVICE_UNAVAILABLE` (503), `INTERNAL_ERROR` (500). Validasyon hatalarında `details` alanı hangi alanın neden reddedildiğini gösterir.

## Testler ve kod kalitesi

```bash
npm test               # Tüm workspace'lerin testleri
npm run lint           # ESLint (modül sınırı kuralları dahil)
npm run format:check   # Prettier kontrolü
npm run format         # Prettier ile biçimlendir
```

Unit testler use case'leri ve entity'leri veritabanı olmadan, in-memory repository'lerle test eder.

## Proje durumu

| Faz | Başlık                      | Durum |
| --- | --------------------------- | ----- |
| 0   | Kararlar & Proje Kurulumu   | ✅    |
| 1   | Domain Modelleme            | ✅    |
| 2   | Backend İskeleti            | ✅    |
| 3   | Menu Modülü                 | ✅    |
| 4   | Table Modülü                | 🚧    |
| 5   | Ordering Modülü             | ⏳    |
| 6   | QR Akışı                    | ⏳    |
| 7–9 | Web: Müşteri, Garson, Admin | ⏳    |
| 10  | Kimlik Doğrulama & Yetki    | ⏳    |
| 11  | Test & Kalite               | ⏳    |
| 12  | Güvenlik & Deployment       | ⏳    |
| 13  | Mobil (React Native)        | ⏳    |

Tüm fazların ayrıntıları için [ROADMAP.md](ROADMAP.md) dosyasına bakın.

## Dokümanlar

- [ROADMAP.md](ROADMAP.md): Fazlar, görevler ve verilen kararlar
- [docs/adr/](docs/adr/): Mimari karar kayıtları (veritabanı, backend framework, monorepo yapısı)
- [docs/domain/business-rules.md](docs/domain/business-rules.md): Sipariş iş kuralları
- [docs/domain/order-status-machine.md](docs/domain/order-status-machine.md): Sipariş durum makinesi

## Lisans

[MIT](LICENSE)
