# 🍔 My Menu — Geliştirme Roadmap'i

> **Proje özeti:** Müşteri, restoranın menüsünden (yiyecek, içecek, salata vb.) kendi siparişini oluşturur, masa numarasını girer, uygulama siparişe ait bir **QR kod** üretir. Garson bu QR'ı okutur, siparişi görür ve onaylar. (McDonald's kiosk deneyiminin masaya taşınmış hali.)
>
> **Önce web, sonra mobil (React Native).**

---

## 📌 Çalışma Kuralları

| Kural           | Açıklama                                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| 🧭 Rol dağılımı | Kodu **sen** yazacaksın. Claude yol gösterecek, tasarımı tartışacak, kod incelemesi (code review) yapacak. |
| 🏛️ Mimari       | **Modüler Monolit** (Modular Monolith)                                                                     |
| 🧱 Prensipler   | **SOLID**, katmanlı modül yapısı, bağımlılıkların tersine çevrilmesi                                       |
| 🔤 İsimlendirme | Tüm değişken, fonksiyon, sınıf, dosya, tablo ve kolon isimleri **İngilizce**                               |
| 🐳 Docker       | Geliştirme ortamında veritabanı + backend için `docker-compose`, canlıya çıkışta Dockerfile                |
| 🗄️ Veritabanı   | **PostgreSQL** (ADR-001)                                                                                   |
| 🔄 Esneklik     | Roadmap canlı bir dokümandır; ihtiyaca göre faz ekleyip çıkaracağız                                        |

---

## ✅ Verilen Kararlar

| #   | Konu              | Karar                                                                                                                                                                                                                         | Gerekçe (kısa)                                                                                                                      |
| --- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Proje adı         | **My Menu**                                                                                                                                                                                                                   | —                                                                                                                                   |
| 2   | QR içeriği        | **Sadece sipariş kodu**                                                                                                                                                                                                       | Küçük QR, sipariş sunucuda güvende, fiyat manipülasyonu yok                                                                         |
| 3   | Sipariş saklama   | **Kısa ömürlü siparişler**: onaylanmayanlar varsayılan 15 dk'da (`ORDER_EXPIRY_MINUTES`) `EXPIRED` olur, tüm siparişler belirli bir süre sonra (ör. gün sonu / birkaç gün) otomatik silinir. Sipariş geçmişi ve raporlama yok | Bu bir e-ticaret sitesi değil; müşteri fişi restorandan alır                                                                        |
| 4   | Web frontend      | **React + Vite**                                                                                                                                                                                                              | React Native ile aynı zihinsel model ve paylaşılabilir mantık; Vite sade ve hızlı                                                   |
| 5   | Veritabanı        | **PostgreSQL**                                                                                                                                                                                                                | İlişkisel menü verisi, foreign key bütünlüğü, transaction, Docker ile kolay kurulum                                                 |
| 6   | Backend framework | **Fastify**                                                                                                                                                                                                                   | Modern, hızlı; dahili JSON Schema validasyonu; plugin sistemi modüler monolite iyi oturuyor                                         |
| 7   | ORM               | **Prisma** (ileride Knex'e geçiş ihtimali açık)                                                                                                                                                                               | Tek şema dosyası, otomatik migration, kolay başlangıç. Repository pattern sayesinde geçiş sadece `infrastructure` katmanını etkiler |

**Bekleyen kararlar:** Kimlik doğrulama yöntemi (JWT / session) — Faz 10'da.

> 🔁 **Prisma → Knex geçişine hazırlık:** Prisma sadece `modules/*/infrastructure/` içinde ve `shared/database/` içinde import edilebilir. Use case'ler Prisma'nın döndürdüğü nesneleri değil, kendi domain entity'lerini kullanır (repository içinde dönüştürme / mapping yapılır). Geçiş günü migration'ların da Knex'e taşınması gerekeceğini unutma.

---

## 🗺️ Fazlara Genel Bakış

| Faz | Başlık                    | Çıktı                                        |
| --- | ------------------------- | -------------------------------------------- |
| 0   | Kararlar & Proje Kurulumu | Teknoloji seçimleri, repo, Docker, ADR'ler   |
| 1   | Domain Modelleme          | Varlıklar, ilişkiler, sipariş durum makinesi |
| 2   | Backend İskeleti          | Modüler monolit klasör yapısı, ortak altyapı |
| 3   | Menu Modülü               | Kategori & ürün API'leri                     |
| 4   | Table Modülü              | Masa yönetimi                                |
| 5   | Ordering Modülü           | Sipariş oluşturma, fiyat hesaplama, durumlar |
| 6   | QR Akışı                  | Sipariş kodu → QR → garson okutma            |
| 7   | Web — Müşteri Arayüzü     | Menü, sepet, masa no, QR ekranı              |
| 8   | Web — Garson Paneli       | QR okutma, sipariş onaylama                  |
| 9   | Web — Admin Paneli        | Menü & masa yönetimi                         |
| 10  | Kimlik Doğrulama & Yetki  | Personel girişi, roller                      |
| 11  | Test & Kalite             | Unit / integration / e2e testler             |
| 12  | Güvenlik & Deployment     | Güvenlik ayarları, Docker image, canlı ortam |
| 13  | Mobil (React Native)      | Aynı backend'i kullanan mobil uygulama       |
| 14  | İyileştirmeler            | Gerçek zamanlı bildirim, ödeme, çoklu dil... |

---

## Faz 0 — Kararlar & Proje Kurulumu

**Amaç:** Kod yazmaya başlamadan önce temel kararları netleştirmek ve kaydetmek.

### 0.1 Birlikte vereceğimiz kararlar

#### 🗄️ Veritabanı seçimi

| Seçenek             | Artıları                                                                                             | Eksileri                                                                          | Bu proje için uygunluk |
| ------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------- |
| **PostgreSQL**      | İlişkisel veri için ideal, transaction desteği güçlü, JSONB ile esneklik, ücretsiz, Docker ile kolay | Şema değişiklikleri migration gerektirir                                          | ⭐⭐⭐⭐⭐             |
| **MySQL / MariaDB** | Yaygın, hosting'i kolay, ilişkisel                                                                   | JSON ve gelişmiş özelliklerde Postgres'in gerisinde                               | ⭐⭐⭐⭐               |
| **MongoDB**         | Şemasız, hızlı prototip, sipariş belgesi gibi iç içe veriler doğal                                   | Sipariş ↔ ürün ↔ masa ilişkileri ve raporlama zorlaşır, transaction daha karmaşık | ⭐⭐⭐                 |
| **SQLite**          | Kurulum yok, öğrenme için harika                                                                     | Eşzamanlı yazmada sınırlı, canlı ortam için uygun değil                           | ⭐⭐ (sadece prototip) |

> 💡 **Claude'un önerisi: PostgreSQL.** Verimiz doğası gereği ilişkisel (Kategori → Ürün, Sipariş → Sipariş Kalemi → Ürün, Sipariş → Masa). Sipariş oluşturma işlemi **atomik** olmalı (sipariş + kalemleri ya hep birlikte kaydedilir ya hiç). İleride "en çok satan ürün", "günlük ciro" gibi raporlar SQL ile çok kolay olur. Ürün seçenekleri (ör. "acı sos ekle") gibi esnek alanlar için JSONB kullanılabilir.
>
> ➡️ Son karar senin. Konuşalım, sonra ADR-001 olarak yazalım.

#### 🔧 ORM / Sorgu katmanı (veritabanı kararına bağlı)

| Seçenek                  | Not                                                                    |
| ------------------------ | ---------------------------------------------------------------------- |
| **Prisma**               | Şema dosyası + otomatik migration, öğrenmesi kolay, JS ile iyi çalışır |
| **Knex** (query builder) | SQL'e yakın, daha fazla kontrol, migration desteği var                 |
| **Sequelize / TypeORM**  | Klasik ORM yaklaşımı                                                   |
| **Mongoose**             | MongoDB seçilirse                                                      |

> ⚠️ Hangi ORM seçilirse seçilsin, ORM sadece **infrastructure** katmanında yaşamalı. Domain ve application katmanları ORM'i bilmemeli (bkz. SOLID → DIP).

#### ⚙️ Backend framework

| Seçenek     | Not                                                                                 |
| ----------- | ----------------------------------------------------------------------------------- |
| **Express** | En yaygın, minimal; modül yapısını kendin kurarsın → mimariyi öğrenmek için çok iyi |
| **Fastify** | Express'e benzer, daha hızlı, şema tabanlı validasyon dahili                        |
| **NestJS**  | Modüler yapı hazır gelir ama TypeScript ve decorator ağırlıklı                      |

> 💡 Öneri: **Express veya Fastify** ile modüler monoliti **elle** kurmak. Mimariyi gerçekten öğrenirsin.

#### 🎨 Web frontend

| Seçenek          | Not                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------- |
| **React + Vite** | React Native'e geçişte bilgi ve mantık (hook'lar, state yönetimi) birebir aktarılır ✅ |
| Vanilla JS       | Mümkün ama sepet/state yönetimi büyüdükçe zorlaşır                                     |

