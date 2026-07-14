import { describe, expect, it } from 'vitest';
import { gridLineValues } from '../gridLines';
import { STAGE_DEPTH, STAGE_HALF_WIDTH, X_AXIS_SCALE, Y_AXIS_SCALE } from '../stageConstants';

describe('gridLineValues（2.1 グリッド線とグリッド番号）', () => {
  it('x軸: 中央(0)から両方向に1単位ごとの値を、ステージ範囲に収まる分だけ生成する', () => {
    const values = gridLineValues(X_AXIS_SCALE, -STAGE_HALF_WIDTH, STAGE_HALF_WIDTH);

    expect(values).toEqual([-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]);
  });

  it('y軸: 手前端(基準値)から奥へ1単位ごとの値を、ステージ範囲に収まる分だけ生成する', () => {
    const values = gridLineValues(Y_AXIS_SCALE, 0, STAGE_DEPTH);

    expect(values).toEqual([-4, -3, -2, -1, 0, 1, 2]);
  });

  it('生成した値はすべて指定したメートル範囲に収まる', () => {
    const values = gridLineValues(X_AXIS_SCALE, -STAGE_HALF_WIDTH, STAGE_HALF_WIDTH);

    for (const value of values) {
      const meters = (value - X_AXIS_SCALE.referenceValue) * X_AXIS_SCALE.metersPerUnit;
      expect(meters).toBeGreaterThanOrEqual(-STAGE_HALF_WIDTH);
      expect(meters).toBeLessThanOrEqual(STAGE_HALF_WIDTH);
    }
  });
});
