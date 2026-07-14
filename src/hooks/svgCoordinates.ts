import {
  STAGE_DEPTH,
  STAGE_HALF_DEPTH,
  STAGE_HALF_WIDTH,
  STAGE_WIDTH,
} from '../domain/stageConstants';

/** ステージ SVG の viewBox（1.6 座標系: 中央原点、奥が y 正、SVG は y が下方向に増える）。 */
export const STAGE_VIEW_BOX = {
  minX: -STAGE_HALF_WIDTH,
  minY: -STAGE_HALF_DEPTH,
  width: STAGE_WIDTH,
  height: STAGE_DEPTH,
};

/** ドメインの立ち位置（メートル）を SVG 上の描画座標に変換する。奥（y 正）ほど上に描画する。 */
export function toSvgPoint(x: number, y: number): { x: number; y: number } {
  return { x, y: -y };
}

/**
 * ポインターのクライアント座標を、SVG 要素の表示範囲（rect）と viewBox から
 * ドメインの立ち位置（メートル）に変換する（2.3 ドラッグ座標の変換）。
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
  // `+ 0` は svgY=0 のとき -0 になるのを防ぐ（Object.is で 0 と -0 は区別されるため）
  return { x: svgX, y: -svgY + 0 };
}
