import { STAGE_HALF_DEPTH, STAGE_HALF_WIDTH } from './stageConstants';

/** 立ち位置をステージ領域内（端を含む）に丸める（1.6 立ち位置の範囲）。 */
export function clampPosition(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.min(STAGE_HALF_WIDTH, Math.max(-STAGE_HALF_WIDTH, x)),
    y: Math.min(STAGE_HALF_DEPTH, Math.max(-STAGE_HALF_DEPTH, y)),
  };
}