> 💡 Öneri: **React + Vite**. Mobilde React Native kullanacağın için en mantıklı seçim.

#### 📘 JavaScript mi TypeScript mi?

JavaScript kullanacağını belirttin, buna göre ilerliyoruz. Yalnızca not: TypeScript, SOLID'deki **interface** kavramını doğrudan ifade etmeni sağlar. İstersen ileride geçiş yapabiliriz; JS'de interface'leri JSDoc ile belgeleyeceğiz.

#### 📦 Repo yapısı

**Monorepo** (npm workspaces veya pnpm workspaces) öneriyorum:

```
my-menu/
├── apps/
│   ├── api/            # Backend (modular monolith)
│   ├── web/            # React web uygulaması
│   └── mobile/         # React Native (Faz 13)
├── packages/
│   └── shared/         # Ortak: validasyon şemaları, sabitler, order status enum, API client
├── docker-compose.yml
├── docs/
│   ├── adr/            # Architecture Decision Records
│   └── domain/         # Durum makinesi, iş kuralları
├── ROADMAP.md
└── README.md
```

> Neden? Sipariş durumları (`OrderStatus`), validasyon kuralları ve API client'ı web ile mobil arasında **tek yerden** paylaşılır.

### 0.2 Kurulum görevleri

- [x] Git reposu oluştur, `.gitignore`, `.editorconfig`
- [x] Monorepo workspace yapısını kur
- [x] ESLint + Prettier kur (tek stil kuralı tüm projede)
- [x] `docker-compose.yml` ile veritabanını ayağa kaldır (+ isteğe bağlı pgAdmin / Adminer)
- [x] `.env.example` dosyası oluştur (gizli bilgiler asla repoya girmez)
- [x] `docs/adr/` klasörü ve ilk ADR'ler: veritabanı, framework, repo yapısı
- [x] Commit mesajı standardı: **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`...)

### 0.3 İsimlendirme kuralları

| Öğe                  | Kural             | Örnek                                       |
| -------------------- | ----------------- | ------------------------------------------- |
| Değişken / fonksiyon | camelCase         | `calculateOrderTotal`, `tableNumber`        |
| Sınıf                | PascalCase        | `OrderService`, `ProductRepository`         |
| Sabit                | UPPER_SNAKE_CASE  | `MAX_ITEMS_PER_ORDER`                       |
| Dosya                | kebab-case        | `order.service.js`, `product.repository.js` |
| Veritabanı tablo     | snake_case, çoğul | `orders`, `order_items`                     |
| Veritabanı kolon     | snake_case        | `created_at`, `is_available`                |
| API route            | kebab-case, çoğul | `/api/v1/order-items`                       |
| Boolean              | is/has/can ön eki | `isAvailable`, `hasOptions`                 |

**✅ Bitti kriteri:** `docker compose up` ile veritabanı çalışıyor, repo yapısı hazır, kararlar ADR olarak yazılmış.

---

## Faz 1 — Domain Modelleme

**Amaç:** Kod yazmadan önce iş alanını (domain) anlamak ve modellemek.

### 1.1 Modüller (Bounded Context'ler)

| Modül                            | Sorumluluğu                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `menu`                           | Kategoriler, ürünler, fiyatlar, ürün seçenekleri, stok durumu (`isAvailable`) |
| `table`                          | Restorandaki masalar, masa numaraları, aktif/pasif durumu                     |
| `ordering`                       | Sipariş oluşturma, toplam hesaplama, sipariş durumu yönetimi                  |
| `identity`                       | Personel (garson, admin) girişi, roller                                       |
| `shared` (modül değil, çekirdek) | Hata sınıfları, logger, config, veritabanı bağlantısı, event bus              |

> 🛒 **Sepet (Cart) nerede?** Sepet sunucuya gönderilene kadar **istemci tarafında** (React state + localStorage) yaşar. Backend'de ayrı bir modül olmasına başlangıçta gerek yok.

### 1.2 Varlıklar (ADR-001 ile uyumlu)

```
Category        : id, name, displayOrder, isActive, maxQuantityPerItem
Product         : id, categoryId, name, description, price, imageUrl, isAvailable
ProductOption   : id, productId, name, extraPrice           (ör. "Ekstra peynir +15₺") — ilk sürümde yok, Faz 14'e kaldı
Table           : number (PK), isActive
Order           : id, orderCode, tableNumber, status, note, createdAt, expiresAt, confirmedAt, confirmedBy
OrderItem       : id, orderId, productId, quantity
Staff           : id, fullName, username, passwordHash, role (WAITER | ADMIN)
```

> 🏷️ Alan adları kodda (domain, Prisma modeli) **camelCase**, veritabanında **snake_case** olur (`tableNumber` → `table_number`). Eşleme Prisma'da `@map` / `@@map` ile yapılır. Fiyatlar kuruş cinsinden `int`.

> ⚠️ **Fiyat anlık görüntüsü (snapshot) yok:** `OrderItem` içinde `unitPrice` / `productName` tutulmaz, `Order` içinde de `totalAmount` saklanmaz. Tutar her seferinde ürünün **güncel fiyatından** hesaplanır (bkz. ADR-001). Sonuç: sipariş oluşturulduktan sonra, garson onaylamadan önce admin fiyatı değiştirirse toplam da değişir — siparişler kısa ömürlü olduğu için bu kabul edildi.

### 1.3 Sipariş durum makinesi (Order Status)

```
  PENDING ──(garson QR okutur & onaylar)──► CONFIRMED ┄┄► PREPARING ┄┄► SERVED ┄┄► COMPLETED
     │                                          │            (sonraki sürüm)
     ├──(süre aşımı, varsayılan 15 dk)──► EXPIRED └──(garson iptal)──► CANCELLED
     └──(müşteri iptal)─────────────────► CANCELLED
