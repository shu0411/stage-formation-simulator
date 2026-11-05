import { describe, expect, it } from 'vitest';
import { DEFAULT_DRAG_STEP, DRAG_STEPS, LARGE_DRAG_STEP } from '../dragStep';

describe('dragStep', () => {
  it('DRAG_STEPSは0.1・0.25・0.5・1の4種類を昇順で持つ（仕様: 移動幅プルダウン）', () => {
    expect(DRAG_STEPS).toEqual([0.1, 0.25, 0.5, 1]);
  });

  it('デフォルトの移動幅は0.25である', () => {
    expect(DEFAULT_DRAG_STEP).toBe(0.25);
  });

  it('Shift押下時の移動幅は1である', () => {
    expect(LARGE_DRAG_STEP).toBe(1);
  });
});
