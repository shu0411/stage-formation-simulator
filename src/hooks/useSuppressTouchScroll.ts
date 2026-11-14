import { useEffect, type RefObject } from 'react';

/** この属性を持つ要素（およびその子孫）で始まったタッチでは、ブラウザのスクロールを抑止する。 */
export const DRAG_HANDLE_ATTRIBUTE = 'data-drag-handle';

/**
 * container 内のドラッグ可能な要素（DRAG_HANDLE_ATTRIBUTE を持つ要素）で始まったタッチについて、
 * touchstart のデフォルト動作を抑止し、ブラウザがジェスチャーをスクロール・パンに割り当てて
 * pointercancel でドラッグを打ち切らないようにする（仕様: タッチでのドラッグ）。
 * SVG の子要素に指定した `touch-action` はブラウザによって無視されるため、その代替となる。
 * React の onTouchStart は passive で登録され preventDefault できないため、
 * `{ passive: false }` でネイティブのリスナーを登録する。
 * ドラッグ可能な要素以外で始まったタッチは抑止せず、画面スクロールを維持する。
 */
export function useSuppressTouchScroll(containerRef: RefObject<Element | null>, enabled: boolean) {
  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || container === null) {
      return;
    }
    const handleTouchStart = (event: Event) => {
      if (event.target instanceof Element && event.target.closest(`[${DRAG_HANDLE_ATTRIBUTE}]`)) {
        event.preventDefault();
      }
    };
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    return () => container.removeEventListener('touchstart', handleTouchStart);
  }, [containerRef, enabled]);
}
