import { fromMeters } from './axisScale';
import { STAGE_DEPTH, STAGE_HALF_WIDTH, X_AXIS_SCALE, Y_AXIS_SCALE } from './stageConstants';

/** 座標値として扱う最小単位（丸めの既定値）。立ち位置変更・JSONインポートはこの単位で丸める。 */
const DEFAULT_POSITION_STEP = 0.05;

function roundToStep(value: number, step: number): number {
  // 除算ではなく逆数を掛けてから丸めることで浮動小数点誤差を避ける。
  const stepsPerUnit = 1 / step;
  const rounded = Math.round(value * stepsPerUnit) / stepsPerUnit;
  const fixed = Number(rounded.toFixed(2));
  return fixed === 0 ? 0 : fixed;
}

function floorToStep(value: number, step: number): number {
  const stepsPerUnit = 1 / step;
  return Number((Math.floor(value * stepsPerUnit) / stepsPerUnit).toFixed(2));
}

function ceilToStep(value: number, step: number): number {
  const stepsPerUnit = 1 / step;
  return Number((Math.ceil(value * stepsPerUnit) / stepsPerUnit).toFixed(2));
}

/** 軸の取りうる値の範囲を、実際の値の大小関係に正規化して求める（direction による向きの違いを吸収する）。 */
function axisDomainBounds(
  scale: Parameters<typeof fromMeters>[1],
  meterLow: number,
  meterHigh: number,
  step: number,
) {
  const a = fromMeters(meterLow, scale);
  const b = fromMeters(meterHigh, scale);
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  return { low, high, lowAligned: ceilToStep(low, step), highAligned: floorToStep(high, step) };
}

function snapWithinBounds(
  value: number,
  bounds: ReturnType<typeof axisDomainBounds>,
  step: number,
): number {
  const snapped = roundToStep(value, step);
  if (snapped > bounds.high) {
    return bounds.highAligned;
  }
  if (snapped < bounds.low) {
    return bounds.lowAligned;
  }
  return snapped;
}

/**
 * 立ち位置を指定した単位（省略時は 0.05）に丸めたうえでステージ範囲内に収める
 * （1.5 立ち位置変更・JSON インポート共通の丸めルール、仕様: 移動単位トグルの吸着）。
 * ステージ端そのものが指定単位の倍数でない場合は、端ではなく範囲内に収まる
 * 最大/最小の単位の値に丸める。
 */
export function snapPositionWithinStage(
  x: number,
  y: number,
  step: number = DEFAULT_POSITION_STEP,
): { x: number; y: number } {
  const xBounds = axisDomainBounds(X_AXIS_SCALE, -STAGE_HALF_WIDTH, STAGE_HALF_WIDTH, step);
  const yBounds = axisDomainBounds(Y_AXIS_SCALE, 0, STAGE_DEPTH, step);
  return {
    x: snapWithinBounds(x, xBounds, step),
    y: snapWithinBounds(y, yBounds, step),
  };
}
