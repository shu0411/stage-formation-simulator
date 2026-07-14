import { describe, expect, it, vi } from 'vitest';
import { saveFormation } from '../saveFormation';
import type { FormationStorage } from '../ports';
import type { Formation } from '../../domain/types';

describe('saveFormation', () => {
  it('フォーメーションをシリアライズしてstorageへ保存する（1.5 保存・復元）', () => {
    const formation: Formation = {
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2 }],
    };
    const storage: FormationStorage = { save: vi.fn(), load: vi.fn() };

    saveFormation(formation, storage);

    expect(storage.save).toHaveBeenCalledWith(
      JSON.stringify({ version: 1, members: formation.members }),
    );
  });
});
