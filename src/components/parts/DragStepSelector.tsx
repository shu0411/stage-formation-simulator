import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { DRAG_STEPS } from '../../domain/dragStep';
import type { DragStep } from '../../domain/dragStep';

type DragStepSelectorProps = {
  value: DragStep;
  onChange: (dragStep: DragStep) => void;
};

/**
 * ドラッグ時の移動幅の切り替えUI（仕様: 移動幅プルダウン）。選択の解除はできない。
 * `MemberSelect` と同様、ラベル付きのプルダウン（`TextField` の `select`）として
 * 実装する。アプリ状態には依存せず、呼び出し側（`FormationEditorDialog`）が結線する。
 */
export function DragStepSelector({ value, onChange }: DragStepSelectorProps) {
  return (
    <TextField
      select
      size="small"
      fullWidth
      label="移動幅"
      value={value}
      onChange={(event) => onChange(Number(event.target.value) as DragStep)}
    >
      {DRAG_STEPS.map((step) => (
        <MenuItem key={step} value={step}>
          {step}
        </MenuItem>
      ))}
    </TextField>
  );
}
