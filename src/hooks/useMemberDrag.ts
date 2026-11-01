import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { clientPointToDomain } from './svgCoordinates';
import { snapPositionWithinStage } from '../domain/coordinates';
import { LARGE_DRAG_STEP, type DragStep } from '../domain/dragStep';

/**
 * タップ・クリックと見なす移動距離の上限（px）。これ未満の移動では選択のみを行い、
 * 立ち位置は変更しない（指のわずかなブレでの意図しない移動を防ぐ。仕様: タップ）。
 */
const DRAG_THRESHOLD_PX = 6;

/**
 * 2D エディター上でのメンバーのドラッグ操作を扱うフック（1.5 立ち位置変更、2.3 座標変換、
 * 仕様: 移動単位トグル）。pointerdown で startDrag(id, clientX, clientY) を呼ぶと、
 * window の pointermove を追従して SVG のピクセル座標をドメイン座標に変換し、
 * dragStep（Shift押下中は LARGE_DRAG_STEP）の倍数に吸着させたうえで onMove へ渡す。
 * 開始位置からの移動距離が DRAG_THRESHOLD_PX 未満の間は onMove を呼ばない。
 */
export function useMemberDrag(
  svgRef: RefObject<SVGSVGElement | null>,
  onMove: (id: string, x: number, y: number) => void,
  dragStep: DragStep,
) {
  const draggingIdRef = useRef<string | null>(null);
  const startClientPointRef = useRef<{ x: number; y: number } | null>(null);
  const hasExceededThresholdRef = useRef(false);
  const removeListenersRef = useRef<() => void>(() => {});

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const id = draggingIdRef.current;
      const svg = svgRef.current;
      const startPoint = startClientPointRef.current;
      if (id === null || svg === null || startPoint === null) {
        return;
      }
      if (!hasExceededThresholdRef.current) {
        const distance = Math.hypot(event.clientX - startPoint.x, event.clientY - startPoint.y);
        if (distance < DRAG_THRESHOLD_PX) {
          return;
        }
        hasExceededThresholdRef.current = true;
      }
      const rect = svg.getBoundingClientRect();
      const { x, y } = clientPointToDomain(event.clientX, event.clientY, rect);
      const step = event.shiftKey ? LARGE_DRAG_STEP : dragStep;
      const snapped = snapPositionWithinStage(x, y, step);
      onMove(id, snapped.x, snapped.y);
    },
    [svgRef, onMove, dragStep],
  );

  const stopDrag = useCallback(() => {
    draggingIdRef.current = null;
    startClientPointRef.current = null;
    hasExceededThresholdRef.current = false;
    removeListenersRef.current();
  }, []);

  const startDrag = useCallback(
    (id: string, clientX: number, clientY: number) => {
      draggingIdRef.current = id;
      startClientPointRef.current = { x: clientX, y: clientY };
      hasExceededThresholdRef.current = false;
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', stopDrag);
      removeListenersRef.current = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', stopDrag);
      };
    },
    [handlePointerMove, stopDrag],
  );

  useEffect(() => stopDrag, [stopDrag]);

  return { startDrag };
}