```

İlk sürümde sadece `PENDING`, `CONFIRMED`, `CANCELLED` ve `EXPIRED` var. Kesikli çizgili durumlar sonraki sürümde eklenecek.

- [x] Hangi geçişlerin geçerli olduğunu bir tabloya yaz (ör. `SERVED → PENDING` geçersiz)
- [x] Başlangıçta sadece `PENDING → CONFIRMED / CANCELLED / EXPIRED` yeterli; diğerleri sonra

> 📄 Detaylar: [docs/domain/order-status-machine.md](docs/domain/order-status-machine.md)

### 1.4 İş kuralları (Business Rules) — yazılı hale getir

> 📄 Detaylar, değerler ve hata mesajları: [docs/domain/business-rules.md](docs/domain/business-rules.md). Kuralların hepsini `ordering` modülü uygular; parantez içinde verinin geldiği modül yazılıdır.

- [x] Sipariş en az 1 ürün içermeli → `ordering`
- [x] Tek bir üründen en fazla `CATEGORY.maxQuantityPerItem` adet sipariş verilebilir (yemekler 10; salatalar, tatlılar ve içecekler 20) → `ordering` (limit `menu`'den)
- [x] `isAvailable = false` olan ürün sipariş edilemez → `ordering` (veri `menu`'den)
- [x] Masa numarası, sistemde kayıtlı ve aktif bir masa olmalı → `ordering` (veri `table`'dan)
- [x] **Toplam tutar her zaman sunucuda hesaplanır** — istemciden gelen fiyata asla güvenilmez → `ordering` (`OrderPriceCalculator`)
- [x] Onaylanmamış sipariş, oluşturulduktan `ORDER_EXPIRY_MINUTES` (varsayılan 15) dakika sonra `EXPIRED` olur; müşteri QR ekranında kalan süreyi görür → `ordering` (`Order` entity)

**✅ Bitti kriteri:** Varlık-ilişki diyagramı, durum makinesi ve iş kuralları `docs/` altında yazılı.

---

## Faz 2 — Backend İskeleti (Modüler Monolit)

**Amaç:** Tüm modüllerin oturacağı iskeleti ve ortak altyapıyı kurmak.

### 2.1 Verilen kararlar

| #   | Konu                   | Karar                                                                                                      | Gerekçe (kısa)                                                                                      |
| --- | ---------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1   | API yanıt formatı      | **Zarflı (envelope):** başarıda `{ data }`, hatada `{ error: { code, message, details } }`                 | Web ve mobil client'ta hata yakalama tek yerde çözülür; `code` makine tarafından okunur             |
| 2   | Health endpoint'i      | **`GET /health`** — versiyonsuz, `/api/v1` dışında                                                         | İş endpoint'i değil altyapı ucu; Docker healthcheck / canlı ortam izleme API versiyonundan bağımsız |
| 3   | Config doğrulama       | **`env-schema`**                                                                                           | Fastify ile aynı JSON Schema dili; Fastify instance'ından önce (`container.js`'de) çalışabilir      |
| 4   | DI'ın modüllere geçişi | **Plugin options:** `app.register(menuRoutes, { getMenuUseCase })`                                         | Bağımlılıklar açıkça görünür, Fastify kapsüllemesi korunur; `app.decorate` ile global'e yayılmaz    |
| 5   | Prisma şeması          | **Faz 2'de model yok**, sadece bağlantı (health için `SELECT 1`). Her modülün modeli kendi fazında eklenir | Fazlar birbirinden bağımsız ilerler; her migration bir modüle ait olur                              |
| 6   | Event bus              | **Faz 5'e ertelendi**                                                                                      | Şu an dinleyecek kimse yok (YAGNI); ilk ihtiyaç `OrderConfirmed`                                    |

### 2.2 Klasör yapısı

```
apps/api/src/
├── modules/
│   ├── menu/
│   │   ├── domain/              # Saf iş mantığı: entity'ler, kurallar. Hiçbir framework/ORM bilmez
│   │   │   ├── product.entity.js
│   │   │   └── category.entity.js
│   │   ├── application/         # Use case'ler / servisler. Repository "sözleşmesine" bağımlı
│   │   │   ├── get-menu.use-case.js
│   │   │   └── product-repository.contract.js   # Interface (JSDoc ile)
│   │   ├── infrastructure/      # ORM, veritabanı erişimi — sözleşmeyi uygular
│   │   │   └── product.repository.js
│   │   ├── presentation/        # HTTP katmanı: route, controller, request validasyonu
│   │   │   ├── menu.routes.js
│   │   │   └── menu.controller.js
│   │   └── index.js             # 🔑 Modülün PUBLIC API'si — dışarıya sadece bu açılır
│   ├── table/
│   ├── ordering/
│   └── identity/
├── shared/
│   ├── errors/                  # AppError, NotFoundError, ValidationError...
│   ├── logger/
│   ├── config/
│   ├── database/
│   └── events/                  # In-process event bus (modüller arası gevşek iletişim) — Faz 5'te eklenecek
├── app.js                       # Fastify instance oluşturma, ortak plugin'ler, modüllerin register edilmesi
├── container.js                 # Dependency Injection: bağımlılıkların birleştirildiği yer (composition root)
└── server.js                    # Uygulamayı başlatır
```

### 2.3 Modüler monolitin altın kuralları

1. **Bir modül başka modülün iç klasörlerine import yapamaz.** Sadece `modules/<name>/index.js` üzerinden erişir.
   - ✅ `import { menuModule } from '../menu/index.js'` (ESM'de klasör import'u çalışmaz, dosya yolu ve uzantı zorunlu — bkz. ADR-003)
   - ❌ `import ProductRepository from '../menu/infrastructure/product.repository.js'`
2. **Bir modül başka modülün tablolarına doğrudan sorgu atmaz.** `ordering` modülü ürün fiyatına ihtiyaç duyarsa `menu` modülünün public API'sinden ister.
3. **Bağımlılık yönü içe doğrudur:** `presentation → application → domain`. `infrastructure`, `application`'daki sözleşmeyi uygular.
4. Modüller arası "bir şey oldu" bildirimi için **event** kullan (ör. `OrderConfirmed` olayı).
5. İleride bir modülü mikroservise ayırmak istersen, bu kurallar sayesinde kolayca ayrılır.
6. **Her modülün HTTP katmanı bir Fastify plugin'i olarak register edilir** (ör. `app.register(menuRoutes, { prefix: '/api/v1' })`). Fastify'ın plugin kapsülleme (encapsulation) mantığını araştır — modül sınırlarını HTTP tarafında da korur.

> 🛠️ Bu kurallar Faz 2'de `eslint-plugin-boundaries` ile otomatik denetlenir (bkz. 2.4).

### 2.4 Görevler

Önerilen sıra; her madde ayrı bir commit:

- [x] Fastify kurulumu, `app.js` (`buildApp()`) / `server.js` (`listen`) ayrımı, `GET /health` (önce DB'siz)
- [x] Merkezi config: env değişkenlerini tek yerden okuma ve `env-schema` ile doğrulama — eksik/hatalı değişkende uygulama **açılırken** çöker. `.env.example`'a `DATABASE_URL`, `PORT`, `LOG_LEVEL`, `NODE_ENV` eklenir
- [x] Logger (Fastify'da `pino` dahili gelir — sadece yapılandır; geliştirmede `pino-pretty`, log seviyesi config'den)
- [x] Merkezi hata yakalama (`setErrorHandler` + `setNotFoundHandler`) + özel hata sınıfları (`AppError`: `statusCode` + `code`). Fastify'ın validasyon hataları da standart formata çevrilir; bilinmeyen hatada iç detay kullanıcıya sızmaz
- [x] Standart API yanıt formatı (bkz. 2.1 #1)
- [x] Request validasyonu: Fastify'ın dahili JSON Schema desteği (route'a `schema` verilir). Web/mobil ile şema paylaşmak istersek `zod` + dönüştürücü değerlendirilebilir
- [x] Prisma kurulumu (model yok — bkz. 2.1 #5): `PrismaClient`'ı `shared/database/` altında tek örnek (singleton) olarak oluşturma, `onClose` hook'unda bağlantıyı kapatma, `SIGINT` / `SIGTERM`'de `app.close()`. `/health` artık DB'yi de kontrol eder
- [x] `container.js` ile basit Dependency Injection (kütüphanesiz, elle başla; gerekirse `awilix`)
- [x] Modül iskeletleri: `menu`, `table`, `ordering`, `identity` klasörleri + boş `index.js`; HTTP plugin'leri `/api/v1` prefix'iyle register edilir
- [x] `eslint-plugin-boundaries` ile modül sınırı kurallarını ESLint'e ekle
- [x] Backend'i de `docker-compose`'a ekle

> ⚠️ **Dikkat edilecekler**
>
> - **Prisma 7:** Kurulum eski sürümlerden farklı (driver adapter `@prisma/adapter-pg`, generator'da zorunlu `output`, `prisma.config` dosyası). Eski tutorial'lar yerine resmi dokümanı takip et.
> - **`DATABASE_URL`:** Host'tan bağlanırken `localhost`, compose içindeki api container'ından bağlanırken servis adı `db`.
> - **Windows → Linux container:** Host'taki `node_modules` container'a mount edilmez (platforma özel binary'ler). Anonim volume ile ayrılır.
> - **npm workspaces + Docker:** Bağımlılıklar köke hoist edilir; Dockerfile kökteki `package.json` ve `package-lock.json`'ı da kopyalamalı.

**✅ Bitti kriteri:** `GET /health` veritabanı bağlantısını da kontrol ederek `200` dönüyor; `docker compose up` ile db + api birlikte ayağa kalkıyor.

---

## 🧱 SOLID — Bu Projede Nasıl Uygulanacak?

| Prensip                       | Bu projedeki karşılığı                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **S** — Single Responsibility | `OrderController` sadece HTTP isteğini alır/yanıtlar. `CreateOrderUseCase` sadece sipariş oluşturur. `OrderRepository` sadece kaydeder/okur. Fiyat hesaplama ayrı bir `OrderPriceCalculator`'da. |
| **O** — Open/Closed           | İleride "happy hour indirimi", "kampanya" eklenecekse `OrderPriceCalculator`'ı değiştirmek yerine yeni bir `DiscountStrategy` eklenir. QR üretimi de bir `CodeGenerator` stratejisi olabilir.    |
| **L** — Liskov Substitution   | `PostgresOrderRepository` ile testte kullanılan `InMemoryOrderRepository` birbirinin yerine sorunsuz geçebilmeli — aynı sözleşmeye, aynı davranışa sahip.                                        |
| **I** — Interface Segregation | Garson paneli sadece `OrderReader` + `OrderStatusUpdater`'a ihtiyaç duyar; tüm admin işlemlerini içeren dev bir arayüze bağımlı olmaz.                                                           |
| **D** — Dependency Inversion  | `CreateOrderUseCase`, Prisma/Knex'i bilmez; constructor'dan bir `orderRepository` alır. Somut sınıf `container.js`'de verilir. Böylece ORM değişirse use case değişmez.                          |

> 🎯 Her modülü yazarken kendine sor: _"Bu sınıfın değişmesi için kaç farklı sebep var?"_ Birden fazlaysa bölmeyi düşün.

---

## Faz 3 — Menu Modülü

**Amaç:** Müşterinin göreceği menüyü sunan ilk gerçek modül. Diğer modüllere şablon olacak.

### Endpoint'ler (taslak)

| Method          | Path                           | Açıklama                                    | Erişim           |
| --------------- | ------------------------------ | ------------------------------------------- | ---------------- |
| GET             | `/api/v1/menu`                 | Kategorilere göre gruplanmış, aktif ürünler | Herkes           |
| GET             | `/api/v1/categories`           | Kategori listesi                            | Herkes           |
| GET             | `/api/v1/products/:id`         | Ürün detayı                                 | Herkes           |
| POST/PUT/DELETE | `/api/v1/admin/categories` ... | Kategori yönetimi                           | Admin (Faz 9–10) |
| POST/PUT/DELETE | `/api/v1/admin/products` ...   | Ürün yönetimi                               | Admin (Faz 9–10) |

### Görevler

- [x] `Category` ve `Product` entity'leri (domain kuralları: fiyat negatif olamaz vb.)
- [ ] Prisma modelleri (`Category`, `Product`) + migration + seed verisi (örnek menü: Burgerler, İçecekler, Salatalar, Tatlılar)
- [ ] Repository sözleşmesi + implementasyonu
- [ ] `GetMenuUseCase`
- [ ] Controller + route + validasyon
- [ ] Modülün `index.js`'inde dışarıya açılacak fonksiyonu tanımla: ör. `getProductsByIds(ids)` → `ordering` modülü bunu kullanacak
- [ ] İlk unit testler (use case, in-memory repository ile)

**✅ Bitti kriteri:** `GET /api/v1/menu` seed verisini kategorilere göre gruplanmış döndürüyor; testler geçiyor.

> 🎨 **Faz 3 bitince web'e başlanır:** `GET /api/v1/menu` hazır olduğu için Faz 7'deki **menü ve sepet sayfaları** bu noktada başlar ve Faz 4–6 ile paralel ilerler. Sepet istemci tarafında yaşadığı için backend'in geri kalanını beklemesi gerekmez. Checkout ve QR ekranı, Faz 5–6 bitince eklenir.

---

## Faz 4 — Table Modülü

- [ ] `Table` entity'si (`number`, `isActive`)
- [ ] Prisma modeli (`Table`) + migration + seed: ör. 1–20 arası masalar
- [ ] `GET /api/v1/tables/:number/validate` → masa var ve aktif mi?
- [ ] Public API: `isTableAvailable(tableNumber)` → `ordering` modülü kullanacak
- [ ] Admin endpoint'leri (masa ekle / pasifleştir) → Faz 9

**✅ Bitti kriteri:** Geçersiz masa numarası anlamlı bir hata mesajıyla reddediliyor.

---

## Faz 5 — Ordering Modülü (Projenin Kalbi ❤️)

### Sipariş oluşturma akışı

```
İstemci → POST /api/v1/orders
  body: { tableNumber, items: [{ productId, quantity }], note }

