import { prisma } from '../src/shared/database/prisma.js';

// Geliştirme ortamı için örnek menü. Fiyatlar KURUŞ cinsinden (4500 = 45,00 ₺).
// maxQuantityPerItem: ROADMAP iş kuralı → yemekler 10; salata, tatlı ve içecekler 20
const LAST_TABLE_NUMBER = 20;
const menu = [
  {
    name: 'Burgerler',
    displayOrder: 1,
    maxQuantityPerItem: 10,
    products: [
      { name: 'Klasik Burger', description: 'Dana köfte, marul, domates, turşu', price: 28000 },
      { name: 'Cheeseburger', description: 'Dana köfte, cheddar, karamelize soğan', price: 31000 },
      { name: 'Tavuk Burger', description: 'Çıtır tavuk, coleslaw, ranch sos', price: 24500 },
    ],
  },
  {
    name: 'Salatalar',
    displayOrder: 2,
    maxQuantityPerItem: 20,
    products: [
      { name: 'Sezar Salata', description: 'Izgara tavuk, parmesan, kruton', price: 22000 },
      { name: 'Çoban Salata', description: 'Domates, salatalık, biber, soğan', price: 12000 },
    ],
  },
  {
    name: 'İçecekler',
    displayOrder: 3,
    maxQuantityPerItem: 20,
    products: [
      { name: 'Ayran', price: 4500 },
      { name: 'Kola', price: 6000 },
      { name: 'Su', price: 2000 },
    ],
  },
  {
    name: 'Tatlılar',
    displayOrder: 4,
    maxQuantityPerItem: 20,
    products: [
      { name: 'Sufle', description: 'Sıcak çikolatalı, vanilyalı dondurma ile', price: 16500 },
      { name: 'Cheesecake', description: 'Frambuaz soslu', price: 15000 },
    ],
  },
];

async function main() {
  for (const { products, ...category } of menu) {
    const saved = await prisma.category.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
    for (const product of products) {
      await prisma.product.upsert({
        where: { categoryId_name: { categoryId: saved.id, name: product.name } },
        update: product,
        create: { ...product, categoryId: saved.id },
      });
    }
  }

  for (let i = 0; i <= LAST_TABLE_NUMBER; i++) {
    await prisma.table.upsert({
      where: { number: i },
      update: {},
      create: { number: i },
    });
  }

  console.log(`Seed tamamlandı: ${menu.length} kategori, ${LAST_TABLE_NUMBER + 1} masa.`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
