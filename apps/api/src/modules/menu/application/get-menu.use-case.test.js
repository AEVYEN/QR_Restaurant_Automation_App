import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GetMenuUseCase } from './get-menu.use-case.js';
import { InMemoryMenuRepository } from '../infrastructure/in-memory-menu.repository.js';

// Her test kendi verisini kurar: testler birbirini etkilemesin
function buildUseCase({ categories = [], products = [] } = {}) {
  const menuRepository = new InMemoryMenuRepository({ categories, products });
  return new GetMenuUseCase({ menuRepository });
}

const burgers = { id: 1, name: 'Burgerler', displayOrder: 1, maxQuantityPerItem: 10 };
const drinks = { id: 2, name: 'İçecekler', displayOrder: 2, maxQuantityPerItem: 20 };

describe('GetMenuUseCase', () => {
  it('ürünleri kategorilerine göre, kategorileri displayOrder sırasıyla gruplar', async () => {
    const useCase = buildUseCase({
      // Bilerek ters sırada veriyoruz: sıralamayı use case/repository yapmalı
      categories: [drinks, burgers],
      products: [
        { id: 10, categoryId: 2, name: 'Ayran', price: 4000 },
        { id: 11, categoryId: 1, name: 'Cheeseburger', price: 31000 },
        { id: 12, categoryId: 1, name: 'Klasik Burger', price: 28000 },
      ],
    });

    const menu = await useCase.execute();

    assert.deepEqual(
      menu.map((category) => category.name),
      ['Burgerler', 'İçecekler'],
    );
    assert.deepEqual(
      menu[0].products.map((product) => product.name),
      ['Cheeseburger', 'Klasik Burger'],
    );
    assert.equal(menu[0].maxQuantityPerItem, 10);
    assert.equal(menu[1].products[0].name, 'Ayran');
  });

  it('pasif kategoriyi ve ürünlerini göstermez', async () => {
    const useCase = buildUseCase({
      categories: [burgers, { ...drinks, isActive: false }],
      products: [
        { id: 10, categoryId: 2, name: 'Ayran', price: 4000 },
        { id: 11, categoryId: 1, name: 'Cheeseburger', price: 31000 },
      ],
    });

    const menu = await useCase.execute();

    assert.deepEqual(
      menu.map((category) => category.name),
      ['Burgerler'],
    );
  });

  it('ürünü olmayan kategoriyi göstermez (karar A)', async () => {
    const useCase = buildUseCase({
      categories: [burgers, drinks],
      products: [{ id: 11, categoryId: 1, name: 'Cheeseburger', price: 31000 }],
    });

    const menu = await useCase.execute();

    assert.equal(menu.length, 1);
    assert.equal(menu[0].name, 'Burgerler');
  });

  it('stokta olmayan ürünü isAvailable=false ile gösterir (karar B)', async () => {
    const useCase = buildUseCase({
      categories: [burgers],
      products: [{ id: 11, categoryId: 1, name: 'Cheeseburger', price: 31000, isAvailable: false }],
    });

    const menu = await useCase.execute();

    assert.equal(menu[0].products.length, 1);
    assert.equal(menu[0].products[0].isAvailable, false);
  });

  it('ürünlerde sadece menünün ihtiyaç duyduğu alanları döndürür', async () => {
    const useCase = buildUseCase({
      categories: [burgers],
      products: [{ id: 11, categoryId: 1, name: 'Cheeseburger', price: 31000 }],
    });

    const [category] = await useCase.execute();

    // categoryId gibi iç alanlar dışarı sızmamalı
    assert.deepEqual(category.products[0], {
      id: 11,
      name: 'Cheeseburger',
      description: null,
      price: 31000,
      imageUrl: null,
      isAvailable: true,
    });
  });

  it('menü boşsa boş dizi döndürür', async () => {
    const menu = await buildUseCase().execute();

    assert.deepEqual(menu, []);
  });
});
