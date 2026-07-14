import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';
import { AppStateProvider } from '../state/AppStateContext';
import type { FormationFileIO, FormationStorage } from '../application/ports';

// R3F の Canvas は WebGL/ResizeObserver を必要とし jsdom では描画できないため、
// 3D の見た目は自動テストの対象外とする（2.5・2.7）。App のレイアウト結線のみを検証する。
vi.mock('../components/sections/FormationView3D', () => ({
  FormationView3D: () => <div data-testid="formation-view-3d-stub" />,
}));

function noopStorage(): FormationStorage {
  return { save: vi.fn(), load: vi.fn().mockReturnValue(null) };
}

function noopFileIO(): FormationFileIO {
  return { read: vi.fn(), download: vi.fn() };
}

function renderApp() {
  const storage = noopStorage();
  return render(
    <AppStateProvider storage={storage}>
      <App storage={storage} fileIO={noopFileIO()} />
    </AppStateProvider>,
  );
}

describe('App', () => {
  it('初期状態では2D編集ポップアップは表示されない（1.4 画面・操作フロー）', () => {
    renderApp();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('サムネイルをクリックすると2D編集ポップアップが開き、閉じる操作で閉じる（1.5 2Dエディター表示）', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByLabelText('2D編集ポップアップを開く'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '閉じる' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
