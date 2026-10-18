import { STAGE_DEPTH, STAGE_HEIGHT } from './stageConstants';

/** カメラ位置のプリセット（仕様: カメラ位置の切り替え）。 */
export type CameraPresetId = 'left' | 'center' | 'right' | 'front' | 'back';

type CameraPresetDefinition = {
  id: CameraPresetId;
  /** UI表示名。 */
  label: string;
  /** 左右位置（ステージ中央基準・m。客席から見て右が正）。 */
  lateralPosition: number;
  /** ステージ手前端からの距離（m）。 */
  distanceFromFront: number;
  /** 目線の高さ（客席側の床基準・m）。 */
  eyeHeight: number;
};

/** 表示順。数値はいずれも仮定（仕様: カメラ位置の切り替え）で、目視確認の結果調整されうる。 */
export const CAMERA_PRESETS: CameraPresetDefinition[] = [
  { id: 'left', label: '左', lateralPosition: -8, distanceFromFront: 10, eyeHeight: 6 },
  { id: 'center', label: '中央', lateralPosition: 0, distanceFromFront: 10, eyeHeight: 6 },
  { id: 'right', label: '右', lateralPosition: 8, distanceFromFront: 10, eyeHeight: 6 },
  { id: 'front', label: '前方', lateralPosition: 0, distanceFromFront: 4, eyeHeight: 1.6 },
  { id: 'back', label: '後方', lateralPosition: 0, distanceFromFront: 20, eyeHeight: 8 },
];

export const DEFAULT_CAMERA_PRESET_ID: CameraPresetId = 'center';

/** どのプリセットでも共通の注視点（ステージ中央・天面の1m上）。 */
export const CAMERA_LOOK_AT: [number, number, number] = [0, STAGE_HEIGHT + 1, 0];

/** プリセットの客席位置を3D空間の座標へ写像する（`sceneMapping.ts` と同じ座標系。客席側が+Z）。 */
export function toCameraScenePosition(presetId: CameraPresetId): [number, number, number] {
  const preset = CAMERA_PRESETS.find((candidate) => candidate.id === presetId);
  if (!preset) {
    throw new Error(`Unknown camera preset: ${presetId}`);
  }
  return [preset.lateralPosition, preset.eyeHeight, STAGE_DEPTH / 2 + preset.distanceFromFront];
}
