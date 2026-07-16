import { describe, expect, it } from 'vitest';
import { appReducer } from '../appReducer';
import { createInitialAppState } from '../appState';
import type { AppState } from '../appState';

describe('appReducer', () => {
  it('REPLACE_FORMATION: フォーメーションを置き換えisDirtyをtrueにする（1.5 JSONインポート、2Dエディター確定）', () => {
    const state = createInitialAppState({ members: [] });
    const imported = {
      members: [{ id: 'id-9', name: 'メンバー9', x: 1, y: 1, color: '#ff0000', height: 160 }],
    };

    const next = appReducer(state, { type: 'REPLACE_FORMATION', formation: imported });

    expect(next.formation).toEqual(imported);
    expect(next.isDirty).toBe(true);
  });

  it('OPEN_EDITOR / CLOSE_EDITOR: ポップアップの開閉状態を切り替える（1.5 2Dエディター表示）', () => {
    const state = createInitialAppState({ members: [] });

    const opened = appReducer(state, { type: 'OPEN_EDITOR' });
    expect(opened.isEditorOpen).toBe(true);

    const closed = appReducer(opened, { type: 'CLOSE_EDITOR' });
    expect(closed.isEditorOpen).toBe(false);
  });

  it('MARK_SAVED: isDirtyをfalseにする（1.5 保存・復元）', () => {
    const state: AppState = { ...createInitialAppState({ members: [] }), isDirty: true };

    const next = appReducer(state, { type: 'MARK_SAVED' });

    expect(next.isDirty).toBe(false);
  });
});
