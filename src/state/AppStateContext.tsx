import { useReducer, type ReactNode } from 'react';
import { restoreFormation } from '../application/restoreFormation';
import type { FormationStorage } from '../application/ports';
import { appReducer } from './appReducer';
import { AppDispatchContext, AppStateContext } from './appStateContexts';
import { createInitialAppState, type AppState } from './appState';

function initAppState(storage: FormationStorage): AppState {
  const restored = restoreFormation(storage);
  return createInitialAppState(restored ?? { members: [] });
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
