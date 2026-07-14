import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAppDispatch, useAppState } from '../useAppState';

describe('useAppState / useAppDispatch', () => {
  it('AppStateProviderの外側で使うとエラーを投げる', () => {
    expect(() => renderHook(() => useAppState())).toThrow(
      'useAppState は AppStateProvider の内側で使用してください',
    );
    expect(() => renderHook(() => useAppDispatch())).toThrow(
      'useAppDispatch は AppStateProvider の内側で使用してください',
    );
  });
});
