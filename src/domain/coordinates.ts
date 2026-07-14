import { fromMeters, toMeters } from './axisScale';
import { STAGE_DEPTH, STAGE_HALF_WIDTH, X_AXIS_SCALE, Y_AXIS_SCALE } from './stageConstants';

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * 立ち位置をステージ領域内（端を含む）に丸める（1.6 立ち位置の範囲）。
 * 値をメートルに変換してからステージの物理範囲でクランプし、値に戻す（2.1 座標軸の値とメートルの変換）。
 */
export function clampPosition(x: number, y: number): { x: number; y: number } {
  const xMeters = clampNumber(toMeters(x, X_AXIS_SCALE), -STAGE_HALF_WIDTH, STAGE_HALF_WIDTH);
  const yMeters = clampNumber(toMeters(y, Y_AXIS_SCALE), 0, STAGE_DEPTH);
  return {
    x: fromMeters(xMeters, X_AXIS_SCALE),
    y: fromMeters(yMeters, Y_AXIS_SCALE),
  };
}
