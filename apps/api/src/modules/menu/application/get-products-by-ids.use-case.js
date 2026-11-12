/**
 * Sipariş için ürün bilgisi: ordering modülü bunu menu'nün public API'si üzerinden kullanır.
 *
 * - Bulunamayan id'ler sonuçta YOKTUR; "ürün bulunamadı" hatasına ordering karar verir.
 * - Pasif kategorideki ürünler de döndürülmez (menüde görünmeyen ürün sipariş edilemez).
 * - Stokta olmayan ürünler (isAvailable=false) döndürülür; reddetmek ordering'in işidir (R3).
 * - Entity değil DÜZ OBJE döner: ordering, menu'nün domain sınıflarına bağımlı olmasın.
 *
 * @typedef {object} OrderableProduct
 * @property {number} id
 * @property {string} name
 * @property {number} price               Kuruş cinsinden (R5)
 * @property {boolean} isAvailable        (R3)
 * @property {number} maxQuantityPerItem  Ürünün kategorisinden gelir (R2)
 */
export class GetProductsByIdsUseCase {
  /** @param {{ menuRepository: import('./menu-repository.contract.js').MenuRepository }} deps */
  constructor({ menuRepository }) {
    this.menuRepository = menuRepository;
  }

  /**
   * @param {number[]} ids
   * @returns {Promise<OrderableProduct[]>}
   */
  async execute(ids) {
    const [products, categories] = await Promise.all([
      this.menuRepository.findProductsByIds(ids),
      this.menuRepository.findActiveCategories(),
    ]);

    // Kategoriye id ile hızlı erişim (menüdeki gruplamanın tersi: burada gruplamıyor, arıyoruz)
    const activeCategoryById = new Map(categories.map((category) => [category.id, category]));

    return products
      .filter((product) => activeCategoryById.has(product.categoryId))
      .map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        isAvailable: product.isAvailable,
        maxQuantityPerItem: activeCategoryById.get(product.categoryId).maxQuantityPerItem,
      }));
  }
}