CreateOrderUseCase:
  1. Masayı doğrula            → table modülünün public API'si
  2. Ürünleri getir            → menu modülünün public API'si (getProductsByIds)
  3. Kuralları uygula          → ürün mevcut mu, adetler geçerli mi
  4. Fiyatı SUNUCUDA hesapla   → OrderPriceCalculator
  5. Benzersiz orderCode üret  → CodeGenerator
  6. Order + OrderItems'ı TEK TRANSACTION'da kaydet
  7. Yanıt: { orderCode, totalAmount, status: "PENDING", expiresAt }
```

### Endpoint'ler (taslak)

| Method | Path                                      | Açıklama                                       | Erişim       |
| ------ | ----------------------------------------- | ---------------------------------------------- | ------------ |
| POST   | `/api/v1/orders`                          | Sipariş oluştur                                | Müşteri      |
| GET    | `/api/v1/orders/:orderCode`               | Sipariş özeti (müşteri kendi siparişini görür) | Müşteri      |
| PATCH  | `/api/v1/orders/:orderCode/cancel`        | Müşteri iptali (sadece PENDING iken)           | Müşteri      |
| GET    | `/api/v1/staff/orders/:orderCode`         | QR okutulunca sipariş detayı                   | Garson       |
| PATCH  | `/api/v1/staff/orders/:orderCode/confirm` | Siparişi onayla                                | Garson       |
| PATCH  | `/api/v1/staff/orders/:orderCode/cancel`  | Onaylanmış siparişi iptal et (ör. ürün bitti)  | Garson       |
| GET    | `/api/v1/staff/orders?status=CONFIRMED`   | Sipariş listesi                                | Garson/Admin |

### Görevler

- [ ] Prisma modelleri (`Order`, `OrderItem`) + migration. `Order.confirmedBy` → `Staff` FK'si nedeniyle **`Staff` modeli de bu fazda oluşturulur** (+ seed'de bir test garsonu); giriş/şifre işleri Faz 10'da
- [ ] `Order` aggregate'i: kalem ekleme, durum geçişleri domain içinde (`order.confirm(staffId)` gibi metodlar; geçersiz geçişte hata — bkz. [order-status-machine.md](docs/domain/order-status-machine.md))
- [ ] `OrderPriceCalculator` (ayrı sınıf → SRP + OCP)
- [ ] `CodeGenerator`: tahmin edilemeyen kısa kod (ör. `nanoid`, 8–10 karakter, karışması kolay karakterler hariç: `0/O`, `1/I/l`)
- [ ] Transaction yönetimi (Unit of Work fikrini araştır)
- [ ] Süresi dolan siparişleri `EXPIRED` yapma (başlangıçta: okunurken kontrol; sonra: zamanlanmış iş)
- [ ] Eski siparişleri otomatik silen temizlik işi (cleanup job) — saklama süresi config'den okunsun (ör. `ORDER_RETENTION_HOURS`)
- [ ] `shared/events/` altında in-process event bus kur (Faz 2'den ertelendi)
- [ ] `OrderConfirmed` event'i yayınla (ileride bildirim/mutfak ekranı dinleyecek)
- [ ] Unit testler: fiyat hesaplama, durum geçişleri, iş kuralları
- [ ] Integration test: gerçek veritabanıyla sipariş oluşturma

**✅ Bitti kriteri:** Postman/Insomnia/Bruno ile sipariş oluşturulup `orderCode` alınabiliyor; manipüle edilmiş fiyat gönderilse bile doğru toplam hesaplanıyor.

---

## Faz 6 — QR Akışı

### 🔑 Kritik karar: QR'ın içinde ne olacak?

| Yaklaşım                            | Nasıl?                                                           | Artı                                                                                                     | Eksi                                                             |
| ----------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **A) Sadece sipariş kodu / URL** ✅ | QR = `orderCode` (veya `https://site.com/staff/orders/AB7K9XQ2`) | Küçük, okunması kolay QR; sipariş sunucuda güvende; fiyat manipülasyonu imkânsız; durum takip edilebilir | Sipariş oluşturulurken internet gerekir                          |
| B) Tüm sipariş JSON olarak          | QR = `{table:5, items:[...]}`                                    | Sunucuya kayıt gerekmez                                                                                  | Büyük ve zor okunan QR, fiyat/ürün sahteciliğine açık, takip yok |

