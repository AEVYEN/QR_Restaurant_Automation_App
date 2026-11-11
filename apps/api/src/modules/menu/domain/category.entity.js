import { ValidationError } from '../../../shared/errors/app-error.js';

/**
 * Menüdeki bir kategori (Burgerler, İçecekler...).
 * displayOrder: menüde kaçıncı sırada görüneceği (küçük olan önce).
 * maxQuantityPerItem: bu kategorideki bir üründen tek siparişte en fazla kaç adet alınabilir.
 */
export class Category {
  constructor({ id, name, displayOrder = 0, isActive = true, maxQuantityPerItem }) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new ValidationError('Kategori adı boş olamaz.');
    }
    if (!Number.isInteger(maxQuantityPerItem) || maxQuantityPerItem < 1) {
      throw new ValidationError(`Ürün adet sınırı en az 1 olan bir tam sayı olmalı.`);
    }
    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      throw new ValidationError(`Menü sırası 0'dan küçük olamaz veya ondalıklı olamaz.`);
    }
    this.id = id;
    this.name = name.trim();
    this.displayOrder = displayOrder;
    this.isActive = isActive;
    this.maxQuantityPerItem = maxQuantityPerItem;
  }
}
