import { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import App from './App.tsx';
import { AppStateProvider } from './state/AppStateContext';
import type { FormationFileIO, FormationStorage } from './application/ports';

type AppRootProps = {
  storage: FormationStorage;
  fileIO: FormationFileIO;
};

/**
 * index.css の `color-scheme: light dark` と同じく OS のダーク/ライト設定に
 * MUI テーマの palette.mode を追従させる。固定 light のままだと、ダーク
 * モード時に TextField 等の枠線色が背景色と近くなり見えなくなるため。
 */
export function AppRoot({ storage, fileIO }: AppRootProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () => createTheme({ palette: { mode: prefersDarkMode ? 'dark' : 'light' } }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <AppStateProvider storage={storage}>
        <App storage={storage} fileIO={fileIO} />
      </AppStateProvider>
    </ThemeProvider>
  );
}
