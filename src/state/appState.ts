import type { CameraPresetId } from '../domain/cameraPresets';
import { DEFAULT_CAMERA_PRESET_ID } from '../domain/cameraPresets';
import type { DragStep } from '../domain/dragStep';
import { DEFAULT_DRAG_STEP } from '../domain/dragStep';
import type { Show } from '../domain/types';

/** アプリ状態（2.2 アプリ状態）。state の useReducer + Context で一元管理する。 */
export type AppState = {
  show: Show;
  selectedFormationId: string;
  isEditorOpen: boolean;
  isDirty: boolean;
  cameraPresetId: CameraPresetId;
  dragStep: DragStep;
};

export type AppAction =
  | { type: 'REPLACE_SHOW'; show: Show }
  | { type: 'OPEN_EDITOR' }
  | { type: 'CLOSE_EDITOR' }
  | { type: 'MARK_SAVED' }
  | { type: 'SELECT_CAMERA_PRESET'; presetId: CameraPresetId }
  | { type: 'SELECT_DRAG_STEP'; dragStep: DragStep };

export function createInitialAppState(show: Show): AppState {
  return {
    show,
    selectedFormationId: show.formations[0].id,
    isEditorOpen: false,
    isDirty: false,
    cameraPresetId: DEFAULT_CAMERA_PRESET_ID,
    dragStep: DEFAULT_DRAG_STEP,
  };
}
