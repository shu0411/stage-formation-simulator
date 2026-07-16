import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppStateProvider } from '../AppStateContext';
import { useAppDispatch, useAppState } from '../useAppState';
import type { FormationStorage } from '../../application/ports';

function createStorage(json: string | null): FormationStorage {
  return { save: vi.fn(), load: vi.fn().mockReturnValue(json) };
}

function TestConsumer() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  return (
    <div>
      <p data-testid="member-count">{state.formation.members.length}</p>
      <p data-testid="is-dirty">{String(state.isDirty)}</p>
      <button
        onClick={() =>
          dispatch({
            type: 'REPLACE_FORMATION',
            formation: {
              members: [
                { id: 'id-1', name: 'メンバー1', x: 0, y: 0, color: '#ff0000', height: 160 },
              ],
            },
          })
        }
      >
        反映
      </button>
    </div>
  );
}

describe('AppStateProvider', () => {
  it('保存データがあれば起動時に復元し、isDirtyはfalseのままにする（1.5 保存・復元）', () => {
    const json = JSON.stringify({
      version: 1,
      members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0, color: '#ff0000', height: 160 }],
    });

    render(
      <AppStateProvider storage={createStorage(json)}>
        <TestConsumer />
      </AppStateProvider>,
    );

    expect(screen.getByTestId('member-count').textContent).toBe('1');
    expect(screen.getByTestId('is-dirty').textContent).toBe('false');
  });

  it('保存データがない場合はメンバー0人の空のステージで開始する（1.5 空状態）', () => {
    render(
      <AppStateProvider storage={createStorage(null)}>
        <TestConsumer />
      </AppStateProvider>,
    );

    expect(screen.getByTestId('member-count').textContent).toBe('0');
  });

  it('保存データが破損している場合も空のステージで開始する（2.4 破損データ）', () => {
    render(
      <AppStateProvider storage={createStorage('not json')}>
        <TestConsumer />
      </AppStateProvider>,
    );

    expect(screen.getByTestId('member-count').textContent).toBe('0');
  });

  it('dispatchした操作が状態に反映される', async () => {
    const user = userEvent.setup();
    render(
      <AppStateProvider storage={createStorage(null)}>
        <TestConsumer />
      </AppStateProvider>,
    );

    await act(async () => {
      await user.click(screen.getByText('反映'));
    });

    expect(screen.getByTestId('member-count').textContent).toBe('1');
    expect(screen.getByTestId('is-dirty').textContent).toBe('true');
  });
});
