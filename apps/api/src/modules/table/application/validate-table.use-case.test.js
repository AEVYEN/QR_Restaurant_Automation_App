import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ValidateTableUseCase } from './validate-table.use-case.js';
import { InMemoryTableRepository } from '../infrastructure/in-memory-table.repository.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';

// Her test kendi repository'sini kurar; testler birbirini etkilemez.
function createUseCase(tables) {
  const tableRepository = new InMemoryTableRepository({ tables });
  return new ValidateTableUseCase({ tableRepository });
}

describe('ValidateTableUseCase', () => {
  it('aktif masa için numarayı döndürür', async () => {
    const useCase = createUseCase([{ number: 5 }]);

    const result = await useCase.execute(5);

    assert.deepEqual(result, { number: 5 });
  });

  it('olmayan masa için NotFoundError fırlatır', async () => {
    const useCase = createUseCase([{ number: 5 }]);

    await assert.rejects(() => useCase.execute(50), NotFoundError);
  });

  it('pasif masa için NotFoundError fırlatır', async () => {
    const useCase = createUseCase([{ number: 3, isActive: false }]);

    await assert.rejects(() => useCase.execute(3), NotFoundError);
  });

  it('0 numaralı (bar) masayı kabul eder', async () => {
    const useCase = createUseCase([{ number: 0 }]);

    const result = await useCase.execute(0);

    assert.deepEqual(result, { number: 0 });
  });
});
