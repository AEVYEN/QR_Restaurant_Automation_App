import { ValidationError } from '../../../shared/errors/app-error.js';

/**
 * Restorandaki bir masa.
 * number: masanın numarası. Aynı zamanda kimliğidir (PK) — ayrı bir "id" alanı yok.
 *         Müşteri siparişte bu numarayı girer, garson da bu numarayla masayı bulur.
 * isActive: false ise masa kullanımda değil (ör. tamirde, kaldırıldı) → bu masaya sipariş verilemez.
 */
export class Table {
  constructor({ number, isActive = true }) {
    if (!Number.isInteger(number) || number < 0) {
      throw new ValidationError(`Masa numarası 0 veya daha büyük bir tam sayı olmalıdır.`);
    }
    this.number = number;
    this.isActive = isActive;
  }
}
