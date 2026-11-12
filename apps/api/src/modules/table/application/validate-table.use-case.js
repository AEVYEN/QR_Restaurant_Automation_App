import { NotFoundError } from '../../../shared/errors/app-error.js';

/**
 * Müşterinin girdiği masa numarasını doğrular: masa var ve aktif mi?
 *
 * Masa HİÇ YOKSA da PASİFSE de aynı hata döner (404).
 * Müşteri iki durumu ayırt etmez; mesaj her ikisinde de aynıdır.
 */
export class ValidateTableUseCase {
  /** @param {{ tableRepository: import('./table-repository.contract.js').TableRepository }} deps */
  constructor({ tableRepository }) {
    this.tableRepository = tableRepository;
  }

  /**
   * @param {number} number masa numarası
   * @returns {Promise<{ number: number }>} masa geçerliyse numarası
   * @throws {NotFoundError} masa yoksa veya pasifse
   */
  async execute(number) {
    const table = await this.tableRepository.findByNumber(number);
    if (table === null || table.isActive === false) {
      throw new NotFoundError(`Masa ${number} bulunamadı`);
    }
    return { number };
  }
}
