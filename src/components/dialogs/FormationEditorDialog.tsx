import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { FormationStageSvg } from '../parts/FormationStageSvg';
import { MemberColorInput } from '../parts/MemberColorInput';
import { MemberHeightInput } from '../parts/MemberHeightInput';
import { MemberNameInput } from '../parts/MemberNameInput';
import { MemberPositionInput } from '../parts/MemberPositionInput';
import { MemberSelect } from '../parts/MemberSelect';
import { useEditorLayout } from '../../hooks/useEditorLayout';
import {
  addMember,
  changeMemberColor,
  changeMemberHeight,
  moveMember,
  removeMember,
  renameMember,
} from '../../domain/memberOperations';
import { useAppDispatch, useAppState } from '../../state/useAppState';
import type { Formation, Member } from '../../domain/types';
import type { GridSize } from '@mui/material/Grid';
import type { ResponsiveStyleValue } from '@mui/system';
import type { SxProps, Theme } from '@mui/material/styles';
import './FormationEditorDialog.css';

/** 入力フィールドのグリッドセル幅（PC・モバイル縦表示はスマホ1列・PC3列、モバイル横表示は常に1列。design.md 2.1）。 */
const STACKED_FIELD_GRID_SIZE = { xs: 12, sm: 4 } as const;
const LANDSCAPE_FIELD_GRID_SIZE = 12 as const;

/** モバイル表示（縦・横）での CardContent の余白（design.md 1.6 対応環境）。 */
const MOBILE_CARD_CONTENT_SX: SxProps<Theme> = { p: 1.5, '&:last-child': { pb: 1.5 } };

const DISCARD_CONFIRM_MESSAGE = '編集内容を破棄して閉じますか？';

type OverviewCardProps = {
  draft: Formation;
  selectedMemberId: string | null;
  onSelectMember: (id: string) => void;
  onMoveMember: (id: string, x: number, y: number) => void;
  /** true の場合、俯瞰図をカラムの高さいっぱいに収まる最大サイズで中央表示する（モバイル横表示）。 */
  fitToColumn?: boolean;
};

/** 俯瞰図 Card（design.md 1.4 2D 編集ポップアップ）。 */
function OverviewCard({
  draft,
  selectedMemberId,
  onSelectMember,
  onMoveMember,
  fitToColumn = false,
}: OverviewCardProps) {
  return (
    <Card
      variant="outlined"
      sx={
        fitToColumn
          ? {
              p: 1,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }
          : { p: 1 }
      }
    >
      <FormationStageSvg
        formation={draft}
        selectedMemberId={selectedMemberId}
        interactive
        onSelectMember={onSelectMember}
        onMoveMember={onMoveMember}
        className={
          fitToColumn
            ? 'formation-editor-dialog__svg formation-editor-dialog__svg--fit-column'
            : 'formation-editor-dialog__svg'
        }
      />
    </Card>
  );
}

type ControlsCardProps = {
  draft: Formation;
  selectedMember: Member | null;
  selectedMemberId: string | null;
  fieldGridSize: ResponsiveStyleValue<GridSize>;
  cardContentSx?: SxProps<Theme>;
  onAdd: () => void;
  onDelete: () => void;
  onSelectMember: (id: string) => void;
};

