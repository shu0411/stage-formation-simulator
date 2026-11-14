import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DRAG_HANDLE_ATTRIBUTE, useSuppressTouchScroll } from '../useSuppressTouchScroll';

function setup() {
  const container = document.createElement('div');
  const handle = document.createElement('span');
  handle.setAttribute(DRAG_HANDLE_ATTRIBUTE, '');
  const child = document.createElement('span');
  handle.appendChild(child);
  const other = document.createElement('span');
  container.append(handle, other);
  document.body.appendChild(container);
  return { container, handle, child, other };
}

function dispatchTouchStart(target: Element) {
  const event = new Event('touchstart', { bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

describe('useSuppressTouchScroll', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('ドラッグ可能な要素で始まったtouchstartはデフォルト動作（スクロール）を抑止する', () => {
    const { container, handle } = setup();
    renderHook(() => useSuppressTouchScroll({ current: container }, true));

    expect(dispatchTouchStart(handle).defaultPrevented).toBe(true);
  });

  it('ドラッグ可能な要素の子孫で始まったtouchstartも抑止する', () => {
    const { container, child } = setup();
    renderHook(() => useSuppressTouchScroll({ current: container }, true));

    expect(dispatchTouchStart(child).defaultPrevented).toBe(true);
  });

  it('ドラッグ可能な要素以外で始まったtouchstartは抑止せず、スクロールを維持する', () => {
    const { container, other } = setup();
    renderHook(() => useSuppressTouchScroll({ current: container }, true));

    expect(dispatchTouchStart(other).defaultPrevented).toBe(false);
  });

  it('無効のときは抑止しない', () => {
    const { container, handle } = setup();
    renderHook(() => useSuppressTouchScroll({ current: container }, false));

    expect(dispatchTouchStart(handle).defaultPrevented).toBe(false);
  });

  it('アンマウント後は抑止しない', () => {
    const { container, handle } = setup();
    const { unmount } = renderHook(() => useSuppressTouchScroll({ current: container }, true));
    unmount();

    expect(dispatchTouchStart(handle).defaultPrevented).toBe(false);
  });
});
