import { describe, expect, it } from 'vitest';
import { clampPosition } from '../coordinates';
import { STAGE_HALF_DEPTH, STAGE_HALF_WIDTH } from '../stageConstants';

describe('clampPosition', () => {
  it('ステージ範囲内の座標はそのまま返す', () => {
    expect(clampPosition(1, -2)).toEqual({ x: 1, y: -2 });
  });

  it('幅方向の範囲を超える座標はステージ端に丸める', () => {
    expect(clampPosition(STAGE_HALF_WIDTH + 10, 0)).toEqual({ x: STAGE_HALF_WIDTH, y: 0 });
    expect(clampPosition(-STAGE_HALF_WIDTH - 10, 0)).toEqual({ x: -STAGE_HALF_WIDTH, y: 0 });
  });

  it('奥行方向の範囲を超える座標はステージ端に丸める', () => {
    expect(clampPosition(0, STAGE_HALF_DEPTH + 10)).toEqual({ x: 0, y: STAGE_HALF_DEPTH });
    expect(clampPosition(0, -STAGE_HALF_DEPTH - 10)).toEqual({ x: 0, y: -STAGE_HALF_DEPTH });
  });

  it('ステージ端そのものの座標はそのまま返す', () => {
    expect(clampPosition(STAGE_HALF_WIDTH, STAGE_HALF_DEPTH)).toEqual({
      x: STAGE_HALF_WIDTH,
      y: STAGE_HALF_DEPTH,
    });
  });
});
