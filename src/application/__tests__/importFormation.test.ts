import { describe, expect, it, vi } from 'vitest';
import { importFormation } from '../importFormation';
import type { FormationFileIO } from '../ports';

describe('importFormation', () => {
  it('正しい形式のファイルを読み込むとフォーメーションを返す（1.5 JSONインポート）', async () => {
    const json = JSON.stringify({
      version: 1,
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2, color: '#ff0000', height: 170 }],
    });
    const fileIO: FormationFileIO = { read: vi.fn().mockResolvedValue(json), download: vi.fn() };
    const file = new File([json], 'formation.json');

    const result = await importFormation(file, fileIO);

    expect(fileIO.read).toHaveBeenCalledWith(file);
    expect(result).toEqual({
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2, color: '#ff0000', height: 170 }],
    });
  });

  it('不正な形式のファイルの場合はnullを返す（1.5 JSONインポートのエラー系）', async () => {
    const fileIO: FormationFileIO = {
      read: vi.fn().mockResolvedValue('not json'),
      download: vi.fn(),
    };
    const file = new File(['not json'], 'invalid.json');

    expect(await importFormation(file, fileIO)).toBeNull();
  });
});
