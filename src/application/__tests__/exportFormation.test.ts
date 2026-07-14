import { describe, expect, it, vi } from 'vitest';
import { exportFormation } from '../exportFormation';
import type { FormationFileIO } from '../ports';
import type { Formation } from '../../domain/types';

describe('exportFormation', () => {
  it('フォーメーションをシリアライズし、formation.jsonとしてダウンロードさせる（1.5 JSONエクスポート）', () => {
    const formation: Formation = {
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2 }],
    };
    const fileIO: FormationFileIO = { read: vi.fn(), download: vi.fn() };

    exportFormation(formation, fileIO);

    expect(fileIO.download).toHaveBeenCalledWith(
      JSON.stringify({ version: 1, members: formation.members }),
      'formation.json',
    );
  });
});
