import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useMemberDrag } from '../useMemberDrag';
import { Y_AXIS_SCALE } from '../../domain/stageConstants';

function createSvgRef(rect: { left: number; top: number; width: number; height: number }) {
  return { current: { getBoundingClientRect: () => rect } as unknown as SVGSVGElement };
}

describe('useMemberDrag', () => {
  // STAGE_VIEW_BOX（x: -6.6〜6.6, y: 0〜7）に対して 100px/m のスケールで対応させる
  const rect = { left: 100, top: 50, width: 1320, height: 700 };
  // svg空間で (x=0, y=6=STAGE_DEPTH) はステージ中央・手前端
  const clientX = 100 + 660;
  const clientY = 50 + 600;

  it('ドラッグ開始後、pointermoveのたびにドメイン座標へ変換してonMoveを呼ぶ（1.5 立ち位置変更）', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove));

    act(() => {
      result.current.startDrag('id-1');
      window.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY }));
    });

    expect(onMove).toHaveBeenCalledWith('id-1', 0, Y_AXIS_SCALE.referenceValue);
  });

  it('pointerupの後はpointermoveが起きてもonMoveを呼ばない', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove));

    act(() => {
      result.current.startDrag('id-1');
      window.dispatchEvent(new PointerEvent('pointerup'));
      window.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY }));
    });

    expect(onMove).not.toHaveBeenCalled();
  });

  it('ドラッグ中でないときはpointermoveが起きてもonMoveを呼ばない', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    renderHook(() => useMemberDrag(svgRef, onMove));

    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY }));
    });

    expect(onMove).not.toHaveBeenCalled();
  });
});