/** 操作欄 Card（メンバーの追加・削除・選択。design.md 1.4 2D 編集ポップアップ）。 */
function ControlsCard({
  draft,
  selectedMember,
  selectedMemberId,
  fieldGridSize,
  cardContentSx,
  onAdd,
  onDelete,
  onSelectMember,
}: ControlsCardProps) {
  return (
    <Card variant="outlined">
      <CardContent sx={cardContentSx}>
        <Grid container spacing={1.5}>
          <Grid size={fieldGridSize}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={onAdd}>
                メンバーを追加
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={onDelete}
                disabled={selectedMember === null}
              >
                削除
              </Button>
            </Stack>
          </Grid>
          <Grid size={fieldGridSize}>
            <MemberSelect
              members={draft.members}
              selectedMemberId={selectedMemberId}
              onSelect={onSelectMember}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

type InputsCardProps = {
  selectedMember: Member | null;
  fieldGridSize: ResponsiveStyleValue<GridSize>;
  cardContentSx?: SxProps<Theme>;
  onRename: (name: string) => void;
  onChangeColor: (color: string) => void;
  onChangeHeight: (height: number) => void;
  onMove: (x: number, y: number) => void;
};

/** 入力欄 Card（名前・カラー・身長・立ち位置。design.md 1.4 2D 編集ポップアップ）。 */
function InputsCard({
  selectedMember,
  fieldGridSize,
  cardContentSx,
  onRename,
  onChangeColor,
  onChangeHeight,
  onMove,
}: InputsCardProps) {
  return (
    <Card variant="outlined">
      <CardContent sx={cardContentSx}>
        <Grid container spacing={1.5}>
          <Grid size={fieldGridSize}>
            <MemberNameInput
              key={`name-${selectedMember?.id ?? 'none'}`}
              member={selectedMember}
              onSubmit={onRename}
            />
          </Grid>
          <Grid size={fieldGridSize}>
            <MemberColorInput member={selectedMember} onSubmit={onChangeColor} />
          </Grid>
          <Grid size={fieldGridSize}>
            <MemberHeightInput
              key={`height-${selectedMember?.id ?? 'none'}`}
              member={selectedMember}
              onSubmit={onChangeHeight}
            />
          </Grid>
          <MemberPositionInput
            key={`position-${selectedMember?.id ?? 'none'}`}
            member={selectedMember}
            onSubmit={onMove}
            gridSize={fieldGridSize}
          />
        </Grid>
      </CardContent>
    </Card>
  );
}

/**
 * 2D 編集ポップアップ（1.4 画面構成、1.5 2D エディター表示）。
 * メンバーの追加・削除・立ち位置変更（ドラッグ・数値入力）・名前編集は
 * ダイアログ内のローカル state（下書き）に対して行い、確定操作でのみ
 * アプリ全体の状態へ反映する（2.3 編集セッションと確定・破棄）。
 * レイアウトは `useEditorLayout` の判定に応じて PC・モバイル縦表示・
 * モバイル横表示の 3 種類を切り替える（design.md 1.6 対応環境）。
 */
export function FormationEditorDialog() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const layout = useEditorLayout();

  const [draft, setDraft] = useState(state.formation);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isDraftDirty, setIsDraftDirty] = useState(false);

  const selectedMember = draft.members.find((member) => member.id === selectedMemberId) ?? null;

  if (!state.isEditorOpen) {
    return null;
  }

  const isMobile = layout !== 'desktop';
  const isMobileLandscape = layout === 'mobileLandscape';
  const fieldGridSize = isMobileLandscape ? LANDSCAPE_FIELD_GRID_SIZE : STACKED_FIELD_GRID_SIZE;
  const cardContentSx = isMobile ? MOBILE_CARD_CONTENT_SX : undefined;

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

  const handleChangeColor = (color: string) => {
    if (selectedMember === null) {
      return;
    }
    setDraft((current) => changeMemberColor(current, selectedMember.id, color));
    setIsDraftDirty(true);
  };

  const handleChangeHeight = (height: number) => {
    if (selectedMember === null) {
      return;
    }
    setDraft((current) => changeMemberHeight(current, selectedMember.id, height));
    setIsDraftDirty(true);
  };

  const handleConfirm = () => {
    dispatch({ type: 'REPLACE_FORMATION', formation: draft });
    dispatch({ type: 'CLOSE_EDITOR' });
  };

  /** キャンセルボタン・ダイアログ外クリック・Escape キーいずれも、下書きに変更があれば確認したうえで破棄する。 */
  const handleDiscard = () => {
    if (isDraftDirty && !window.confirm(DISCARD_CONFIRM_MESSAGE)) {
      return;
    }
    dispatch({ type: 'CLOSE_EDITOR' });
  };

  return (
    <Dialog
      open
      onClose={handleDiscard}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      slotProps={{ paper: { 'aria-label': '2D編集ポップアップ' } }}
    >
      {isMobileLandscape ? (
        <DialogContent
          sx={{
            p: 1,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '3fr 2fr',
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0, minHeight: 0 }}>
            <OverviewCard
              draft={draft}
              selectedMemberId={selectedMemberId}
              onSelectMember={setSelectedMemberId}
              onMoveMember={handleMove}
              fitToColumn
            />
          </Box>
          <Box
            sx={{
              minWidth: 0,
              minHeight: 0,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <ControlsCard
              draft={draft}
              selectedMember={selectedMember}
              selectedMemberId={selectedMemberId}
              fieldGridSize={fieldGridSize}
              cardContentSx={cardContentSx}
              onAdd={handleAdd}
              onDelete={handleDelete}
              onSelectMember={setSelectedMemberId}
            />
            <InputsCard
              selectedMember={selectedMember}
              fieldGridSize={fieldGridSize}
              cardContentSx={cardContentSx}
              onRename={handleRename}
              onChangeColor={handleChangeColor}
              onChangeHeight={handleChangeHeight}
              onMove={(x, y) => selectedMember && handleMove(selectedMember.id, x, y)}
            />
          </Box>
        </DialogContent>
      ) : (
        <DialogContent sx={isMobile ? { p: 1 } : undefined}>
          <Stack spacing={1.5}>
            <OverviewCard
              draft={draft}
              selectedMemberId={selectedMemberId}
              onSelectMember={setSelectedMemberId}
              onMoveMember={handleMove}
            />
            <ControlsCard
              draft={draft}
              selectedMember={selectedMember}
              selectedMemberId={selectedMemberId}
              fieldGridSize={fieldGridSize}
              cardContentSx={cardContentSx}
              onAdd={handleAdd}
              onDelete={handleDelete}
              onSelectMember={setSelectedMemberId}
            />
            <InputsCard
              selectedMember={selectedMember}
              fieldGridSize={fieldGridSize}
              cardContentSx={cardContentSx}
              onRename={handleRename}
              onChangeColor={handleChangeColor}
              onChangeHeight={handleChangeHeight}
              onMove={(x, y) => selectedMember && handleMove(selectedMember.id, x, y)}
            />
          </Stack>
        </DialogContent>
      )}
      <DialogActions>
        <Button variant="outlined" onClick={handleDiscard}>
          キャンセル
        </Button>
        <Button variant="contained" onClick={handleConfirm}>
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
}
