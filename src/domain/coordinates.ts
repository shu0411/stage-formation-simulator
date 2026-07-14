import { fromMeters, toMeters } from './axisScale';
import { STAGE_DEPTH, STAGE_HALF_WIDTH, X_AXIS_SCALE, Y_AXIS_SCALE } from './stageConstants';

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 座標値として扱う最小単位。将来のスナップ対応の布石として、これより細かい値は丸める。 */
const POSITION_STEP = 0.05;
const STEPS_PER_UNIT = 1 / POSITION_STEP;

function roundToPositionStep(value: number): number {
  // 除算ではなく逆数を掛けてから丸めることで浮動小数点誤差を避ける。
  const rounded = Math.round(value * STEPS_PER_UNIT) / STEPS_PER_UNIT;
  const fixed = Number(rounded.toFixed(2));
  return fixed === 0 ? 0 : fixed;
}

/** 立ち位置を 0.05 単位に丸める（1.5 立ち位置変更）。 */
export function snapPosition(x: number, y: number): { x: number; y: number } {
  return { x: roundToPositionStep(x), y: roundToPositionStep(y) };
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