> 💡 **Öneri: A yaklaşımı.** McDonald's mantığına da uygun: sipariş sistemde oluşur, QR sadece "anahtar"dır.

### Akış

```
[Müşteri] Sepeti onayla → masa no gir → POST /orders → orderCode al → QR göster
[Garson]  Paneli aç → kamera ile QR okut → GET /staff/orders/:orderCode → detayı gör → "Onayla" → PATCH confirm
[Müşteri] Ekranında durum "Onaylandı" olur (başta yenileme/polling ile, Faz 14'te WebSocket)
```

### Görevler

- [ ] QR üretimi istemci tarafında (web için ör. `qrcode` / `qrcode.react` kütüphanelerini araştır)
- [ ] QR'ın yanında **orderCode'u metin olarak da göster** (kamera çalışmazsa garson elle girer)
- [ ] QR'ı okutma ekranı (web kamerası için ör. `html5-qrcode` araştır)
- [ ] Aynı siparişin iki kez onaylanmasını engelle (idempotency)

**✅ Bitti kriteri:** Bir telefonda oluşturulan QR, başka bir cihazdan okutularak sipariş onaylanabiliyor.

---

## Faz 7 — Web: Müşteri Arayüzü (React + Vite)

> ⏩ `/menu` ve `/cart` sayfaları Faz 3 bitince başlar (bkz. Faz 3 notu); `/checkout` ve `/order/:code` Faz 5–6'ya bağlıdır.

