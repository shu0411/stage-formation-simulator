import { describe, expect, it } from 'vitest';
import { appReducer } from '../appReducer';
import { createInitialAppState } from '../appState';
import type { AppState } from '../appState';
import type { Show } from '../../domain/types';

function emptyShow(formationId = 'f-1'): Show {
  return {
    members: [],
    formations: [{ id: formationId, name: 'フォーメーション1', positions: {} }],
  };
}

describe('appReducer', () => {
  it('REPLACE_SHOW: 演目を置き換えisDirtyをtrueにする（1.5 JSONインポート、2Dエディター確定）', () => {
    const state = createInitialAppState(emptyShow());
    const imported: Show = {
      members: [{ id: 'id-9', name: 'メンバー9', color: '#ff0000', height: 160 }],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-9': { x: 1, y: 1 } } }],
    };

    const next = appReducer(state, { type: 'REPLACE_SHOW', show: imported });

    expect(next.show).toEqual(imported);
    expect(next.isDirty).toBe(true);
  });

  it('REPLACE_SHOW: 選択中のフォーメーションIDが新しいshowにも存在する場合は維持される', () => {
    const state = createInitialAppState(emptyShow('f-1'));
    const imported: Show = {
      members: [],
      formations: [
        { id: 'f-0', name: 'フォーメーション0', positions: {} },
        { id: 'f-1', name: 'フォーメーション1', positions: {} },
      ],
    };

    const next = appReducer(state, { type: 'REPLACE_SHOW', show: imported });

    expect(next.selectedFormationId).toBe('f-1');
  });

  it('REPLACE_SHOW: 選択中のフォーメーションIDが新しいshowに存在しない場合は先頭にフォールバックする', () => {
    const state = createInitialAppState(emptyShow('f-1'));
    const imported: Show = {
      members: [],
      formations: [{ id: 'f-2', name: 'フォーメーション2', positions: {} }],
    };

    const next = appReducer(state, { type: 'REPLACE_SHOW', show: imported });

    expect(next.selectedFormationId).toBe('f-2');
  });

  it('REPLACE_SHOW: 選択中のカメラ位置は維持される（仕様: カメラ位置の切り替え）', () => {
    const state: AppState = { ...createInitialAppState(emptyShow()), cameraPresetId: 'left' };

    const next = appReducer(state, { type: 'REPLACE_SHOW', show: emptyShow() });

    expect(next.cameraPresetId).toBe('left');
  });

  it('OPEN_EDITOR / CLOSE_EDITOR: ポップアップの開閉状態を切り替える（1.5 2Dエディター表示）', () => {
    const state = createInitialAppState(emptyShow());

    const opened = appReducer(state, { type: 'OPEN_EDITOR' });
    expect(opened.isEditorOpen).toBe(true);

    const closed = appReducer(opened, { type: 'CLOSE_EDITOR' });
    expect(closed.isEditorOpen).toBe(false);
  });

  it('MARK_SAVED: isDirtyをfalseにする（1.5 保存・復元）', () => {
    const state: AppState = { ...createInitialAppState(emptyShow()), isDirty: true };

    const next = appReducer(state, { type: 'MARK_SAVED' });

    expect(next.isDirty).toBe(false);
  });

  it('初期状態のカメラ位置は「中央」である（仕様: カメラ位置の切り替え）', () => {
    const state = createInitialAppState(emptyShow());

    expect(state.cameraPresetId).toBe('center');
  });

  it('SELECT_CAMERA_PRESET: cameraPresetIdを変更し、isDirtyは変更しない（仕様: カメラ位置の切り替え）', () => {
    const state = createInitialAppState(emptyShow());

    const next = appReducer(state, { type: 'SELECT_CAMERA_PRESET', presetId: 'right' });

    expect(next.cameraPresetId).toBe('right');
    expect(next.isDirty).toBe(false);
  });

  it('初期状態の移動幅は0.25である（仕様: 移動幅プルダウン）', () => {
    const state = createInitialAppState(emptyShow());

    expect(state.dragStep).toBe(0.25);
  });

  it('SELECT_DRAG_STEP: dragStepを変更し、isDirtyは変更しない（仕様: 移動幅プルダウン）', () => {
    const state = createInitialAppState(emptyShow());

    const next = appReducer(state, { type: 'SELECT_DRAG_STEP', dragStep: 1 });

    expect(next.dragStep).toBe(1);
    expect(next.isDirty).toBe(false);
  });

  it('REPLACE_SHOW: 選択中の移動幅は維持される（仕様: 移動幅プルダウン）', () => {
    const state: AppState = { ...createInitialAppState(emptyShow()), dragStep: 0.5 };

    const next = appReducer(state, { type: 'REPLACE_SHOW', show: emptyShow() });

    expect(next.dragStep).toBe(0.5);
  });
});
