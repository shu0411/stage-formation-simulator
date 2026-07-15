import { addMember, moveMember, removeMember, renameMember } from '../domain/memberOperations';
import type { AppAction, AppState } from './appState';

/** アプリ状態の reducer（2.3 処理・データフロー）。domain のロジックで新しい状態を生成する。 */
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_MEMBER':
      return {
        ...state,
        formation: addMember(state.formation, action.id),
        selectedMemberId: action.id,
        isDirty: true,
      };

    case 'REMOVE_MEMBER':
      return {
        ...state,
        formation: removeMember(state.formation, action.id),
        selectedMemberId: state.selectedMemberId === action.id ? null : state.selectedMemberId,
        isDirty: true,
      };

    case 'MOVE_MEMBER':
      return {
        ...state,
        formation: moveMember(state.formation, action.id, action.x, action.y),
        isDirty: true,
      };

    case 'RENAME_MEMBER':
      return {
        ...state,
        formation: renameMember(state.formation, action.id, action.name),
        isDirty: true,
      };

    case 'REPLACE_FORMATION':
      return { ...state, formation: action.formation, isDirty: true };

    case 'SELECT_MEMBER':
      return { ...state, selectedMemberId: action.id };

    case 'OPEN_EDITOR':
      return { ...state, isEditorOpen: true };

    case 'CLOSE_EDITOR':
      return { ...state, isEditorOpen: false };

    case 'MARK_SAVED':
      return { ...state, isDirty: false };
  }
}