### Sayfalar / Akış

```
/              → Hoş geldin + "Siparişe Başla"
/menu          → Kategori sekmeleri + ürün kartları + "Sepete ekle"
/cart          → Sepet: adet artır/azalt, sil, not ekle, ara toplam
/checkout      → Masa numarası girişi + sipariş özeti + "Siparişi Oluştur"
/order/:code   → QR kod + orderCode + durum ("Garson bekleniyor...")
```

### Frontend klasör yapısı (feature tabanlı — backend modüllerine paralel)

```
apps/web/src/
├── features/
│   ├── menu/          # components, hooks (useMenu), api
│   ├── cart/          # CartContext / store, useCart, cart hesaplamaları
│   ├── checkout/
│   └── order/         # QR ekranı, useOrderStatus
├── shared/
│   ├── components/    # Button, Modal, PriceTag...
│   ├── api/           # HTTP client (fetch/axios wrapper)
│   └── utils/
├── pages/ veya routes/
└── main.jsx
```

### Görevler

- [ ] Router (ör. React Router)
- [ ] Veri çekme ve cache (ör. TanStack Query araştır) — React Native'de de aynısı kullanılır
- [ ] Sepet state yönetimi (Context + useReducer ile başla; büyürse Zustand)
- [ ] Sepeti `localStorage`'a kaydet (sayfa yenilenince kaybolmasın)
- [ ] **Mobil-öncelikli (mobile-first) tasarım** — müşteriler web sitesini telefonda açacak
- [ ] Yükleniyor / hata / boş sepet durumları
- [ ] Sipariş durumu için periyodik kontrol (polling, ör. 5 sn)
- [ ] QR ekranında kalan süre geri sayımı — **sunucu saatine** göre hesaplanır, müşterinin telefon saatine güvenilmez

