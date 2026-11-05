import type { CameraPresetId } from '../domain/cameraPresets';
import { DEFAULT_CAMERA_PRESET_ID } from '../domain/cameraPresets';
import type { DragStep } from '../domain/dragStep';
import { DEFAULT_DRAG_STEP } from '../domain/dragStep';
import type { Formation } from '../domain/types';

/** アプリ状態（2.2 アプリ状態）。state の useReducer + Context で一元管理する。 */
export type AppState = {
  formation: Formation;
  isEditorOpen: boolean;
  isDirty: boolean;
  cameraPresetId: CameraPresetId;
  dragStep: DragStep;
};

export type AppAction =
  | { type: 'REPLACE_FORMATION'; formation: Formation }
  | { type: 'OPEN_EDITOR' }
  | { type: 'CLOSE_EDITOR' }
  | { type: 'MARK_SAVED' }
  | { type: 'SELECT_CAMERA_PRESET'; presetId: CameraPresetId }
  | { type: 'SELECT_DRAG_STEP'; dragStep: DragStep };

export function createInitialAppState(formation: Formation): AppState {
  return {
    formation,
    isEditorOpen: false,
    isDirty: false,
    cameraPresetId: DEFAULT_CAMERA_PRESET_ID,
    dragStep: DEFAULT_DRAG_STEP,
  };
}
