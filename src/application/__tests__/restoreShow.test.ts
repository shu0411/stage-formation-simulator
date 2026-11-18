import { describe, expect, it, vi } from 'vitest';
import { restoreShow } from '../restoreShow';
import type { FormationStorage } from '../ports';

describe('restoreShow', () => {
  it('保存データがあれば復元する（1.5 保存・復元）', () => {
    const json = JSON.stringify({
      version: 2,
      members: [{ id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 }],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-1': { x: 1, y: 2 } } }],
    });
    const storage: FormationStorage = { save: vi.fn(), load: vi.fn().mockReturnValue(json) };

    expect(restoreShow(storage)).toEqual({
      members: [{ id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 }],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-1': { x: 1, y: 2 } } }],
    });
  });

  it('保存データがない場合はnullを返す（1.5 空状態）', () => {
    const storage: FormationStorage = { save: vi.fn(), load: vi.fn().mockReturnValue(null) };

    expect(restoreShow(storage)).toBeNull();
  });

  it('保存データが破損している場合はnullを返す（2.4 LocalStorageの破損データ）', () => {
    const storage: FormationStorage = {
      save: vi.fn(),
      load: vi.fn().mockReturnValue('not json'),
    };

    expect(restoreShow(storage)).toBeNull();
  });

  it('version 1の保存データはnullを返す（旧形式は復元できない）', () => {
    const json = JSON.stringify({
      version: 1,
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2, color: '#ff0000', height: 170 }],
    });
    const storage: FormationStorage = { save: vi.fn(), load: vi.fn().mockReturnValue(json) };

    expect(restoreShow(storage)).toBeNull();
  });
});
