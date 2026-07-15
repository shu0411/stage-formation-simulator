import Grid from '@mui/material/Grid';
import { NumberField } from './NumberField';
import { frontBackSpinnerLabels } from './frontBackSpinnerLabels';
import { Y_AXIS_SCALE } from '../../domain/stageConstants';
import type { Member } from '../../domain/types';

/** 入力フィールドのグリッドセル幅（1.6 メンバーの選択欄と揃える。スマホは1列、PCは3列）。 */
const FIELD_GRID_SIZE = { xs: 12, sm: 4 } as const;

type MemberPositionInputProps = {
  member: Member | null;
  onSubmit: (x: number, y: number) => void;
};

/** スピナー・矢印キー・ホイールで増減する刻み幅（1.6 立ち位置の範囲の丸め単位と揃える）。 */
const POSITION_STEP = 0.05;
/** Shift キーを押しながら増減するときの刻み幅。 */
const LARGE_POSITION_STEP = 1;

/**
 * 選択中メンバーの立ち位置（左右・前後）数値入力欄（1.5 立ち位置変更）。
 * member が null（未選択）のときは無効化して表示する。範囲外の値のクランプと
 * 0.05 単位への丸めは呼び出し側（moveMember）が行うため、ここでは行わない。
 * 直接のテキスト入力は blur / Enter で確定し、スピナー操作・フォーカス中の
 * 矢印キー・ホイール操作は Base UI の `NumberField` が `onValueCommitted` を
 * 操作のたびに呼ぶことで即座に確定する。
 */
export function MemberPositionInput({ member, onSubmit }: MemberPositionInputProps) {
  const yLabels = frontBackSpinnerLabels(Y_AXIS_SCALE.direction);

  return (
    <>
      <Grid size={FIELD_GRID_SIZE}>
        <NumberField
          label="左右"
          size="small"
          fullWidth
          value={member?.x ?? null}
          disabled={member === null}
          step={POSITION_STEP}
          largeStep={LARGE_POSITION_STEP}
          incrementLabel="上手へ"
          decrementLabel="下手へ"
          onValueCommitted={(value) => {
            if (member !== null && value !== null) {
              onSubmit(value, member.y);
            }
          }}
        />
      </Grid>
      <Grid size={FIELD_GRID_SIZE}>
        <NumberField
          label="前後"
          size="small"
          fullWidth
          value={member?.y ?? null}
          disabled={member === null}
          step={POSITION_STEP}
          largeStep={LARGE_POSITION_STEP}
          incrementLabel={yLabels.increment}
          decrementLabel={yLabels.decrement}
          onValueCommitted={(value) => {
            if (member !== null && value !== null) {
              onSubmit(member.x, value);
            }
          }}
        />
      </Grid>
    </>
  );
}
