import type { AppAction, AppState } from './appState';

/** アプリ状態の reducer（2.3 処理・データフロー）。domain のロジックで新しい状態を生成する。 */
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'REPLACE_FORMATION':
      return { ...state, formation: action.formation, isDirty: true };

    case 'OPEN_EDITOR':
      return { ...state, isEditorOpen: true };

    case 'CLOSE_EDITOR':
      return { ...state, isEditorOpen: false };

    case 'MARK_SAVED':
      return { ...state, isDirty: false };
  }
}
