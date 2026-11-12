import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Table } from './table.entity.js';
import { ValidationError } from '../../../shared/errors/app-error.js';

describe('Table', () => {
  it('geçerli numarayla masa oluşturur, isActive varsayılan olarak true olur', () => {
    const table = new Table({ number: 5 });

    assert.equal(table.number, 5);
    assert.equal(table.isActive, true);
  });

  it('negatif numarayı reddeder', () => {
    assert.throws(() => new Table({ number: -1 }), ValidationError);
  });

  // ---- Bundan sonrası SENİN: ___ yerlerini doldur ----

  it('0 numaralı masayı kabul eder (sınır değeri)', () => {
    const table = new Table({ number: 0 });

    assert.equal(table.number, 0);
  });

  it('ondalıklı numarayı reddeder', () => {
    assert.throws(() => new Table({ number: 0.2 }), ValidationError);
  });

  it('string numarayı reddeder ("5" gibi)', () => {
    assert.throws(() => new Table({ number: '5' }), ValidationError);
  });

  it('isActive: false verilirse pasif masa oluşturur', () => {
    const table = new Table({ number: 3, isActive: false });

    assert.equal(table.isActive, false);
  });
});
