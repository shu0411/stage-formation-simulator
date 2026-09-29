import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useEditorLayout } from '../useEditorLayout';

/**
 * `useEditorLayout` が見る2つのメディアクエリのうち、横表示クエリは
 * `max-height`、縦表示クエリ（`theme.breakpoints.down('sm')`）は `max-width`
 * を含むため、この部分文字列で判定を出し分ける。
 */
function mockMatchMedia({
  landscape = false,
  portrait = false,
}: {
  landscape?: boolean;
  portrait?: boolean;
}) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('max-height') ? landscape : query.includes('max-width') && portrait,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('useEditorLayout', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('縦表示の条件だけに一致するとき mobilePortrait を返す', () => {
    mockMatchMedia({ portrait: true });

    const { result } = renderHook(() => useEditorLayout());

    expect(result.current).toBe('mobilePortrait');
  });

  it('横表示の条件に一致するとき mobileLandscape を返す', () => {
    mockMatchMedia({ landscape: true });

    const { result } = renderHook(() => useEditorLayout());

    expect(result.current).toBe('mobileLandscape');
  });

  it('縦表示・横表示の両方の条件に一致するとき mobileLandscape を優先する', () => {
    mockMatchMedia({ landscape: true, portrait: true });

    const { result } = renderHook(() => useEditorLayout());

    expect(result.current).toBe('mobileLandscape');
  });

  it('どちらの条件にも一致しないとき desktop を返す', () => {
    mockMatchMedia({});

    const { result } = renderHook(() => useEditorLayout());

    expect(result.current).toBe('desktop');
  });
});
