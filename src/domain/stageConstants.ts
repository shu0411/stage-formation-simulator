import type { AxisScale } from './axisScale';

/** ステージ寸法と厚み（1.6 ステージ）。2D・3D の両方がこの定数を参照する。 */
export const STAGE_WIDTH = 11.2;
export const STAGE_DEPTH = 6;
export const STAGE_HALF_WIDTH = STAGE_WIDTH / 2;
export const STAGE_HEIGHT = 0.7;

/**
 * x・y 軸の値（バミリ番号）とメートルの変換設定（1.6 座標系）。
 * x 軸: ステージ中央が 0、右が正、1 単位 0.9m（固定）。
 * y 軸: ステージ手前端が基準値 2、奥へ行くほど減算、1 単位 0.9m（将来変更されうる）。
 */
export const X_AXIS_SCALE: AxisScale = { referenceValue: 0, metersPerUnit: 0.9, direction: 1 };
export const Y_AXIS_SCALE: AxisScale = { referenceValue: 2, metersPerUnit: 0.9, direction: -1 };
