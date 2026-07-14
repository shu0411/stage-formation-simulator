import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRoot } from './AppRoot.tsx';
import { localStorageFormationStorage } from './infrastructure/localStorageFormationStorage';
import { fileFormationIO } from './infrastructure/fileFormationIO';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRoot storage={localStorageFormationStorage} fileIO={fileFormationIO} />
  </StrictMode>,
);
