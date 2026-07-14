import { FormationStageSvg } from '../parts/FormationStageSvg';
import { MemberNameInput } from '../parts/MemberNameInput';
import { useAppDispatch, useAppState } from '../../state/useAppState';
import './FormationEditorDialog.css';

/**
 * 2D 編集ポップアップ（1.4 画面構成、1.5 2D エディター表示）。
 * メンバーの追加・削除・ドラッグ・名前編集を行う。
 */
export function FormationEditorDialog() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const selectedMember =
    state.formation.members.find((member) => member.id === state.selectedMemberId) ?? null;

  if (!state.isEditorOpen) {
    return null;
  }

  const handleAdd = () => {
    dispatch({ type: 'ADD_MEMBER', id: crypto.randomUUID() });
  };

  const handleDelete = () => {
    if (selectedMember === null) {
      return;
    }
    if (window.confirm(`「${selectedMember.name}」を削除しますか？`)) {
      dispatch({ type: 'REMOVE_MEMBER', id: selectedMember.id });
    }
  };

  const handleClose = () => {
    dispatch({ type: 'CLOSE_EDITOR' });
  };

  return (
    <div role="dialog" aria-label="2D編集ポップアップ" className="formation-editor-dialog">
      <div className="formation-editor-dialog__toolbar">
        <button type="button" onClick={handleAdd}>
          メンバーを追加
        </button>
        <button type="button" onClick={handleDelete} disabled={selectedMember === null}>
          削除
        </button>
        {selectedMember === null ? (
          <input type="text" aria-label="メンバー名" value="" disabled readOnly />
        ) : (
          <MemberNameInput
            key={selectedMember.id}
            member={selectedMember}
            onSubmit={(name) => dispatch({ type: 'RENAME_MEMBER', id: selectedMember.id, name })}
          />
        )}
        <button type="button" onClick={handleClose}>
          閉じる
        </button>
      </div>
      <FormationStageSvg
        formation={state.formation}
        selectedMemberId={state.selectedMemberId}
        interactive
        onSelectMember={(id) => dispatch({ type: 'SELECT_MEMBER', id })}
        onMoveMember={(id, x, y) => dispatch({ type: 'MOVE_MEMBER', id, x, y })}
        className="formation-editor-dialog__svg"
      />
    </div>
  );
}
