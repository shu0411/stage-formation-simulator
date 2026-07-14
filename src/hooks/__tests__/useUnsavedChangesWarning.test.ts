import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUnsavedChangesWarning } from '../useUnsavedChangesWarning';

function dispatchBeforeUnload() {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

describe('useUnsavedChangesWarning', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('isDirtyがtrueのときbeforeunloadをキャンセルし警告を発生させる（1.5 保存・復元）', () => {
    renderHook(() => useUnsavedChangesWarning(true));

    const event = dispatchBeforeUnload();

    expect(event.defaultPrevented).toBe(true);
  });

  it('isDirtyがfalseのときはbeforeunloadをキャンセルしない', () => {
    renderHook(() => useUnsavedChangesWarning(false));

    const event = dispatchBeforeUnload();

    expect(event.defaultPrevented).toBe(false);
  });

  it('isDirtyがtrueからfalseに変わると警告しなくなる', () => {
    const { rerender } = renderHook(({ isDirty }) => useUnsavedChangesWarning(isDirty), {
      initialProps: { isDirty: true },
    });

    rerender({ isDirty: false });
    const event = dispatchBeforeUnload();

    expect(event.defaultPrevented).toBe(false);
  });

  it('アンマウントすると警告しなくなる', () => {
    const { unmount } = renderHook(() => useUnsavedChangesWarning(true));

    unmount();
    const event = dispatchBeforeUnload();

    expect(event.defaultPrevented).toBe(false);
  });
});
