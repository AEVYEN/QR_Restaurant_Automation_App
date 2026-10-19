# Business Rules

Bu belge ilk sürümdeki iş kurallarını tanımlar. Kuralların hepsini `ordering` modülü uygular; `menu` ve `table` modülleri sadece public API'leri üzerinden veri sağlar.

## Sipariş oluşturma kuralları

| #   | Kural                                                                          | Değer                         | Uygulayan                           | Veri kaynağı                                  | Hata mesajı                                            |
| --- | ------------------------------------------------------------------------------ | ----------------------------- | ----------------------------------- | --------------------------------------------- | ------------------------------------------------------ |
| R1  | Sipariş en az 1 ürün içermeli                                                  | min. 1 kalem                  | `ordering` (`Order` entity)         | —                                             | "Sipariş en az bir ürün içermelidir"                   |
| R2  | Tek bir üründen sipariş edilebilecek adet, ürünün kategorisine göre sınırlıdır | `CATEGORY.maxQuantityPerItem` | `ordering`                          | `menu` (`getProductsByIds` → kategori limiti) | "Bu üründen en fazla {limit} adet sipariş verilebilir" |
| R3  | `isAvailable = false` olan ürün sipariş edilemez                               | —                             | `ordering`                          | `menu` (`getProductsByIds`)                   | "{ürün adı} şu anda mevcut değil"                      |
| R4  | Masa numarası sistemde kayıtlı ve aktif bir masa olmalı                        | —                             | `ordering`                          | `table` (`isTableAvailable`)                  | "Geçersiz masa numarası"                               |
| R5  | Toplam tutar her zaman sunucuda, ürünün güncel fiyatından hesaplanır           | —                             | `ordering` (`OrderPriceCalculator`) | `menu` (güncel fiyat)                         | — (istemciden fiyat alınmaz)                           |
| R6  | Onaylanmamış sipariş, oluşturulduktan sonra süre aşımında `EXPIRED` olur       | varsayılan **15 dk** (config) | `ordering` (`Order` entity)         | `ORDER.expiresAt`                             | "Siparişin süresi dolmuş"                              |
| R7  | Oluşturulmuş bir siparişin kalemleri değiştirilemez                            | —                             | `ordering` (`Order` entity)         | —                                             | — (kalem değiştiren metot yoktur)                      |

## Kural detayları

### R2 — Ürün başına maksimum adet

- Limit **kalem başınadır**: tek bir üründen en fazla N adet. Kategori toplamı sınırlanmaz.
- Limit kodda değil, veride durur: her kategorinin `maxQuantityPerItem` değeri admin tarafından belirlenir. Kodda kategori adı geçmez.
- Varsayılan değerler (seed verisi):

  | Kategori türü                  | `maxQuantityPerItem` |
  | ------------------------------ | -------------------- |
  | Yemekler (burgerler vb.)       | 10                   |
  | Salatalar, tatlılar, içecekler | 20                   |

- Hazır menüler (kombolar) ilk sürümde yok (Faz 14). Eklendiklerinde onlar için de limit **10** olacak.
- Bir masa birden fazla sipariş verebildiği için bu limit sipariş başınadır; kötüye kullanıma karşı kesin bir engel değil, makul bir üst sınırdır.

### R6 — Süre aşımı

- Süre config'den okunur: `ORDER_EXPIRY_MINUTES` (varsayılan `15`). Her restoran kendine göre ayarlayabilir.
- `expiresAt = createdAt + ORDER_EXPIRY_MINUTES` olarak sipariş oluşturulurken hesaplanır ve kaydedilir.
- Kuralın doğruluk kaynağı `expiresAt` alanıdır, `status` değil (bkz. [order-status-machine.md](order-status-machine.md)).
- Müşteri QR ekranında kalan süreyi görür. Kalan süre **sunucu saatine** göre hesaplanır; müşterinin telefon saatine güvenilmez.

### R7 — Sipariş değiştirilemez

- Onaydan önce: müşteri siparişi iptal edip sepeti düzenleyerek yeni sipariş (yeni QR) oluşturur.
- Onaydan sonra: ek istek için yeni sipariş oluşturulur.
- Düzenleme sadece sepette, istemci tarafında yapılır.
