import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorMessage } from '../ErrorMessage';
import { AppStateProvider } from '../../../state/AppStateContext';
import { useAppDispatch } from '../../../state/useAppState';
import type { FormationStorage } from '../../../application/ports';

function noopStorage(): FormationStorage {
  return { save: vi.fn(), load: vi.fn().mockReturnValue(null) };
}

function SetErrorOnMount({ message }: { message: string }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch({ type: 'SET_ERROR', message });
  }, [dispatch, message]);
  return null;
}

describe('ErrorMessage', () => {
  it('エラーがないときは何も表示しない', () => {
    render(
      <AppStateProvider storage={noopStorage()}>
        <ErrorMessage />
      </AppStateProvider>,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('エラーメッセージを表示する（2.4 インポート失敗）', () => {
    render(
      <AppStateProvider storage={noopStorage()}>
        <SetErrorOnMount message="不正なファイルです" />
        <ErrorMessage />
      </AppStateProvider>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('不正なファイルです');
  });

  it('閉じる操作でエラーメッセージが消える', async () => {
    const user = userEvent.setup();
    render(
      <AppStateProvider storage={noopStorage()}>
        <SetErrorOnMount message="不正なファイルです" />
        <ErrorMessage />
      </AppStateProvider>,
    );

    await user.click(screen.getByLabelText('エラーメッセージを閉じる'));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
