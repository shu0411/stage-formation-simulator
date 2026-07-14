import { describe, expect, it } from 'vitest';
import { toScenePosition } from '../sceneMapping';

describe('toScenePosition', () => {
  it('2D座標(x, y)を3D空間の座標(x, 0, -y)に変換する（2.2 座標系）', () => {
    expect(toScenePosition({ x: 3, y: 2 })).toEqual([3, 0, -2]);
  });

  it('原点は3D空間でも原点になる', () => {
    expect(toScenePosition({ x: 0, y: 0 })).toEqual([0, 0, 0]);
  });
});
