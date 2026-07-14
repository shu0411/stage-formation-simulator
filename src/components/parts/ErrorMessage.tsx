import { useAppDispatch, useAppState } from '../../state/useAppState';
import './ErrorMessage.css';

/** インポートエラー等のメッセージ表示（2.4 エラー処理）。閉じる操作でクリアする。 */
export function ErrorMessage() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  if (state.errorMessage === null) {
    return null;
  }

  return (
    <div role="alert" className="error-message">
      <p>{state.errorMessage}</p>
      <button
        type="button"
        onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
        aria-label="エラーメッセージを閉じる"
      >
        ×
      </button>
    </div>
  );
}
