import { describe, expect, it } from 'vitest';
import { frontBackSpinnerLabels } from '../frontBackSpinnerLabels';

describe('frontBackSpinnerLabels', () => {
  it('directionが-1のとき、値の増加は「前へ」・減少は「後ろへ」になる（1.6 座標系）', () => {
    expect(frontBackSpinnerLabels(-1)).toEqual({ increment: '前へ', decrement: '後ろへ' });
  });

  it('directionが1のとき、値の増加は「後ろへ」・減少は「前へ」になる（将来directionが変わった場合）', () => {
    expect(frontBackSpinnerLabels(1)).toEqual({ increment: '後ろへ', decrement: '前へ' });
  });
});
