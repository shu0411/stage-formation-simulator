import { describe, expect, it } from 'vitest';
import { snapPositionWithinStage } from '../coordinates';
import { fromMeters } from '../axisScale';
import { STAGE_DEPTH, STAGE_HALF_WIDTH, X_AXIS_SCALE, Y_AXIS_SCALE } from '../stageConstants';

const X_MAX = fromMeters(STAGE_HALF_WIDTH, X_AXIS_SCALE);
const X_MIN = fromMeters(-STAGE_HALF_WIDTH, X_AXIS_SCALE);
const Y_FRONT = fromMeters(0, Y_AXIS_SCALE);
const Y_BACK = fromMeters(STAGE_DEPTH, Y_AXIS_SCALE);

describe('snapPositionWithinStage', () => {
  it('ちょうど中間の値は切り上げ方向に丸める', () => {
    expect(snapPositionWithinStage(1.025, 0)).toEqual({ x: 1.05, y: 0 });
  });

  it('丸めた結果が0になる場合は-0ではなく0を返す', () => {
    const result = snapPositionWithinStage(-0.01, 0);
    expect(Object.is(result.x, -0)).toBe(false);
    expect(result.x).toBe(0);
  });

  it('ステージ範囲内の0.05単位の座標はそのまま返す', () => {
    expect(snapPositionWithinStage(1, 0)).toEqual({ x: 1, y: 0 });
  });

  it('0.05単位に満たない座標は最も近い0.05単位に丸める', () => {
    expect(snapPositionWithinStage(1.234, -2.777)).toEqual({ x: 1.25, y: -2.8 });
  });

  it('丸めた結果がステージ範囲外になる場合、範囲内に収まる最大の0.05単位の値に丸める（端そのものではない）', () => {
    // X_MAX は 6.2222... なので、端そのもの（丸めなし）ではなく 6.2 になる
    const result = snapPositionWithinStage(6.3, 0);
    expect(result.x).toBeCloseTo(6.2);
    expect(result.x).toBeLessThanOrEqual(X_MAX);
  });

  it('丸めた結果がステージ範囲外になる場合、範囲内に収まる最小の0.05単位の値に丸める（端そのものではない）', () => {
    const result = snapPositionWithinStage(-6.3, 0);
    expect(result.x).toBeCloseTo(-6.2);
    expect(result.x).toBeGreaterThanOrEqual(X_MIN);
  });

  it('奥行方向で範囲外になる場合も、範囲内に収まる0.05単位の値に丸める', () => {
    // Y_BACK は -4.6666... なので、範囲内に収まる -4.65 になる
    const back = snapPositionWithinStage(0, Y_BACK - 1);
    expect(back.y).toBeCloseTo(-4.65);
    expect(back.y).toBeGreaterThanOrEqual(Y_BACK);

    // Y_FRONT は 2 で既に0.05単位のため、端そのものになる
    const front = snapPositionWithinStage(0, Y_FRONT + 1);
    expect(front.y).toBeCloseTo(Y_FRONT);
  });
});
