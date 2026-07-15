import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { FormationStageSvg } from '../parts/FormationStageSvg';
import { MemberNameInput } from '../parts/MemberNameInput';
import { MemberPositionInput } from '../parts/MemberPositionInput';
import { MemberSelect } from '../parts/MemberSelect';
import { useAppDispatch, useAppState } from '../../state/useAppState';
import './FormationEditorDialog.css';

/**
 * 2D 編集ポップアップ（1.4 画面構成、1.5 2D エディター表示）。
 * メンバーの追加・削除・立ち位置変更（ドラッグ・数値入力）・名前編集を行う。
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
    <Dialog
      open
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { 'aria-label': '2D編集ポップアップ' } }}
    >
      <DialogContent>
        <FormationStageSvg
          formation={state.formation}
          selectedMemberId={state.selectedMemberId}
          interactive
          onSelectMember={(id) => dispatch({ type: 'SELECT_MEMBER', id })}
          onMoveMember={(id, x, y) => dispatch({ type: 'MOVE_MEMBER', id, x, y })}
          className="formation-editor-dialog__svg"
        />
        <div className="formation-editor-dialog__toolbar">
          <Button variant="contained" onClick={handleAdd}>
            メンバーを追加
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDelete}
            disabled={selectedMember === null}
          >
            削除
          </Button>
          <MemberSelect
            members={state.formation.members}
            selectedMemberId={state.selectedMemberId}
            onSelect={(id) => dispatch({ type: 'SELECT_MEMBER', id })}
          />
        </div>
        <div className="formation-editor-dialog__member-fields">
          <MemberNameInput
            key={`name-${selectedMember?.id ?? 'none'}`}
            member={selectedMember}
            onSubmit={(name) =>
              selectedMember && dispatch({ type: 'RENAME_MEMBER', id: selectedMember.id, name })
            }
          />
          <MemberPositionInput
            key={`position-${selectedMember?.id ?? 'none'}`}
            member={selectedMember}
            onSubmit={(x, y) =>
              selectedMember && dispatch({ type: 'MOVE_MEMBER', id: selectedMember.id, x, y })
            }
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
}
