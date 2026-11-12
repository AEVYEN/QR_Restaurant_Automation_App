/**
 * Masa verisine erişim SÖZLEŞMESİ (interface).
 *
 * Use case'ler sadece bu sözleşmeyi bilir; verinin Prisma'dan mı yoksa
 * testteki bellek içi listeden mi geldiğini bilmez.
 * Her uygulama Prisma satırı değil, DOMAIN ENTITY (Table) döndürmek zorundadır.
 *
 * @typedef {import('../domain/table.entity.js').Table} Table
 *
 * @typedef {object} TableRepository
 * @property {(number: number) => Promise<Table | null>} findByNumber
 *   Masa yoksa null döner; "bulunamadı" hatasına use case karar verir.
 */

export {};
