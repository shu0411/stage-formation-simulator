import { describe, expect, it } from 'vitest';
import { clientPointToDomain, toSvgPoint } from '../svgCoordinates';

describe('toSvgPoint', () => {
  it('ドメイン座標をSVG座標に変換する（yは奥が正なので符号反転する）', () => {
    expect(toSvgPoint(3, 2)).toEqual({ x: 3, y: -2 });
  });
});

describe('clientPointToDomain', () => {
  const rect = { left: 100, top: 50, width: 1200, height: 800 };

  it('ステージ中央のポインター座標はドメイン原点になる', () => {
    expect(clientPointToDomain(100 + 600, 50 + 400, rect)).toEqual({ x: 0, y: 0 });
  });

  it('ステージ左上のポインター座標はステージの奥側の端になる', () => {
    const point = clientPointToDomain(100, 50, rect);
    expect(point.x).toBeCloseTo(-6);
    expect(point.y).toBeCloseTo(4);
  });

  it('ステージ右下のポインター座標は手前側の端になる', () => {
    const point = clientPointToDomain(100 + 1200, 50 + 800, rect);
    expect(point.x).toBeCloseTo(6);
    expect(point.y).toBeCloseTo(-4);
  });
});
