import { describe, expect, it, vi } from 'vitest';
import { importShow } from '../importShow';
import type { FormationFileIO } from '../ports';

describe('importShow', () => {
  it('正しい形式のファイルを読み込むと演目を返す（1.5 JSONインポート）', async () => {
    const json = JSON.stringify({
      version: 2,
      members: [{ id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 }],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-1': { x: 1, y: 2 } } }],
    });
    const fileIO: FormationFileIO = { read: vi.fn().mockResolvedValue(json), download: vi.fn() };
    const file = new File([json], 'formation.json');

    const result = await importShow(file, fileIO);

    expect(fileIO.read).toHaveBeenCalledWith(file);
    expect(result).toEqual({
      members: [{ id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 }],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-1': { x: 1, y: 2 } } }],
    });
  });

  it('不正な形式のファイルの場合はnullを返す（1.5 JSONインポートのエラー系）', async () => {
    const fileIO: FormationFileIO = {
      read: vi.fn().mockResolvedValue('not json'),
      download: vi.fn(),
    };
    const file = new File(['not json'], 'invalid.json');

    expect(await importShow(file, fileIO)).toBeNull();
  });

  it('version 1の形式のファイルの場合はnullを返す（旧形式はインポートできない）', async () => {
    const json = JSON.stringify({
      version: 1,
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2, color: '#ff0000', height: 170 }],
    });
    const fileIO: FormationFileIO = { read: vi.fn().mockResolvedValue(json), download: vi.fn() };
    const file = new File([json], 'formation.json');

    expect(await importShow(file, fileIO)).toBeNull();
  });
});
