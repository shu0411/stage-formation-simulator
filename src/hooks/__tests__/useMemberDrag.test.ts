import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useMemberDrag } from '../useMemberDrag';

function createSvgRef(rect: { left: number; top: number; width: number; height: number }) {
  return { current: { getBoundingClientRect: () => rect } as unknown as SVGSVGElement };
}

describe('useMemberDrag', () => {
  const rect = { left: 100, top: 50, width: 1200, height: 800 };

  it('ドラッグ開始後、pointermoveのたびにドメイン座標へ変換してonMoveを呼ぶ（1.5 立ち位置変更）', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove));

    act(() => {
      result.current.startDrag('id-1');
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 100 + 600, clientY: 50 + 400 }),
      );
    });

    expect(onMove).toHaveBeenCalledWith('id-1', 0, 0);
  });

  it('pointerupの後はpointermoveが起きてもonMoveを呼ばない', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove));

    act(() => {
      result.current.startDrag('id-1');
      window.dispatchEvent(new PointerEvent('pointerup'));
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 100 + 600, clientY: 50 + 400 }),
      );
    });

    expect(onMove).not.toHaveBeenCalled();
  });

  it('ドラッグ中でないときはpointermoveが起きてもonMoveを呼ばない', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    renderHook(() => useMemberDrag(svgRef, onMove));

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 100 + 600, clientY: 50 + 400 }),
      );
    });

    expect(onMove).not.toHaveBeenCalled();
  });
});