> 🔁 **React Native'e hazırlık:** İş mantığını (sepet hesaplamaları, API çağrıları, hook'lar) bileşenlerden ayrı tut. UI değişir, mantık `packages/shared`'a taşınıp mobilde aynen kullanılır.

**✅ Bitti kriteri:** Telefon tarayıcısından menüden ürün seçip QR'a kadar tüm akış tamamlanabiliyor.

---

## Faz 8 — Web: Garson Paneli

- [ ] `/staff/login`
- [ ] `/staff/scan` → kamera ile QR okutma + elle kod girişi
- [ ] `/staff/orders/:code` → sipariş detayı, masa no, kalemler, not, toplam → `PENDING` ise "Onayla", `CONFIRMED` ise "İptal et" (garson `PENDING` siparişi iptal edemez — bkz. [order-status-machine.md](docs/domain/order-status-machine.md))
- [ ] `/staff/orders` → aktif siparişler listesi (masa numarasına göre)

**✅ Bitti kriteri:** Garson giriş yapıp QR okutarak siparişi onaylayabiliyor.

---

## Faz 9 — Web: Admin Paneli

- [ ] Kategori CRUD
- [ ] Ürün CRUD (fiyat, açıklama, `isAvailable` aç/kapa — "bu ürün bitti")
- [ ] Ürün görseli yükleme (başlangıçta yerel klasör, sonra bulut depolama)
- [ ] Masa yönetimi
- [ ] Personel yönetimi
- [ ] ~~Raporlar~~ → Siparişler kısa ömürlü olduğu için şimdilik raporlama yok (bkz. Faz 14)

---

## Faz 10 — Kimlik Doğrulama & Yetkilendirme (`identity` modülü)

> Müşteri **giriş yapmaz** (McDonald's'taki gibi anonim sipariş). Sadece personel giriş yapar.

- [ ] Şifre hash'leme (ör. `bcrypt` / `argon2`)
- [ ] JWT (access + refresh token) veya session tabanlı oturum — birlikte karar verelim
- [ ] Rol tabanlı yetki middleware'i: `WAITER`, `ADMIN`
- [ ] `/staff/*` ve `/admin/*` route'larını koru

> 📝 Not: Faz 8–9'a başlamadan önce bu fazı tamamlamak daha mantıklı olabilir. Sıralamayı o noktada birlikte değerlendiririz.

---

## Faz 11 — Test & Kalite

| Seviye      | Ne test edilir?                                   | Araç önerisi                  |
| ----------- | ------------------------------------------------- | ----------------------------- |
| Unit        | Domain entity'leri, use case'ler, fiyat hesaplama | Vitest veya Jest              |
| Integration | Repository + gerçek DB, API endpoint'leri         | Supertest + Docker'da test DB |
| E2E         | Müşteri akışı: menü → sepet → QR                  | Playwright                    |

- [ ] Kritik iş mantığı için hedef: %80+ kapsam (domain + application katmanı)
- [ ] GitHub Actions ile her push'ta lint + test (CI)

---

## Faz 12 — Güvenlik & Deployment

### Güvenlik kontrol listesi

- [ ] Sipariş oluşturma endpoint'ine **rate limiting** (spam sipariş engeli)
- [ ] CORS ayarları
- [ ] Güvenlik header'ları ve rate limit için Fastify plugin'leri (`@fastify/helmet`, `@fastify/rate-limit`, `@fastify/cors`)
- [ ] Tüm girdiler validasyondan geçer
- [ ] `orderCode` tahmin edilemez ve süreli
- [ ] Gizli bilgiler sadece env değişkenlerinde

### Deployment

- [ ] Backend için production Dockerfile (multi-stage build)
- [ ] Frontend build → statik hosting veya Nginx container
- [ ] Yönetilen veritabanı veya Docker volume ile kalıcı DB
- [ ] HTTPS (tarayıcı kamera erişimi için **zorunlu**)
- [ ] Veritabanı yedekleme planı

---

## Faz 13 — Mobil Uygulama (React Native)

