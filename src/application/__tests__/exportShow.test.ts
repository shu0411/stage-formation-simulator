import { describe, expect, it, vi } from 'vitest';
import { exportShow } from '../exportShow';
import type { FormationFileIO } from '../ports';
import type { Show } from '../../domain/types';

describe('exportShow', () => {
  it('演目をシリアライズし、formation.jsonとしてダウンロードさせる（1.5 JSONエクスポート）', () => {
    const show: Show = {
      members: [{ id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 }],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-1': { x: 1, y: 2 } } }],
    };
    const fileIO: FormationFileIO = { read: vi.fn(), download: vi.fn() };

    exportShow(show, fileIO);

    expect(fileIO.download).toHaveBeenCalledWith(
      JSON.stringify({ version: 2, members: show.members, formations: show.formations }),
      'formation.json',
    );
  });
});
