import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useMemberDrag } from '../useMemberDrag';
import { clientPointToDomain } from '../svgCoordinates';
import { Y_AXIS_SCALE } from '../../domain/stageConstants';

function createSvgRef(rect: { left: number; top: number; width: number; height: number }) {
  return { current: { getBoundingClientRect: () => rect } as unknown as SVGSVGElement };
}

describe('useMemberDrag', () => {
  // STAGE_VIEW_BOX（x: -7.6〜7.6, y: -0.3〜8）に対して 100px/m のスケールで対応させる
  const rect = { left: 100, top: 50, width: 1520, height: 830 };
  const startClientX = 100;
  const startClientY = 50;
  // svg空間で (x=0, y=6=STAGE_DEPTH) はステージ中央・手前端
  const clientX = 100 + 760;
  const clientY = 50 + 630;

  /**
   * startDrag の開始クライアント座標ちょうどをメンバーの立ち位置として渡す
   * （掴んだ位置のズレ＝オフセットを常に0にし、既存テストの期待値を変えないようにする）。
   */
  function domainAt(x: number, y: number) {
    return clientPointToDomain(x, y, rect);
  }

  it('ドラッグ開始後、pointermoveのたびにドメイン座標へ変換してonMoveを呼ぶ（1.5 立ち位置変更）', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove, 0.25));
    const memberPos = domainAt(startClientX, startClientY);

    act(() => {
      result.current.startDrag('id-1', startClientX, startClientY, memberPos.x, memberPos.y);
      window.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY }));
    });

    expect(onMove).toHaveBeenCalledWith('id-1', 0, Y_AXIS_SCALE.referenceValue);
  });

  it('pointerupの後はpointermoveが起きてもonMoveを呼ばない', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove, 0.25));
    const memberPos = domainAt(startClientX, startClientY);

    act(() => {
      result.current.startDrag('id-1', startClientX, startClientY, memberPos.x, memberPos.y);
      window.dispatchEvent(new PointerEvent('pointerup'));
      window.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY }));
    });

    expect(onMove).not.toHaveBeenCalled();
  });

  it('pointercancelの後はpointermoveが起きてもonMoveを呼ばない（仕様: タッチドラッグの中断）', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove, 0.25));
    const memberPos = domainAt(startClientX, startClientY);

    act(() => {
      result.current.startDrag('id-1', startClientX, startClientY, memberPos.x, memberPos.y);
      window.dispatchEvent(new PointerEvent('pointercancel'));
      window.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY }));
    });

    expect(onMove).not.toHaveBeenCalled();
  });

  it('pointercancelで中断された後も、再度startDragすれば問題なくドラッグできる（内部状態が残らない）', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove, 0.25));
    const memberPos = domainAt(startClientX, startClientY);

    act(() => {
      result.current.startDrag('id-1', startClientX, startClientY, memberPos.x, memberPos.y);
      window.dispatchEvent(new PointerEvent('pointercancel'));
      result.current.startDrag('id-1', startClientX, startClientY, memberPos.x, memberPos.y);
      window.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY }));
    });

    expect(onMove).toHaveBeenCalledWith('id-1', 0, Y_AXIS_SCALE.referenceValue);
  });

  it('ドラッグ中でないときはpointermoveが起きてもonMoveを呼ばない', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    renderHook(() => useMemberDrag(svgRef, onMove, 0.25));

    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY }));
    });

    expect(onMove).not.toHaveBeenCalled();
  });

  it('開始位置からの移動距離が6px未満の間はonMoveを呼ばない（仕様: タップ）', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove, 0.25));
    const memberPos = domainAt(clientX, clientY);

    act(() => {
      result.current.startDrag('id-1', clientX, clientY, memberPos.x, memberPos.y);
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: clientX + 5, clientY: clientY + 1 }),
      );
    });

    expect(onMove).not.toHaveBeenCalled();
  });

  it('開始位置からの移動距離が6px以上になると、以降は閾値未満の移動でもonMoveを呼ぶ', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove, 0.25));
    const memberPos = domainAt(clientX, clientY);

    act(() => {
      result.current.startDrag('id-1', clientX, clientY, memberPos.x, memberPos.y);
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: clientX + 10, clientY }));
      onMove.mockClear();
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: clientX + 1, clientY }));
    });

    expect(onMove).toHaveBeenCalled();
  });

  it('選択中の移動幅（dragStep）の倍数に座標が揃う（仕様: 移動幅プルダウンの吸着）', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    const memberPos = domainAt(startClientX, startClientY);
    // clientX+9px はドメイン座標で x=0.1（0.1単位にすでに揃っている）に対応する
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove, 0.1));

    act(() => {
      result.current.startDrag('id-1', startClientX, startClientY, memberPos.x, memberPos.y);
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: clientX + 9, clientY }));
    });

    expect(onMove).toHaveBeenCalledWith('id-1', 0.1, Y_AXIS_SCALE.referenceValue);
  });

  it('移動幅が0.25のときは、0.1単位の位置が最も近い0.25の倍数に揃う', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    const memberPos = domainAt(startClientX, startClientY);
    // clientX+9pxはドメイン座標でx=0.1。0.25単位では最も近い0の倍数に揃う
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove, 0.25));

    act(() => {
      result.current.startDrag('id-1', startClientX, startClientY, memberPos.x, memberPos.y);
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: clientX + 9, clientY }));
    });

    expect(onMove).toHaveBeenCalledWith('id-1', 0, Y_AXIS_SCALE.referenceValue);
  });

  it('Shiftキーを押していない間は、選択中の移動幅（0.25）の倍数に揃う', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    const memberPos = domainAt(startClientX, startClientY);
    // clientX+30pxはドメイン座標でx=1/3。0.25単位では最も近い0.25の倍数に揃う
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove, 0.25));

    act(() => {
      result.current.startDrag('id-1', startClientX, startClientY, memberPos.x, memberPos.y);
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: clientX + 30, clientY }));
    });

    expect(onMove).toHaveBeenCalledWith('id-1', 0.25, Y_AXIS_SCALE.referenceValue);
  });

  it('Shiftキーを押している間は、選択中の移動幅（0.25）に関わらず1単位に吸着する（仕様: Shift）', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    const memberPos = domainAt(startClientX, startClientY);
    // clientX+30pxはドメイン座標でx=1/3。1単位では最も近い0の倍数に揃う
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove, 0.25));

    act(() => {
      result.current.startDrag('id-1', startClientX, startClientY, memberPos.x, memberPos.y);
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: clientX + 30, clientY, shiftKey: true }),
      );
    });

    expect(onMove).toHaveBeenCalledWith('id-1', 0, Y_AXIS_SCALE.referenceValue);
  });

  it('掴んだ位置がメンバー中心からズレていても、そのズレを保ったまま追従する（仕様: 掴んだ位置のズレを保つ）', () => {
    const onMove = vi.fn();
    const svgRef = createSvgRef(rect);
    // メンバーの立ち位置は、ポインターのドメイン座標(x=1, y=referenceValue)より
    // x方向に-1ズレた位置（x=0）にある状態でドラッグを開始する
    const memberX = 0;
    const memberY = Y_AXIS_SCALE.referenceValue;
    const { result } = renderHook(() => useMemberDrag(svgRef, onMove, 1));

    act(() => {
      // clientX+90pxはドメイン座標でx=1に対応する（1単位=0.9m=90px）
      result.current.startDrag('id-1', clientX + 90, clientY, memberX, memberY);
      // さらに90px(x=1単位)動かす。オフセットがなければポインターのドメイン座標(x=2)に
      // 中心が飛ぶが、ズレ(-1)を保てばメンバーはx=1に移動する
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: clientX + 180, clientY }));
    });

    expect(onMove).toHaveBeenCalledWith('id-1', 1, memberY);
  });
});
