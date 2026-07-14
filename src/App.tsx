import { FormationEditorDialog } from './components/dialogs/FormationEditorDialog';
import { FormationView3D } from './components/sections/FormationView3D';
import { FormationThumbnail } from './components/sections/FormationThumbnail';
import { OperationsBar } from './components/sections/OperationsBar';
import type { FormationFileIO, FormationStorage } from './application/ports';
import { useAppState } from './state/useAppState';
import './App.css';

type AppProps = {
  storage: FormationStorage;
  fileIO: FormationFileIO;
};

/** 画面全体のレイアウト（1.4 画面・操作フロー）と各部の結線。 */
function App({ storage, fileIO }: AppProps) {
  const state = useAppState();

  return (
    <div className="app-layout">
      <FormationView3D />
      <div className="app-layout__overlay">
        <FormationThumbnail />
        <OperationsBar storage={storage} fileIO={fileIO} />
      </div>
      {state.isEditorOpen && (
        <div className="app-layout__modal-backdrop">
          <FormationEditorDialog />
        </div>
      )}
    </div>
  );
}

export default App;
