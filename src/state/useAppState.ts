import { useContext, type Dispatch } from 'react';
import { AppDispatchContext, AppStateContext } from './appStateContexts';
import type { AppAction, AppState } from './appState';

export function useAppState(): AppState {
  const state = useContext(AppStateContext);
  if (state === null) {
    throw new Error('useAppState は AppStateProvider の内側で使用してください');
  }
  return state;
}

export function useAppDispatch(): Dispatch<AppAction> {
  const dispatch = useContext(AppDispatchContext);
  if (dispatch === null) {
    throw new Error('useAppDispatch は AppStateProvider の内側で使用してください');
  }
  return dispatch;
}
