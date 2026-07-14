import { createContext, type Dispatch } from 'react';
import type { AppAction, AppState } from './appState';

export const AppStateContext = createContext<AppState | null>(null);
export const AppDispatchContext = createContext<Dispatch<AppAction> | null>(null);
