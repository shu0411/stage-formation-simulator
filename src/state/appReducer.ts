import type { AppAction, AppState } from './appState';

/** アプリ状態の reducer（2.3 処理・データフロー）。domain のロジックで新しい状態を生成する。 */
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'REPLACE_SHOW': {
      const selectionStillExists = action.show.formations.some(
        (formation) => formation.id === state.selectedFormationId,
      );
      return {
        ...state,
        show: action.show,
        selectedFormationId: selectionStillExists
          ? state.selectedFormationId
          : action.show.formations[0].id,
        isDirty: true,
      };
    }

    case 'OPEN_EDITOR':
      return { ...state, isEditorOpen: true };

    case 'CLOSE_EDITOR':
      return { ...state, isEditorOpen: false };

    case 'MARK_SAVED':
      return { ...state, isDirty: false };

    case 'SELECT_CAMERA_PRESET':
      return { ...state, cameraPresetId: action.presetId };

    case 'SELECT_DRAG_STEP':
      return { ...state, dragStep: action.dragStep };
  }
}
