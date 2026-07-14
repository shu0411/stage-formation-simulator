/**
 * 座標軸の値（バミリ番号）と実距離（メートル）の変換ルール（1.6 座標系、2.1 座標軸の値とメートルの変換）。
 * x・y 軸はこの共通の型を使い、基準値・向きが異なるだけの設定として持つ。
 */
export type AxisScale = {
  /** 基準位置における値 */
  referenceValue: number;
  /** 1 単位あたりのメートル */
  metersPerUnit: number;
  /** 値が増えると基準位置からの距離（メートル）が増える(1)か減る(-1)か */
  direction: 1 | -1;
};

/** 値を基準位置からの符号付き距離（メートル）に変換する。 */
export function toMeters(value: number, scale: AxisScale): number {
  // `+ 0` は基準値のとき -0 になるのを防ぐ（Object.is で 0 と -0 は区別されるため）
  return (value - scale.referenceValue) * scale.metersPerUnit * scale.direction + 0;
}

/** 基準位置からの符号付き距離（メートル）を値に変換する（toMeters の逆変換）。 */
export function fromMeters(meters: number, scale: AxisScale): number {
  return scale.referenceValue + (meters / scale.metersPerUnit) * scale.direction;
}