- [ ] Expo ile başlangıç (öğrenmesi ve test etmesi en kolay yol)
- [ ] `apps/mobile` olarak monorepo'ya ekle
- [ ] `packages/shared` içindeki API client, sabitler, validasyon şemaları ve sepet mantığını yeniden kullan
- [ ] React Navigation ile ekran akışı (web'deki sayfaların karşılığı)
- [ ] QR gösterimi (ör. `react-native-qrcode-svg` araştır)
- [ ] Garson panelini mobil uygulamaya taşı (karar: başlangıçta web paneli, sonra mobil — bkz. Açık Sorular #6)
- [ ] Backend'de değişiklik **gerekmemeli** — bu, mimarinin doğru kurulduğunun testi ✅

---

## Faz 14 — İyileştirmeler (Backlog)

- [ ] 🔔 Gerçek zamanlı güncellemeler (WebSocket / Socket.IO / SSE): garson yeni siparişi anında görür, müşteri "onaylandı" bildirimini anında alır
- [ ] 👨‍🍳 Mutfak ekranı (Kitchen Display) — `OrderConfirmed` event'ini dinler
- [ ] 🪑 Masaya yapıştırılan QR ile masa numarasının otomatik dolması
- [ ] ➕ Ürün seçenekleri / ekstralar ("ekstra peynir", "büyük boy")
- [ ] 🍱 Hazır menüler / kombolar (ürün başına maksimum adet: 10)
- [ ] 🌍 Çoklu dil (TR/EN)
- [ ] ~~💳 Online ödeme~~ → **kapsam dışı**: ödeme kasada yapılır (bkz. Açık Sorular #4)
- [ ] 🏪 Çoklu restoran (multi-tenant) desteği
- [ ] 📊 Raporlama (günlük sipariş, ciro, en çok satanlar) — sipariş saklama süresinin uzatılmasını gerektirir
- [ ] ⏱️ Kısa ömürlü siparişler için Redis (TTL) değerlendirmesi
- [ ] ⚡ Menü için cache (Redis)

---

## 📝 ADR (Architecture Decision Record) Şablonu

Her önemli kararı `docs/adr/NNN-title.md` olarak kaydet:

```markdown
# ADR-001: Database selection

## Status

Accepted | Proposed | Superseded

## Context

Neden bir karar vermemiz gerekiyor?

## Options

Değerlendirilen seçenekler ve artı/eksileri

## Decision

Ne seçtik?

## Consequences

Bu kararın sonuçları, getirdikleri ve götürdükleri
```

**ADR'ler** (kutucuk = ADR dosyası yazıldı):

- [x] [ADR-001](docs/adr/001-database.md): Veritabanı seçimi → **PostgreSQL** (ORM kararı **Prisma** da bu ADR'de)
- [x] [ADR-002](docs/adr/002-backend-framework.md): Backend framework seçimi → **Fastify**
- [x] [ADR-003](docs/adr/003-monorepo-structure.md): Monorepo yapısı → **npm workspaces**
- [ ] ADR-004: QR içeriği → karar verildi (**sadece sipariş kodu**), dosyası yazılacak
- [ ] ADR-005: Kimlik doğrulama yöntemi (JWT vs. session) → Faz 10'da karar verilecek
- [ ] ADR-006: Web frontend → karar verildi (**React + Vite**), dosyası yazılacak
- [ ] ADR-007: Sipariş saklama politikası → karar verildi (**kısa ömürlü, otomatik silme**), dosyası yazılacak
- ~~ADR-008: ORM seçimi~~ → ADR-001'e dahil edildi; numara tekrar kullanılmaz

---

## ❓ Açık Sorular (Birlikte Cevaplayacağız)

1. Tek bir restoran için mi, yoksa ileride birden fazla restoranın kullanacağı bir platform mu? (Veritabanı tasarımını doğrudan etkiler)
   - ✅ **Tek restoran (single-tenant).** Her restoran kendi kurulumunu çalıştırır; restoranları toplayan merkezi bir platform yok. Müşteri, masadaki QR ile restoranın web sitesindeki menüye ulaşır.
2. Garson onaylamadan önce müşteri siparişini düzenleyebilsin mi?
   - ✅ **Onaydan önce:** müşteri siparişi iptal edip sepeti düzenleyerek yeni sipariş (yeni QR) oluşturabilir. **Onaydan sonra:** sipariş değiştirilemez; ek istek için yeni sipariş oluşturulur. Oluşturulmuş bir siparişin kalemleri hiçbir durumda değişmez — düzenleme sadece sepette (istemci tarafında) yapılır.
3. Aynı masadan birden fazla sipariş (ayrı ayrı QR) verilebilsin mi?
   - ✅ **Evet.** Bir masadan birden fazla sipariş verilebilir (`TABLE 1 ─ N ORDER`).
4. Ödeme sistemde mi olacak, yoksa kasada mı?
   - ✅ **Kasada.** Sistemde ödeme olmayacak; müşteri fişi restorandan alır.
5. Ürünlerde seçenek/ekstra ilk sürümde gerekli mi?
   - ✅ **Hayır.** Ekstralar ilk sürümde yok, Faz 14'e kaldı.
6. Garson tarafı web paneli mi kalacak, yoksa mobil uygulama mı olacak?
   - ✅ **Başlangıçta web paneli**, sonraki geliştirmelerde mobil uygulamaya taşınacak (Faz 13).

---

## 🤝 Claude ile Nasıl Çalışacağız?

Her faz için önerilen döngü:

1. **Tasarım konuşması** → Fazın hedefini ve yaklaşımı konuşuruz
2. **Sen kodlarsın** → Takıldığın yerde soru sorarsın; Claude ipucu ve açıklama verir, hazır kod vermez
3. **Code review** → Kodunu paylaşırsın; SOLID, modül sınırları, isimlendirme ve olası hatalar açısından inceleriz
4. **Refactor** → Geri bildirime göre düzenlersin
5. **Bitti kriteri kontrolü** → Faz tamamlandı mı? Roadmap'te kutucukları işaretle ✅

> 🧭 **Sıradaki adım:** Faz 2 — ilk görev: Fastify kurulumu, `app.js` / `server.js` ayrımı ve `GET /health` (bkz. 2.4).
