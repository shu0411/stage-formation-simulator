import type { ChangeEvent } from 'react';
import Button from '@mui/material/Button';
import { exportFormation } from '../../application/exportFormation';
import { importFormation } from '../../application/importFormation';
import { saveFormation } from '../../application/saveFormation';
import type { FormationFileIO, FormationStorage } from '../../application/ports';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { useAppDispatch, useAppState } from '../../state/useAppState';
import './OperationsBar.css';

type OperationsBarProps = {
  storage: FormationStorage;
  fileIO: FormationFileIO;
};

const SAVE_COMPLETE_MESSAGE = '保存しました。';
const IMPORT_ERROR_MESSAGE =
  '不正なファイルです。フォーメーションのJSONファイルを選択してください。';

/**
 * 操作 UI（1.4 画面構成）。保存・JSON エクスポート・インポートをユースケースへ結線し、
 * 未保存警告・保存完了通知・インポートエラー通知（2.4）を担う。
 */
export function OperationsBar({ storage, fileIO }: OperationsBarProps) {
  const state = useAppState();
  const dispatch = useAppDispatch();

  useUnsavedChangesWarning(state.isDirty);

  const handleSave = () => {
    saveFormation(state.formation, storage);
    dispatch({ type: 'MARK_SAVED' });
    window.alert(SAVE_COMPLETE_MESSAGE);
  };

  const handleExport = () => {
    exportFormation(state.formation, fileIO);
  };

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (file === null) {
      return;
    }
    const formation = await importFormation(file, fileIO);
    if (formation === null) {
      window.alert(IMPORT_ERROR_MESSAGE);
      return;
    }
    dispatch({ type: 'REPLACE_FORMATION', formation });
  };

  return (
    <div className="operations-bar">
      <div className="operations-bar__controls">
        <Button variant="contained" onClick={handleSave}>
          保存
        </Button>
        <Button variant="outlined" onClick={handleExport}>
          JSONエクスポート
        </Button>
        <Button component="label" variant="outlined">
          JSONインポート
          <input type="file" hidden accept="application/json,.json" onChange={handleImportChange} />
        </Button>
      </div>
    </div>
  );
}
