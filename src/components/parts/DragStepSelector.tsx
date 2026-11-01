import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { DRAG_STEPS } from '../../domain/dragStep';
import type { DragStep } from '../../domain/dragStep';

type DragStepSelectorProps = {
  value: DragStep;
  onChange: (dragStep: DragStep) => void;
};

/**
 * ドラッグ時の移動単位の切り替えUI（仕様: 移動単位トグル）。選択の解除はできない。
 * `CameraPresetSelector` と異なり、状態（画面幅）に依存せず全レイアウト共通で表示する。
 * `fullWidth` でセル幅に収め、タッチしやすい標準サイズのボタンにする。
 * アプリ状態には依存せず、呼び出し側（`FormationEditorDialog`）が結線する。
 */
export function DragStepSelector({ value, onChange }: DragStepSelectorProps) {
  return (
    <ToggleButtonGroup
      exclusive
      fullWidth
      value={value}
      aria-label="移動単位"
      onChange={(_event, dragStep: DragStep | null) => {
        if (dragStep !== null) {
          onChange(dragStep);
        }
      }}
    >
      {DRAG_STEPS.map((step) => (
        <ToggleButton key={step} value={step}>
          {step}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
