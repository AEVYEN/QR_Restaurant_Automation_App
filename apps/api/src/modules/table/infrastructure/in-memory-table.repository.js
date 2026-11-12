import { Table } from '../domain/table.entity.js';

/**
 * TableRepository sözleşmesinin BELLEK İÇİ uygulanışı (testler için).
 * Veritabanı yok; masalar constructor'a verilen dizide yaşar.
 *
 * Liskov kuralı: PrismaTableRepository ile AYNI davranmalı,
 * yoksa testler gerçekte olmayan bir dünyayı test eder.
 *
 * @implements {import('../application/table-repository.contract.js').TableRepository}
 */
export class InMemoryTableRepository {
  /** @param {{ tables?: object[] }} [data] düz objeler; entity'ye burada çevrilir */
  constructor({ tables = [] } = {}) {
    this.tables = tables.map((row) => new Table(row));
  }

  async findByNumber(number) {
    return this.tables.find((table) => table.number === number) ?? null;
  }
}
