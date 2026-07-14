import { fromMeters } from './axisScale';
import type { AxisScale } from './axisScale';

const EPSILON = 1e-9;

/**
 * グリッド線を引く位置の値（バミリ番号）を生成する（1.6 グリッド表示、2.1 グリッド線とグリッド番号）。
 * 基準位置（メートル = 0）から 1 単位ずつ両方向に生成し、[minMeters, maxMeters] に収まる位置のみ採用する
 * （境界に届かない端数分は線を引かない）。値の昇順で返す。
 */
export function gridLineValues(scale: AxisScale, minMeters: number, maxMeters: number): number[] {
  const metersValues = [0];
  for (
    let meters = scale.metersPerUnit;
    meters <= maxMeters + EPSILON;
    meters += scale.metersPerUnit
  ) {
    metersValues.push(meters);
  }
  for (
    let meters = -scale.metersPerUnit;
    meters >= minMeters - EPSILON;
    meters -= scale.metersPerUnit
  ) {
    metersValues.push(meters);
  }
  return metersValues.map((meters) => fromMeters(meters, scale)).sort((a, b) => a - b);
}
