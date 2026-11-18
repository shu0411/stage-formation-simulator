import { describe, expect, it, vi } from 'vitest';
import { saveShow } from '../saveShow';
import type { FormationStorage } from '../ports';
import type { Show } from '../../domain/types';

describe('saveShow', () => {
  it('演目をシリアライズしてstorageへ保存する（1.5 保存・復元）', () => {
    const show: Show = {
      members: [{ id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 }],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-1': { x: 1, y: 2 } } }],
    };
    const storage: FormationStorage = { save: vi.fn(), load: vi.fn() };

    saveShow(show, storage);

    expect(storage.save).toHaveBeenCalledWith(
      JSON.stringify({ version: 2, members: show.members, formations: show.formations }),
    );
  });
});
