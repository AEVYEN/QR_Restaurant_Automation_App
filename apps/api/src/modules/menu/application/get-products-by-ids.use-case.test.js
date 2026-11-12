import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GetProductsByIdsUseCase } from './get-products-by-ids.use-case.js';
import { InMemoryMenuRepository } from '../infrastructure/in-memory-menu.repository.js';

function buildUseCase({ categories = [], products = [] } = {}) {
  const menuRepository = new InMemoryMenuRepository({ categories, products });
  return new GetProductsByIdsUseCase({ menuRepository });
}

const burgers = { id: 1, name: 'Burgerler', displayOrder: 1, maxQuantityPerItem: 10 };
const drinks = { id: 2, name: 'İçecekler', displayOrder: 2, maxQuantityPerItem: 20 };

describe('GetProductsByIdsUseCase', () => {
  it('ürünü, kategorisinin adet limitiyle birlikte döndürür', async () => {
    const useCase = buildUseCase({
      categories: [burgers, drinks],
      products: [
        { id: 10, categoryId: 2, name: 'Ayran', price: 4000 },
        { id: 11, categoryId: 1, name: 'Cheeseburger', price: 31000 },
      ],
    });

    const products = await useCase.execute([10, 11]);

    assert.deepEqual(products, [
      { id: 10, name: 'Ayran', price: 4000, isAvailable: true, maxQuantityPerItem: 20 },
      { id: 11, name: 'Cheeseburger', price: 31000, isAvailable: true, maxQuantityPerItem: 10 },
    ]);
  });

  it('bulunamayan id için hata fırlatmaz, sonuca eklemez', async () => {
    const useCase = buildUseCase({
      categories: [burgers],
      products: [{ id: 11, categoryId: 1, name: 'Cheeseburger', price: 31000 }],
    });

    const products = await useCase.execute([11, 999]);

    assert.deepEqual(
      products.map((product) => product.id),
      [11],
    );
  });

  it('stokta olmayan ürünü döndürür; reddetmek ordering modülünün işi', async () => {
    const useCase = buildUseCase({
      categories: [burgers],
      products: [{ id: 11, categoryId: 1, name: 'Cheeseburger', price: 31000, isAvailable: false }],
    });

    const [product] = await useCase.execute([11]);

    assert.equal(product.isAvailable, false);
  });

  it('pasif kategorideki ürünü döndürmez', async () => {
    // 1. HAZIRLA
    const useCase = buildUseCase({
      categories: [burgers, { ...drinks, isActive: false }],
      products: [
        { id: 10, categoryId: 2, name: 'Ayran', price: 4000 }, // pasif kategoride
        { id: 11, categoryId: 1, name: 'Cheeseburger', price: 31000 }, // aktif kategoride
      ],
    });

    // 2. ÇALIŞTIR
    const products = await useCase.execute([10, 11]);

    // 3. KONTROL ET
    assert.deepEqual(
      products.map((product) => product.id),
      [11],
    );
  });
});
