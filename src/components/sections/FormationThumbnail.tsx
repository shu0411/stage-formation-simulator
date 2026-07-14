import { FormationStageSvg } from '../parts/FormationStageSvg';
import { useAppDispatch, useAppState } from '../../state/useAppState';
import './FormationThumbnail.css';

/**
 * 画面左上のサムネイル（1.4 画面構成、1.5 2D エディター表示）。
 * クリックすると 2D 編集ポップアップを開く。編集内容の追従表示のみを担い、操作は受け付けない。
 */
export function FormationThumbnail() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      className="formation-thumbnail"
      onClick={() => dispatch({ type: 'OPEN_EDITOR' })}
      aria-label="2D編集ポップアップを開く"
    >
      <FormationStageSvg formation={state.formation} className="formation-thumbnail__svg" />
    </button>
  );
}
