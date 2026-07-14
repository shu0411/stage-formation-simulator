import { describe, expect, it } from 'vitest';
import { clampPosition } from '../coordinates';
import { fromMeters } from '../axisScale';
import { STAGE_DEPTH, STAGE_HALF_WIDTH, X_AXIS_SCALE, Y_AXIS_SCALE } from '../stageConstants';

const X_MAX = fromMeters(STAGE_HALF_WIDTH, X_AXIS_SCALE);
const X_MIN = fromMeters(-STAGE_HALF_WIDTH, X_AXIS_SCALE);
const Y_FRONT = fromMeters(0, Y_AXIS_SCALE);
const Y_BACK = fromMeters(STAGE_DEPTH, Y_AXIS_SCALE);

describe('clampPosition', () => {
  it('ステージ範囲内の座標はそのまま返す', () => {
    expect(clampPosition(1, 0)).toEqual({ x: 1, y: 0 });
  });

  it('幅方向の範囲を超える座標はステージ端に丸める', () => {
    expect(clampPosition(X_MAX + 10, 0)).toEqual({ x: X_MAX, y: 0 });
    expect(clampPosition(X_MIN - 10, 0)).toEqual({ x: X_MIN, y: 0 });
  });

  it('奥行方向の範囲を超える座標はステージ端に丸める（手前端・奥端）', () => {
    const front = clampPosition(0, Y_FRONT + 10);
    expect(front.y).toBeCloseTo(Y_FRONT);
    const back = clampPosition(0, Y_BACK - 10);
    expect(back.y).toBeCloseTo(Y_BACK);
  });

  it('ステージ端そのものの座標はそのまま返す', () => {
    const result = clampPosition(X_MAX, Y_FRONT);
    expect(result.x).toBeCloseTo(X_MAX);
    expect(result.y).toBeCloseTo(Y_FRONT);
  });
});
