import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import { useAppDispatch, useAppState } from '../../state/useAppState';

/** インポートエラー等のメッセージ表示（2.4 エラー処理）。閉じる操作でクリアする。 */
export function ErrorMessage() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  if (state.errorMessage === null) {
    return null;
  }

  return (
    <Alert
      severity="error"
      action={
        <IconButton
          color="inherit"
          size="small"
          onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
          aria-label="エラーメッセージを閉じる"
        >
          ×
        </IconButton>
      }
    >
      {state.errorMessage}
    </Alert>
  );
}
