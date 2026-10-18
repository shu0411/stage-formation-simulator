import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OperationsBar } from '../OperationsBar';
import { AppStateProvider } from '../../../state/AppStateContext';
import { useAppState } from '../../../state/useAppState';
import type { FormationFileIO, FormationStorage } from '../../../application/ports';

function noopStorage(json: string | null = null): FormationStorage {
  return { save: vi.fn(), load: vi.fn().mockReturnValue(json) };
}

function fakeFileIO(overrides: Partial<FormationFileIO> = {}): FormationFileIO {
  return { read: vi.fn(), download: vi.fn(), ...overrides };
}

function mockMatchMedia(isMobile: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width') ? isMobile : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function IsDirtyProbe() {
  const state = useAppState();
  return <p data-testid="is-dirty">{String(state.isDirty)}</p>;
}

function memberCountText() {
  return screen.getByTestId('member-count').textContent;
}

function MemberCountProbe() {
  const state = useAppState();
  return <p data-testid="member-count">{state.formation.members.length}</p>;
}

function CameraPresetProbe() {
  const state = useAppState();
  return <p data-testid="camera-preset">{state.cameraPresetId}</p>;
}

describe('OperationsBar', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('幅900px未満では、保存・JSONエクスポート・JSONインポート・カメラの各ボタンにアイコンが表示される（仕様: モバイル表示の操作バー全体）', () => {
    mockMatchMedia(true);
    render(
      <AppStateProvider storage={noopStorage()}>
        <OperationsBar storage={noopStorage()} fileIO={fakeFileIO()} />
      </AppStateProvider>,
    );

    for (const label of ['保存', 'JSONエクスポート', 'JSONインポート', 'カメラ']) {
      const button = screen.getByRole('button', { name: label });
      expect(button.querySelector('svg')).not.toBeNull();
    }
  });

  it('保存ボタンを押すとstorageへ保存しisDirtyをfalseにする（1.5 保存・復元）', async () => {
    const storage = noopStorage();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <AppStateProvider storage={noopStorage(JSON.stringify({ version: 1, members: [] }))}>
        <OperationsBar storage={storage} fileIO={fakeFileIO()} />
        <IsDirtyProbe />
      </AppStateProvider>,
    );

    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(storage.save).toHaveBeenCalledWith(JSON.stringify({ version: 1, members: [] }));
    expect(screen.getByTestId('is-dirty').textContent).toBe('false');
    expect(alertSpy).toHaveBeenCalledWith('保存しました。');
  });

  it('JSONエクスポートボタンを押すとダウンロードさせる（1.5 JSONエクスポート）', async () => {
    const fileIO = fakeFileIO();
    const user = userEvent.setup();
    render(
      <AppStateProvider storage={noopStorage()}>
        <OperationsBar storage={noopStorage()} fileIO={fileIO} />
      </AppStateProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'JSONエクスポート' }));

    expect(fileIO.download).toHaveBeenCalledWith(
      JSON.stringify({ version: 1, members: [] }),
      'formation.json',
    );
  });

  it('正しい形式のファイルを選択するとフォーメーションが置き換わる（1.5 JSONインポート）', async () => {
    const json = JSON.stringify({
      version: 1,
      members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }],
    });
    const fileIO = fakeFileIO({ read: vi.fn().mockResolvedValue(json) });
    const user = userEvent.setup();
    render(
      <AppStateProvider storage={noopStorage()}>
        <OperationsBar storage={noopStorage()} fileIO={fileIO} />
        <MemberCountProbe />
      </AppStateProvider>,
    );

    const file = new File([json], 'formation.json', { type: 'application/json' });
    await user.upload(screen.getByLabelText('JSONインポート'), file);

    expect(memberCountText()).toBe('1');
  });

  it('不正な形式のファイルを選択するとエラーダイアログが表示され、フォーメーションは変更されない（2.4 インポート失敗）', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const fileIO = fakeFileIO({ read: vi.fn().mockResolvedValue('not json') });
    const user = userEvent.setup();
    render(
      <AppStateProvider storage={noopStorage()}>
        <OperationsBar storage={noopStorage()} fileIO={fileIO} />
        <MemberCountProbe />
      </AppStateProvider>,
    );

    const file = new File(['not json'], 'invalid.json', { type: 'application/json' });
    await user.upload(screen.getByLabelText('JSONインポート'), file);

    expect(alertSpy).toHaveBeenCalledWith(
      '不正なファイルです。フォーメーションのJSONファイルを選択してください。',
    );
    expect(memberCountText()).toBe('0');
  });

  it('カメラ位置を切り替えるとcameraPresetIdが変わりisDirtyはfalseのままになる（仕様: カメラ位置の切り替え）', async () => {
    const user = userEvent.setup();
    render(
      <AppStateProvider storage={noopStorage()}>
        <OperationsBar storage={noopStorage()} fileIO={fakeFileIO()} />
        <IsDirtyProbe />
        <CameraPresetProbe />
      </AppStateProvider>,
    );

    expect(screen.getByTestId('camera-preset').textContent).toBe('center');

    await user.click(screen.getByRole('button', { name: '右' }));

    expect(screen.getByTestId('camera-preset').textContent).toBe('right');
    expect(screen.getByTestId('is-dirty').textContent).toBe('false');
  });
});
