import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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

describe('OperationsBar', () => {
  it('保存ボタンを押すとstorageへ保存しisDirtyをfalseにする（1.5 保存・復元）', async () => {
    const storage = noopStorage();
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

  it('不正な形式のファイルを選択するとエラーメッセージが表示され、フォーメーションは変更されない（2.4 インポート失敗）', async () => {
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

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(memberCountText()).toBe('0');
  });
});
