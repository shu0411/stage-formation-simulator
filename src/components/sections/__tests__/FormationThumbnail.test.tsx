import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormationThumbnail } from '../FormationThumbnail';
import { AppStateProvider } from '../../../state/AppStateContext';
import { useAppState } from '../../../state/useAppState';
import type { FormationStorage } from '../../../application/ports';

function noopStorage(): FormationStorage {
  return { save: vi.fn(), load: vi.fn().mockReturnValue(null) };
}

function EditorOpenProbe() {
  const state = useAppState();
  return <p data-testid="is-editor-open">{String(state.isEditorOpen)}</p>;
}

describe('FormationThumbnail', () => {
  it('クリックすると2D編集ポップアップを開く操作を発行する（1.4 利用の流れ）', async () => {
    const user = userEvent.setup();
    render(
      <AppStateProvider storage={noopStorage()}>
        <FormationThumbnail />
        <EditorOpenProbe />
      </AppStateProvider>,
    );

    expect(screen.getByTestId('is-editor-open').textContent).toBe('false');
    await user.click(screen.getByLabelText('2D編集ポップアップを開く'));
    expect(screen.getByTestId('is-editor-open').textContent).toBe('true');
  });

  it('現在のフォーメーションの俯瞰図を表示する（1.5 2Dエディター表示）', () => {
    render(
      <AppStateProvider storage={noopStorage()}>
        <FormationThumbnail />
      </AppStateProvider>,
    );

    expect(screen.getByRole('img', { name: 'ステージの俯瞰図' })).toBeInTheDocument();
  });
});
