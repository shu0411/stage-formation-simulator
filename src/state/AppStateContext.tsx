import { useReducer, type ReactNode } from 'react';
import { restoreShow } from '../application/restoreShow';
import type { FormationStorage } from '../application/ports';
import { appReducer } from './appReducer';
import { AppDispatchContext, AppStateContext } from './appStateContexts';
import { createInitialAppState, type AppState } from './appState';
import { createInitialShow } from '../domain/show';

function initAppState(storage: FormationStorage): AppState {
  const restored = restoreShow(storage);
  return createInitialAppState(restored ?? createInitialShow(crypto.randomUUID()));
}

type AppStateProviderProps = {
  children: ReactNode;
  storage: FormationStorage;
};

/** アプリ状態の Provider（2.2 アプリ状態）。起動時に storage からフォーメーションを復元する。 */
export function AppStateProvider({ children, storage }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, storage, initAppState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}
