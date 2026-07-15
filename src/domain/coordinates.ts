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
 * JSON インポート・復元用（1.5 JSON インポートの仮定）。0.05 単位への丸めは行わない。
 */
export function clampPosition(x: number, y: number): { x: number; y: number } {
  const xMeters = clampNumber(toMeters(x, X_AXIS_SCALE), -STAGE_HALF_WIDTH, STAGE_HALF_WIDTH);
  const yMeters = clampNumber(toMeters(y, Y_AXIS_SCALE), 0, STAGE_DEPTH);
  return {
    x: fromMeters(xMeters, X_AXIS_SCALE),
    y: fromMeters(yMeters, Y_AXIS_SCALE),
  };
}

function floorToStep(value: number): number {
  return Number((Math.floor(value * STEPS_PER_UNIT) / STEPS_PER_UNIT).toFixed(2));
}

function ceilToStep(value: number): number {
  return Number((Math.ceil(value * STEPS_PER_UNIT) / STEPS_PER_UNIT).toFixed(2));
}

/** 軸の取りうる値の範囲を、実際の値の大小関係に正規化して求める（direction による向きの違いを吸収する）。 */
function axisDomainBounds(scale: Parameters<typeof fromMeters>[1], meterLow: number, meterHigh: number) {
  const a = fromMeters(meterLow, scale);
  const b = fromMeters(meterHigh, scale);
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  return { low, high, lowAligned: ceilToStep(low), highAligned: floorToStep(high) };
}

const X_BOUNDS = axisDomainBounds(X_AXIS_SCALE, -STAGE_HALF_WIDTH, STAGE_HALF_WIDTH);
const Y_BOUNDS = axisDomainBounds(Y_AXIS_SCALE, 0, STAGE_DEPTH);

function snapWithinBounds(value: number, bounds: ReturnType<typeof axisDomainBounds>): number {
  const snapped = roundToPositionStep(value);
  if (snapped > bounds.high) {
    return bounds.highAligned;
  }
  if (snapped < bounds.low) {
    return bounds.lowAligned;
  }
  return snapped;
}

/**
 * 立ち位置を 0.05 単位に丸めたうえでステージ範囲内に収める（1.5 立ち位置変更）。
 * ステージ端そのものが 0.05 単位でない場合は、端ではなく範囲内に収まる最大/最小の
 * 0.05 単位の値に丸める（ドラッグ・数値入力の共通の丸めルール）。
 */
export function snapPositionWithinStage(x: number, y: number): { x: number; y: number } {
  return {
    x: snapWithinBounds(x, X_BOUNDS),
    y: snapWithinBounds(y, Y_BOUNDS),
  };
}
