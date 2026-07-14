import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fileFormationIO } from '../fileFormationIO';

describe('fileFormationIO.read', () => {
  it('ファイルの内容をテキストとして読み込む（2.3 インポート）', async () => {
    const file = new File(['{"version":1,"members":[]}'], 'formation.json');

    await expect(fileFormationIO.read(file)).resolves.toBe('{"version":1,"members":[]}');
  });
});

describe('fileFormationIO.download', () => {
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // jsdom は createObjectURL/revokeObjectURL を実装していないため直接定義する
    createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('指定したファイル名でBlobをダウンロードさせる（2.3 エクスポート）', () => {
    let capturedAnchor: HTMLAnchorElement | undefined;
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const element = originalCreateElement(tag);
      if (tag === 'a') {
        capturedAnchor = element as HTMLAnchorElement;
        vi.spyOn(capturedAnchor, 'click').mockImplementation(() => {});
      }
      return element;
    });

    fileFormationIO.download('{"version":1,"members":[]}', 'formation.json');

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(capturedAnchor?.download).toBe('formation.json');
    expect(capturedAnchor?.href).toContain('blob:mock-url');
    expect(capturedAnchor?.click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
