import { describe, expect, it } from 'vitest';
import { appReducer } from '../appReducer';
import { createInitialAppState } from '../appState';
import { fromMeters } from '../../domain/axisScale';
import { STAGE_HALF_WIDTH, X_AXIS_SCALE } from '../../domain/stageConstants';
import type { AppState } from '../appState';

describe('appReducer', () => {
  it('ADD_MEMBER: メンバーを追加しisDirtyをtrueにする（1.5 メンバー追加）', () => {
    const state = createInitialAppState({ members: [] });

    const next = appReducer(state, { type: 'ADD_MEMBER', id: 'id-1' });

    expect(next.formation.members).toHaveLength(1);
    expect(next.formation.members[0]).toMatchObject({ id: 'id-1', name: 'メンバー1' });
    expect(next.isDirty).toBe(true);
  });

  it('ADD_MEMBER: 追加したメンバーを選択状態にする（1.5 メンバー追加、1.6 メンバーの選択）', () => {
    const state = createInitialAppState({
      members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }],
    });

    const next = appReducer(state, { type: 'ADD_MEMBER', id: 'id-2' });

    expect(next.selectedMemberId).toBe('id-2');
  });

  it('REMOVE_MEMBER: メンバーを削除しisDirtyをtrueにする（1.5 メンバー削除）', () => {
    const state: AppState = {
      ...createInitialAppState({ members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }] }),
    };

    const next = appReducer(state, { type: 'REMOVE_MEMBER', id: 'id-1' });

    expect(next.formation.members).toEqual([]);
    expect(next.isDirty).toBe(true);
  });

  it('REMOVE_MEMBER: 選択中のメンバーを削除すると選択が解除される', () => {
    const state: AppState = {
      ...createInitialAppState({ members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }] }),
      selectedMemberId: 'id-1',
    };

    const next = appReducer(state, { type: 'REMOVE_MEMBER', id: 'id-1' });

    expect(next.selectedMemberId).toBeNull();
  });

  it('REMOVE_MEMBER: 選択中でないメンバーを削除しても選択は解除されない', () => {
    const state: AppState = {
      ...createInitialAppState({
        members: [
          { id: 'id-1', name: 'メンバー1', x: 0, y: 0 },
          { id: 'id-2', name: 'メンバー2', x: 0, y: 0 },
        ],
      }),
      selectedMemberId: 'id-2',
    };

    const next = appReducer(state, { type: 'REMOVE_MEMBER', id: 'id-1' });

    expect(next.selectedMemberId).toBe('id-2');
  });

  it('MOVE_MEMBER: 立ち位置を更新しisDirtyをtrueにする（1.5 立ち位置変更）', () => {
    const state = createInitialAppState({
      members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }],
    });

    const next = appReducer(state, { type: 'MOVE_MEMBER', id: 'id-1', x: 100, y: 0 });

    // ステージ端(fromMeters(STAGE_HALF_WIDTH, X_AXIS_SCALE) = 6.2222...)は0.05単位でないため、
    // 範囲内に収まる6.2に丸められる（domain/coordinates.ts の snapPositionWithinStage）。
    expect(next.formation.members[0].x).toBeCloseTo(6.2);
    expect(next.formation.members[0].x).toBeLessThanOrEqual(fromMeters(STAGE_HALF_WIDTH, X_AXIS_SCALE));
    expect(next.isDirty).toBe(true);
  });

  it('RENAME_MEMBER: 名前を更新しisDirtyをtrueにする（1.5 メンバー名編集）', () => {
    const state = createInitialAppState({
      members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }],
    });

    const next = appReducer(state, { type: 'RENAME_MEMBER', id: 'id-1', name: 'あいり' });

    expect(next.formation.members[0].name).toBe('あいり');
    expect(next.isDirty).toBe(true);
  });

  it('REPLACE_FORMATION: フォーメーションを置き換えisDirtyをtrueにする（1.5 JSONインポート）', () => {
    const state = createInitialAppState({ members: [] });
    const imported = { members: [{ id: 'id-9', name: 'メンバー9', x: 1, y: 1 }] };

    const next = appReducer(state, { type: 'REPLACE_FORMATION', formation: imported });

    expect(next.formation).toEqual(imported);
    expect(next.isDirty).toBe(true);
  });

  it('SELECT_MEMBER: 選択中メンバーを更新する（isDirtyは変化しない、1.6 メンバーの選択）', () => {
    const state = createInitialAppState({ members: [] });

    const next = appReducer(state, { type: 'SELECT_MEMBER', id: 'id-1' });

    expect(next.selectedMemberId).toBe('id-1');
    expect(next.isDirty).toBe(false);
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

  it('SET_ERROR / CLEAR_ERROR: エラーメッセージを設定・クリアする（2.4 インポート失敗）', () => {
    const state = createInitialAppState({ members: [] });

    const withError = appReducer(state, { type: 'SET_ERROR', message: '不正なファイルです' });
    expect(withError.errorMessage).toBe('不正なファイルです');

    const cleared = appReducer(withError, { type: 'CLEAR_ERROR' });
    expect(cleared.errorMessage).toBeNull();
  });

  it('エラー表示中に別の操作をすると、その操作と同時にエラーメッセージがクリアされる（2.4 インポート失敗）', () => {
    const state: AppState = {
      ...createInitialAppState({ members: [] }),
      errorMessage: '不正なファイルです',
    };

    const next = appReducer(state, { type: 'ADD_MEMBER', id: 'id-1' });

    expect(next.errorMessage).toBeNull();
    expect(next.formation.members).toHaveLength(1);
  });
});
