import { describe, expect, it } from 'vitest';
import { toScenePosition } from '../sceneMapping';
import { toMeters } from '../axisScale';
import { STAGE_DEPTH, STAGE_HEIGHT, X_AXIS_SCALE, Y_AXIS_SCALE } from '../stageConstants';

describe('toScenePosition（2.2 3D空間への写像）', () => {
  it('x はメートルに変換して X 軸へ、Y はステージ天面の高さになる', () => {
    const [x, y] = toScenePosition({ x: 3, y: 2 });
    expect(x).toBeCloseTo(toMeters(3, X_AXIS_SCALE));
    expect(y).toBe(STAGE_HEIGHT);
  });

  it('手前端（y の基準値）は Z 軸の奥行中心+半分（客席側）になる', () => {
    const front = Y_AXIS_SCALE.referenceValue;
    const [, , z] = toScenePosition({ x: 0, y: front });
    expect(z).toBeCloseTo(STAGE_DEPTH / 2);
  });

  it('奥へ行くほど Z が小さくなる（客席側を +Z）', () => {
    const front = Y_AXIS_SCALE.referenceValue;
    const back = front - 2; // Y_AXIS_SCALE.direction が -1 のため、奥は基準値より小さい値
    const [, , zFront] = toScenePosition({ x: 0, y: front });
    const [, , zBack] = toScenePosition({ x: 0, y: back });
    expect(zFront - zBack).toBeCloseTo(toMeters(back, Y_AXIS_SCALE));
  });
});
