import { useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { FormationStageSvg } from '../parts/FormationStageSvg';
import { MemberNameInput } from '../parts/MemberNameInput';
import { MemberPositionInput } from '../parts/MemberPositionInput';
import { MemberSelect } from '../parts/MemberSelect';
import { addMember, moveMember, removeMember, renameMember } from '../../domain/memberOperations';
import { useAppDispatch, useAppState } from '../../state/useAppState';
import './FormationEditorDialog.css';

/** 入力フィールドのグリッドセル幅（MemberPositionInput と揃える。スマホは1列、PCは3列）。 */
const FIELD_GRID_SIZE = { xs: 12, sm: 4 } as const;

const DISCARD_CONFIRM_MESSAGE = '編集内容を破棄して閉じますか？';

/**
 * 2D 編集ポップアップ（1.4 画面構成、1.5 2D エディター表示）。
 * メンバーの追加・削除・立ち位置変更（ドラッグ・数値入力）・名前編集は
 * ダイアログ内のローカル state（下書き）に対して行い、確定操作でのみ
 * アプリ全体の状態へ反映する（2.3 編集セッションと確定・破棄）。
 */
export function FormationEditorDialog() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const [draft, setDraft] = useState(state.formation);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isDraftDirty, setIsDraftDirty] = useState(false);

  const selectedMember = draft.members.find((member) => member.id === selectedMemberId) ?? null;

  if (!state.isEditorOpen) {
    return null;
  }

  const handleAdd = () => {
    const id = crypto.randomUUID();
    setDraft((current) => addMember(current, id));
    setSelectedMemberId(id);
    setIsDraftDirty(true);
  };

  const handleDelete = () => {
    if (selectedMember === null) {
      return;
    }
    if (window.confirm(`「${selectedMember.name}」を削除しますか？`)) {
      setDraft((current) => removeMember(current, selectedMember.id));
      setSelectedMemberId(null);
      setIsDraftDirty(true);
    }
  };

  const handleMove = (id: string, x: number, y: number) => {
    setDraft((current) => moveMember(current, id, x, y));
    setIsDraftDirty(true);
  };

  const handleRename = (name: string) => {
    if (selectedMember === null) {
      return;
    }
    setDraft((current) => renameMember(current, selectedMember.id, name));
    setIsDraftDirty(true);
  };

  const handleConfirm = () => {
    dispatch({ type: 'REPLACE_FORMATION', formation: draft });
    dispatch({ type: 'CLOSE_EDITOR' });
  };

  const handleCancel = () => {
    dispatch({ type: 'CLOSE_EDITOR' });
  };

  const handleDismiss = () => {
    if (isDraftDirty && !window.confirm(DISCARD_CONFIRM_MESSAGE)) {
      return;
    }
    dispatch({ type: 'CLOSE_EDITOR' });
  };

  return (
    <Dialog
      open
      onClose={handleDismiss}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { 'aria-label': '2D編集ポップアップ' } }}
    >
      <DialogContent>
        <FormationStageSvg
          formation={draft}
          selectedMemberId={selectedMemberId}
          interactive
          onSelectMember={setSelectedMemberId}
          onMoveMember={handleMove}
          className="formation-editor-dialog__svg"
        />
        <Stack spacing={1.5} className="formation-editor-dialog__controls">
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={1.5}>
                <Grid size={FIELD_GRID_SIZE}>
                  <Stack direction="row" spacing={1}>
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
                  </Stack>
                </Grid>
                <Grid size={FIELD_GRID_SIZE}>
                  <MemberSelect
                    members={draft.members}
                    selectedMemberId={selectedMemberId}
                    onSelect={setSelectedMemberId}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={1.5}>
                <Grid size={FIELD_GRID_SIZE}>
                  <MemberNameInput
                    key={`name-${selectedMember?.id ?? 'none'}`}
                    member={selectedMember}
                    onSubmit={handleRename}
                  />
                </Grid>
                <MemberPositionInput
                  key={`position-${selectedMember?.id ?? 'none'}`}
                  member={selectedMember}
                  onSubmit={(x, y) => selectedMember && handleMove(selectedMember.id, x, y)}
                />
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleCancel}>
          キャンセル
        </Button>
        <Button variant="contained" onClick={handleConfirm}>
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
}
