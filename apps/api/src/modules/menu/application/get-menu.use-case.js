/**
 * Müşteri menüsünü getirir: aktif kategoriler, her birinin altında ürünleri.
 * Tükenen ürünler (isAvailable: false) DAHİL edilir; web "Tükendi" gösterir.
 */
export class GetMenuUseCase {
  /** @param {{ menuRepository: import('./menu-repository.contract.js').MenuRepository }} deps */
  constructor({ menuRepository }) {
    this.menuRepository = menuRepository;
  }

  async execute() {
    // İki sorgu birbirini beklemesin diye aynı anda çalıştırıyoruz.
    const [categories, products] = await Promise.all([
      this.menuRepository.findActiveCategories(),
      this.menuRepository.findMenuProducts(),
    ]);
    const productsByCategory = new Map();
    for (const product of products) {
      if (!productsByCategory.has(product.categoryId)) {
        productsByCategory.set(product.categoryId, []);
      }
      productsByCategory.get(product.categoryId).push({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        isAvailable: product.isAvailable,
      });
    }
    const menu = categories.map((category) => ({
      id: category.id,
      name: category.name,
      maxQuantityPerItem: category.maxQuantityPerItem,
      products: productsByCategory.get(category.id) ?? [],
    }));

    return menu.filter((category) => category.products.length > 0);
  }
}
