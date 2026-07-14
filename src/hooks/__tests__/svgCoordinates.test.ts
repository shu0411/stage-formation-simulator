import { describe, expect, it } from 'vitest';
import { clientPointToDomain, toSvgPoint } from '../svgCoordinates';
import { toMeters } from '../../domain/axisScale';
import { STAGE_DEPTH, X_AXIS_SCALE, Y_AXIS_SCALE } from '../../domain/stageConstants';

describe('toSvgPoint（ドメイン座標をSVG座標に変換する。手前が下になるようにする）', () => {
  it('手前端（yの基準値）はSVGの最も下（y = STAGE_DEPTH）になる', () => {
    const front = Y_AXIS_SCALE.referenceValue;
    expect(toSvgPoint(3, front)).toEqual({ x: toMeters(3, X_AXIS_SCALE), y: STAGE_DEPTH });
  });

  it('奥へ行くほどSVGのyは小さくなる', () => {
    const front = Y_AXIS_SCALE.referenceValue;
    const back = front - 2;
    expect(toSvgPoint(0, back).y).toBeLessThan(toSvgPoint(0, front).y);
  });
});

describe('clientPointToDomain', () => {
  // STAGE_VIEW_BOX（x: -6.6〜6.6, y: 0〜7）に対して 100px/m のスケールで対応させる
  const rect = { left: 0, top: 0, width: 1320, height: 700 };

  it('ステージ左手前の角のポインター座標は、xの最小端かつy基準値（手前端）になる', () => {
    // svg空間で (x=-5.6, y=STAGE_DEPTH=6) はステージ左手前の角
    const point = clientPointToDomain(100, 600, rect);
    expect(point.x).toBeCloseTo(-5.6 / X_AXIS_SCALE.metersPerUnit);
    expect(point.y).toBeCloseTo(Y_AXIS_SCALE.referenceValue);
  });

  it('ステージ右奥の角のポインター座標は、xの最大端かつyの奥端になる', () => {
    // svg空間で (x=5.6, y=0) はステージ右奥の角
    const point = clientPointToDomain(1220, 0, rect);
    expect(point.x).toBeCloseTo(5.6 / X_AXIS_SCALE.metersPerUnit);
    expect(point.y).toBeCloseTo(
      Y_AXIS_SCALE.referenceValue +
        (STAGE_DEPTH / Y_AXIS_SCALE.metersPerUnit) * Y_AXIS_SCALE.direction,
    );
  });

  it('ステージ中央のポインター座標はドメイン中央になる', () => {
    const point = clientPointToDomain(660, 300, rect);
    expect(point.x).toBeCloseTo(0);
    expect(point.y).toBeCloseTo(
      Y_AXIS_SCALE.referenceValue +
        (STAGE_DEPTH / 2 / Y_AXIS_SCALE.metersPerUnit) * Y_AXIS_SCALE.direction,
    );
  });
});
