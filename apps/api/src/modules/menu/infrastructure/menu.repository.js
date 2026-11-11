import { Category } from '../domain/category.entity.js';
import { Product } from '../domain/product.entity.js';

/**
 * MenuRepository sözleşmesinin Prisma ile uygulanışı.
 * Prisma SADECE bu katmanda kullanılır; dışarıya her zaman domain entity çıkar.
 *
 * @implements {import('../application/menu-repository.contract.js').MenuRepository}
 */
export class PrismaMenuRepository {
  /** @param {{ prisma: import('../../../generated/prisma/client.ts').PrismaClient }} deps */
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  async findActiveCategories() {
    const rows = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
    return rows.map((row) => new Category(row));
  }

  async findMenuProducts() {
    const rows = await this.prisma.product.findMany({
      // Stokta olmayan ürünler menüde görünür.
      where: { category: { isActive: true } },
      orderBy: { name: 'asc' },
    });
    return rows.map((row) => new Product(row));
  }

  async findProductById(id) {
    const row = await this.prisma.product.findUnique({
      where: { id },
    });
    return row ? new Product(row) : null;
  }

  async findProductsByIds(ids) {
    const rows = await this.prisma.product.findMany({
      where: { id: { in: ids } },
    });
    return rows.map((row) => new Product(row));
  }
}
