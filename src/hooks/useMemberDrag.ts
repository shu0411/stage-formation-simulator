import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { clientPointToDomain } from './svgCoordinates';

/**
 * 2D エディター上でのメンバーのドラッグ操作を扱うフック（1.5 立ち位置変更、2.3 座標変換）。
 * pointerdown で startDrag(id) を呼ぶと、window の pointermove を追従して
 * SVG のピクセル座標をドメイン座標（メートル）に変換し onMove へ渡す。
 */
export function useMemberDrag(
  svgRef: RefObject<SVGSVGElement | null>,
  onMove: (id: string, x: number, y: number) => void,
) {
  const draggingIdRef = useRef<string | null>(null);
  const removeListenersRef = useRef<() => void>(() => {});

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const id = draggingIdRef.current;
      const svg = svgRef.current;
      if (id === null || svg === null) {
        return;
      }
      const rect = svg.getBoundingClientRect();
      const { x, y } = clientPointToDomain(event.clientX, event.clientY, rect);
      onMove(id, x, y);
    },
    [svgRef, onMove],
  );

  const stopDrag = useCallback(() => {
    draggingIdRef.current = null;
    removeListenersRef.current();
  }, []);

  const startDrag = useCallback(
    (id: string) => {
      draggingIdRef.current = id;
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
