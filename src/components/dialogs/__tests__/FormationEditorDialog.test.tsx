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

function FormationMemberCountProbe() {
  const state = useAppState();
  return <p data-testid="formation-member-count">{state.formation.members.length}</p>;
}

function renderDialog(json: string | null = null) {
  return render(
    <AppStateProvider storage={noopStorage(json)}>
      <OpenEditorOnMount />
      <IsEditorOpenProbe />
      <FormationMemberCountProbe />
      <FormationEditorDialog />
    </AppStateProvider>,
  );
}

function clickBackdrop() {
  const backdrop = document.querySelector('.MuiModal-backdrop');
  if (backdrop === null) {
    throw new Error('backdrop element not found');
  }
  return userEvent.click(backdrop);
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

  it('確定ボタンを押すと編集内容がアプリ全体の状態へ反映され、ダイアログが閉じる（2.3 編集セッションと確定・破棄）', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'メンバーを追加' }));
    await user.click(screen.getByRole('button', { name: '確定' }));

    expect(screen.getByTestId('is-editor-open').textContent).toBe('false');
    expect(screen.getByTestId('formation-member-count').textContent).toBe('1');
  });

  it('キャンセルボタンを押すと編集内容は反映されずダイアログが閉じる（2.3 編集セッションと確定・破棄）', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'メンバーを追加' }));
    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(screen.getByTestId('is-editor-open').textContent).toBe('false');
    expect(screen.getByTestId('formation-member-count').textContent).toBe('0');
  });

  describe('ダイアログ外クリック・Escapeキーでの破棄（2.3 編集セッションと確定・破棄）', () => {
    it('編集していない状態でダイアログ外をクリックすると、確認なしに閉じる', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm');
      renderDialog();

      await clickBackdrop();

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(screen.getByTestId('is-editor-open').textContent).toBe('false');
    });

    it('編集した状態でダイアログ外をクリックすると確認ダイアログが表示され、承認すると反映せずに閉じる', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'メンバーを追加' }));
      await clickBackdrop();

      expect(screen.getByTestId('is-editor-open').textContent).toBe('false');
      expect(screen.getByTestId('formation-member-count').textContent).toBe('0');
    });

    it('確認ダイアログでキャンセルすると、ダイアログは閉じず編集内容も保持される', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'メンバーを追加' }));
      await clickBackdrop();

      expect(screen.getByTestId('is-editor-open').textContent).toBe('true');
      expect(screen.getByTestId(/^member-/)).toBeInTheDocument();
    });

    it('編集した状態でEscapeキーを押すと、ダイアログ外クリックと同様に確認のうえ閉じる', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'メンバーを追加' }));
      await user.keyboard('{Escape}');

      expect(screen.getByTestId('is-editor-open').textContent).toBe('false');
      expect(screen.getByTestId('formation-member-count').textContent).toBe('0');
    });
  });

  describe('メンバー追加', () => {
    it('メンバーが0人のとき、追加操作で原点に「メンバー1」が1人配置される', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'メンバーを追加' }));

      expect(screen.getByTestId(/^member-/)).toBeInTheDocument();
    });

    it('追加したメンバーが選択状態になり、原点の座標がフォームに表示される（1.6 メンバーの選択）', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'メンバーを追加' }));

      expect(screen.getByLabelText('メンバー名')).toHaveValue('メンバー1');
      expect(screen.getByLabelText('左右')).toHaveValue('0');
      expect(screen.getByLabelText('前後')).toHaveValue('0');
    });
  });

  describe('メンバー選択（プルダウン）', () => {
    function formationJsonWithTwoMembers() {
      return JSON.stringify({
        version: 1,
        members: [
          { id: 'id-1', name: 'メンバー1', x: 0, y: 0 },
          { id: 'id-2', name: 'メンバー2', x: 1, y: 1 },
        ],
      });
    }

    it('メンバーがいないとき、プルダウンは無効化される', () => {
      renderDialog();

      expect(screen.getByLabelText('メンバーを選択')).toHaveAttribute('aria-disabled', 'true');
    });

    it('プルダウンでメンバーを選ぶと、そのメンバーが選択状態になる（1.6 メンバーの選択）', async () => {
      const user = userEvent.setup();
      renderDialog(formationJsonWithTwoMembers());

      await user.click(screen.getByLabelText('メンバーを選択'));
      await user.click(screen.getByRole('option', { name: 'メンバー2' }));

      expect(screen.getByLabelText('メンバー名')).toHaveValue('メンバー2');
      expect(screen.getByLabelText('左右')).toHaveValue('1');
      expect(screen.getByLabelText('前後')).toHaveValue('1');
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

  describe('立ち位置変更（数値入力）', () => {
    function formationJsonWithOneMember() {
      return JSON.stringify({
        version: 1,
        members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }],
      });
    }

    it('メンバーが未選択のとき、座標の数値入力欄は無効化される', () => {
      renderDialog(formationJsonWithOneMember());

      expect(screen.getByLabelText('左右')).toBeDisabled();
      expect(screen.getByLabelText('前後')).toBeDisabled();
    });

    it('メンバーを選択すると、数値入力欄にそのメンバーの現在の座標が表示される', async () => {
      const user = userEvent.setup();
      renderDialog(formationJsonWithOneMember());

      await user.click(screen.getByTestId('member-id-1'));

      expect(screen.getByLabelText('左右')).toHaveValue('0');
      expect(screen.getByLabelText('前後')).toHaveValue('0');
    });

    it('数値入力欄に値を入力して確定すると、2Dエディター内の座標が変わる', async () => {
      const user = userEvent.setup();
      renderDialog(formationJsonWithOneMember());

      await user.click(screen.getByTestId('member-id-1'));
      const input = screen.getByLabelText('左右');
      await user.clear(input);
      await user.type(input, '3');
      await user.tab();

      expect(screen.getByLabelText('左右')).toHaveValue('3');
    });

    it('数値入力欄に不正な値（空文字）を入力して確定すると、座標は変更されず元の値のままになる', async () => {
      const user = userEvent.setup();
      renderDialog(formationJsonWithOneMember());

      await user.click(screen.getByTestId('member-id-1'));
      const input = screen.getByLabelText('左右');
      await user.clear(input);
      await user.tab();

      expect(screen.getByLabelText('左右')).toHaveValue('0');
    });

    it('数値入力欄の増加ボタンをクリックすると、クリックのたびに座標が反映される', async () => {
      const user = userEvent.setup();
      renderDialog(formationJsonWithOneMember());

      await user.click(screen.getByTestId('member-id-1'));
      await user.click(screen.getByRole('button', { name: '上手へ' }));

      expect(screen.getByLabelText('左右')).toHaveValue('0.05');
    });
  });
});
