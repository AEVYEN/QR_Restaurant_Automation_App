/**
 * Menü verisine erişim SÖZLEŞMESİ (interface).
 *
 * Use case'ler sadece bu sözleşmeyi bilir; verinin Prisma'dan mı, Knex'ten mi,
 * yoksa testteki bellek içi (in-memory) bir listeden mi geldiğini bilmez.
 * Her uygulama (implementation) Prisma satırı değil, DOMAIN ENTITY döndürmek zorundadır.
 *
 * @typedef {import('../domain/category.entity.js').Category} Category
 * @typedef {import('../domain/product.entity.js').Product} Product
 *
 * @typedef {object} MenuRepository
 * @property {() => Promise<Category[]>} findActiveCategories
 *   Aktif kategoriler, menü sırasına (displayOrder) göre.
 * @property {() => Promise<Product[]>} findMenuProducts
 *   Müşteri menüsünde gösterilecek ürünler.
 * @property {(id: number) => Promise<Product | null>} findProductById
 *   Ürün yoksa null döner; "bulunamadı" hatasına use case karar verir.
 * @property {(ids: number[]) => Promise<Product[]>} findProductsByIds
 *   Verilen id'lerden veritabanında var olanlar (ordering modülü kullanacak).
 */

export {};
