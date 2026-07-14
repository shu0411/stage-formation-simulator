import { fromMeters, toMeters } from '../domain/axisScale';
import {
  STAGE_DEPTH,
  STAGE_HALF_WIDTH,
  STAGE_WIDTH,
  X_AXIS_SCALE,
  Y_AXIS_SCALE,
} from '../domain/stageConstants';

/** グリッド番号（1.6 グリッド表示）を表示する、ステージ本体の外側の余白（メートル相当）。 */
export const AXIS_LABEL_MARGIN = 1;

/** ステージ本体（枠線・グリッド）の描画範囲（メートル。手前が下、中央原点は x のみ）。 */
export const STAGE_RECT = {
  minX: -STAGE_HALF_WIDTH,
  minY: 0,
  width: STAGE_WIDTH,
  height: STAGE_DEPTH,
};

/** ステージ SVG の viewBox（2.1: グリッド番号表示のため、ステージ本体の外側に余白を持つ）。 */
export const STAGE_VIEW_BOX = {
  minX: STAGE_RECT.minX - AXIS_LABEL_MARGIN,
  minY: STAGE_RECT.minY,
  width: STAGE_RECT.width + AXIS_LABEL_MARGIN * 2,
  height: STAGE_RECT.height + AXIS_LABEL_MARGIN,
};

/**
 * ドメインの立ち位置（バミリ番号）を SVG 上の描画座標（メートル相当）に変換する。
 * x はメートルに変換してそのまま、y は手前端からの距離に変換し、手前ほど下（SVG の y が大きい）
 * になるよう反転する（1.6 座標系）。
 */
export function toSvgPoint(x: number, y: number): { x: number; y: number } {
  const svgX = toMeters(x, X_AXIS_SCALE);
  const distanceFromFront = toMeters(y, Y_AXIS_SCALE);
  return { x: svgX, y: STAGE_DEPTH - distanceFromFront };
}

/**
 * ポインターのクライアント座標を、SVG 要素の表示範囲（rect）と viewBox から
 * ドメインの立ち位置（バミリ番号）に変換する（2.3 ドラッグ座標の変換）。
 */
export function clientPointToDomain(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): { x: number; y: number } {
  const fracX = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
  const fracY = rect.height === 0 ? 0 : (clientY - rect.top) / rect.height;
  const svgX = STAGE_VIEW_BOX.minX + fracX * STAGE_VIEW_BOX.width;
  const svgY = STAGE_VIEW_BOX.minY + fracY * STAGE_VIEW_BOX.height;
  const distanceFromFront = STAGE_DEPTH - svgY;
  return { x: fromMeters(svgX, X_AXIS_SCALE), y: fromMeters(distanceFromFront, Y_AXIS_SCALE) };
}
