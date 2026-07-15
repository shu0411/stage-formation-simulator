import type { Formation } from '../domain/types';

/** アプリ状態（2.2 アプリ状態）。state の useReducer + Context で一元管理する。 */
export type AppState = {
  formation: Formation;
  isEditorOpen: boolean;
  isDirty: boolean;
};

export type AppAction =
  | { type: 'REPLACE_FORMATION'; formation: Formation }
  | { type: 'OPEN_EDITOR' }
  | { type: 'CLOSE_EDITOR' }
  | { type: 'MARK_SAVED' };

export function createInitialAppState(formation: Formation): AppState {
  return {
    formation,
    isEditorOpen: false,
    isDirty: false,
  };
}
