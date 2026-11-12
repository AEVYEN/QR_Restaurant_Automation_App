import { Table } from '../domain/table.entity.js';

/**
 * TableRepository sözleşmesinin Prisma ile uygulanışı.
 * Prisma SADECE bu katmanda kullanılır; dışarıya her zaman domain entity çıkar.
 *
 * @implements {import('../application/table-repository.contract.js').TableRepository}
 */
export class PrismaTableRepository {
  /** @param {{ prisma: import('../../../generated/prisma/client.ts').PrismaClient }} deps */
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  async findByNumber(number) {
    const row = await this.prisma.table.findUnique({
      where: { number },
    });
    return row ? new Table(row) : null;
  }
}
