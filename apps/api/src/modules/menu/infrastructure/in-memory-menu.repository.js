import { Category } from '../domain/category.entity.js';
import { Product } from '../domain/product.entity.js';

/**
 * MenuRepository sözleşmesinin BELLEK İÇİ uygulanışı (testler için).
 * Veritabanı yok; veriler constructor'a verilen dizilerde yaşar.
 *
 * Liskov kuralı: PrismaMenuRepository ile AYNI davranmalı (aynı filtreler, aynı sıralama),
 * yoksa testler gerçekte olmayan bir dünyayı test eder.
 *
 * @implements {import('../application/menu-repository.contract.js').MenuRepository}
 */
export class InMemoryMenuRepository {
  /** @param {{ categories?: object[], products?: object[] }} [data] düz objeler; entity'ye burada çevrilir */
  constructor({ categories = [], products = [] } = {}) {
    // Prisma'daki "satır → entity" dönüşümünün karşılığı
    this.categories = categories.map((row) => new Category(row));
    this.products = products.map((row) => new Product(row));
  }

  async findActiveCategories() {
    return this.categories
      .filter((category) => category.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name, 'tr'));
  }

  async findMenuProducts() {
    const activeCategoryIds = new Set(
      this.categories.filter((category) => category.isActive).map((category) => category.id),
    );
    return this.products
      .filter((product) => activeCategoryIds.has(product.categoryId))
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }

  async findProductById(id) {
    return this.products.find((product) => product.id === id) ?? null;
  }

  async findProductsByIds(ids) {
    return this.products.filter((product) => ids.includes(product.id));
  }
}
