import type { Formation } from '../domain/types';

/** アプリ状態（2.2 アプリ状態）。state の useReducer + Context で一元管理する。 */
export type AppState = {
  formation: Formation;
  selectedMemberId: string | null;
  isEditorOpen: boolean;
  isDirty: boolean;
  errorMessage: string | null;
};

export type AppAction =
  | { type: 'ADD_MEMBER'; id: string }
  | { type: 'REMOVE_MEMBER'; id: string }
  | { type: 'MOVE_MEMBER'; id: string; x: number; y: number }
  | { type: 'RENAME_MEMBER'; id: string; name: string }
  | { type: 'REPLACE_FORMATION'; formation: Formation }
  | { type: 'SELECT_MEMBER'; id: string | null }
  | { type: 'OPEN_EDITOR' }
  | { type: 'CLOSE_EDITOR' }
  | { type: 'MARK_SAVED' }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'CLEAR_ERROR' };

export function createInitialAppState(formation: Formation): AppState {
  return {
    formation,
    selectedMemberId: null,
    isEditorOpen: false,
    isDirty: false,
    errorMessage: null,
  };
}
