import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppStateProvider } from './state/AppStateContext';
import { localStorageFormationStorage } from './infrastructure/localStorageFormationStorage';
import { fileFormationIO } from './infrastructure/fileFormationIO';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStateProvider storage={localStorageFormationStorage}>
      <App storage={localStorageFormationStorage} fileIO={fileFormationIO} />
    </AppStateProvider>
  </StrictMode>,
);
