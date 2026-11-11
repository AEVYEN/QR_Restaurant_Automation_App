import { ValidationError } from '../../../shared/errors/app-error.js';

/**
 * Menüdeki bir ürün.
 * Fiyat KURUŞ cinsinden tam sayıdır: 4500 = 45,00 ₺ (ondalık sayı hatalarından kaçınmak için).
 * id, veritabanına kaydedilmemiş yeni ürünlerde henüz yoktur (undefined).
 */
export class Product {
  constructor({
    id,
    categoryId,
    name,
    description = null,
    price,
    imageUrl = null,
    isAvailable = true,
  }) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new ValidationError('Ürün adı boş olamaz');
    }
    if (!Number.isInteger(price)) {
      throw new ValidationError('Ürün fiyatı kuruş cinsinden tam sayı olmalı');
    }
    if (price < 0) {
      throw new ValidationError(`Ürün fiyatı 0'dan küçük olamaz`);
    }

    if (categoryId == null) {
      throw new ValidationError(`Geçerli categoryId giriniz`);
    }

    this.id = id;
    this.categoryId = categoryId;
    this.name = name.trim();
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
    this.isAvailable = isAvailable;
  }
}
