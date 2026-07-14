import { toMeters } from './axisScale';
import { STAGE_DEPTH, STAGE_HEIGHT, X_AXIS_SCALE, Y_AXIS_SCALE } from './stageConstants';

/**
 * 2D の立ち位置（バミリ番号）を 3D 空間の座標へ写像する（2.2 3D空間への写像）。
 * x はメートルに変換して X 軸へ、y は手前端からの距離に変換して奥行の中心を基準に反転し Z 軸へ写像する
 * （客席側を +Z）。ステージ天面は Y=STAGE_HEIGHT とし、メンバーは常にこの高さに配置する。
 */
export function toScenePosition(position: { x: number; y: number }): [number, number, number] {
  const x = toMeters(position.x, X_AXIS_SCALE);
  const distanceFromFront = toMeters(position.y, Y_AXIS_SCALE);
  const z = STAGE_DEPTH / 2 - distanceFromFront;
  return [x, STAGE_HEIGHT, z];
}
