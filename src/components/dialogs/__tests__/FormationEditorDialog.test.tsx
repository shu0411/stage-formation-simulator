import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormationEditorDialog } from '../FormationEditorDialog';
import { AppStateProvider } from '../../../state/AppStateContext';
import { useAppDispatch, useAppState } from '../../../state/useAppState';
import type { FormationStorage } from '../../../application/ports';

function noopStorage(json: string | null = null): FormationStorage {
  return { save: vi.fn(), load: vi.fn().mockReturnValue(json) };
}

function OpenEditorOnMount() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch({ type: 'OPEN_EDITOR' });
  }, [dispatch]);
  return null;
}

function IsEditorOpenProbe() {
  const state = useAppState();
  return <p data-testid="is-editor-open">{String(state.isEditorOpen)}</p>;
}

function renderDialog(json: string | null = null) {
  return render(
    <AppStateProvider storage={noopStorage(json)}>
      <OpenEditorOnMount />
      <IsEditorOpenProbe />
      <FormationEditorDialog />
    </AppStateProvider>,
  );
}

describe('FormationEditorDialog', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('isEditorOpenがfalseのときは何も表示しない（1.5 2Dエディター表示）', () => {
    render(
      <AppStateProvider storage={noopStorage()}>
        <FormationEditorDialog />
      </AppStateProvider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('閉じる操作をすると元の画面に戻り、編集内容は保持される', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'メンバーを追加' }));
    expect(screen.getByRole('img', { name: 'ステージの俯瞰図' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '閉じる' }));

    expect(screen.getByTestId('is-editor-open').textContent).toBe('false');
  });

  describe('メンバー追加', () => {
    it('メンバーが0人のとき、追加操作でステージ中央に「メンバー1」が1人配置される', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'メンバーを追加' }));

      expect(screen.getByTestId(/^member-/)).toBeInTheDocument();
    });
  });

  describe('メンバー削除', () => {
    function formationJsonWithOneMember() {
      return JSON.stringify({
        version: 1,
        members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }],
      });
    }

    it('どのメンバーも選択していないとき、削除操作は実行できない', () => {
      renderDialog(formationJsonWithOneMember());

      expect(screen.getByRole('button', { name: '削除' })).toBeDisabled();
    });

    it('確認ダイアログで承認すると、選択中のメンバーが削除される', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();
      renderDialog(formationJsonWithOneMember());

      await user.click(screen.getByTestId('member-id-1'));
      await user.click(screen.getByRole('button', { name: '削除' }));

      expect(screen.queryByTestId('member-id-1')).not.toBeInTheDocument();
    });

    it('確認ダイアログでキャンセルすると、メンバーは削除されない', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const user = userEvent.setup();
      renderDialog(formationJsonWithOneMember());

      await user.click(screen.getByTestId('member-id-1'));
      await user.click(screen.getByRole('button', { name: '削除' }));

      expect(screen.getByTestId('member-id-1')).toBeInTheDocument();
    });
  });

  describe('メンバー名編集', () => {
    function formationJsonWithOneMember() {
      return JSON.stringify({
        version: 1,
        members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }],
      });
    }

    it('メンバーを選択して名前を入力・確定すると、名前表示が新しい名前になる', async () => {
      const user = userEvent.setup();
      renderDialog(formationJsonWithOneMember());

      await user.click(screen.getByTestId('member-id-1'));
      const input = screen.getByLabelText('メンバー名');
      await user.clear(input);
      await user.type(input, 'あいり');
      await user.tab();

      expect(screen.getByLabelText('メンバー名')).toHaveValue('あいり');
    });

    it('名前を空文字で確定すると、名前は変更されず元のままになる', async () => {
      const user = userEvent.setup();
      renderDialog(formationJsonWithOneMember());

      await user.click(screen.getByTestId('member-id-1'));
      const input = screen.getByLabelText('メンバー名');
      await user.clear(input);
      await user.tab();

      expect(screen.getByLabelText('メンバー名')).toHaveValue('メンバー1');
    });
  });
});
