import { describe, expect, it } from 'vitest';
import { fromMeters, toMeters } from '../axisScale';
import type { AxisScale } from '../axisScale';

describe('toMeters（値を基準位置からのメートルに変換する。2.1 座標軸の値とメートルの変換）', () => {
  it('基準値のときは0を返す', () => {
    const scale: AxisScale = { referenceValue: 2, metersPerUnit: 0.9, direction: -1 };
    expect(toMeters(2, scale)).toBe(0);
  });

  it('directionが1のとき、値が増えるほどメートルも増える', () => {
    const scale: AxisScale = { referenceValue: 0, metersPerUnit: 0.9, direction: 1 };
    expect(toMeters(1, scale)).toBeCloseTo(0.9);
    expect(toMeters(-1, scale)).toBeCloseTo(-0.9);
  });

  it('directionが-1のとき、値が増えるほどメートルは減る', () => {
    const scale: AxisScale = { referenceValue: 2, metersPerUnit: 0.9, direction: -1 };
    expect(toMeters(1, scale)).toBeCloseTo(0.9);
    expect(toMeters(0, scale)).toBeCloseTo(1.8);
  });
});

describe('fromMeters（toMetersの逆変換）', () => {
  it('toMetersで変換した値をfromMetersで戻すと元の値に一致する', () => {
    const scale: AxisScale = { referenceValue: 2, metersPerUnit: 0.9, direction: -1 };
    for (const value of [2, 1, 0, -1, -4.5]) {
      expect(fromMeters(toMeters(value, scale), scale)).toBeCloseTo(value);
    }
  });
});
