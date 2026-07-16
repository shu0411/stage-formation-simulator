import { NumberField } from './NumberField';
import type { Member } from '../../domain/types';

type MemberHeightInputProps = {
  member: Member | null;
  onSubmit: (height: number) => void;
};

/** スピナー・矢印キー・ホイールで増減する刻み幅。 */
const HEIGHT_STEP = 1;

/**
 * 選択中メンバーの身長（cm）数値入力欄（1.5 メンバー身長編集）。
 * member が null（未選択）のときは無効化して表示する。範囲（100〜200cm）への
 * クランプは呼び出し側（changeMemberHeight）が行うため、ここでは行わない。
 * 確定方法は `MemberPositionInput` と同様（blur/Enter・スピナー等は即時確定）。
 */
export function MemberHeightInput({ member, onSubmit }: MemberHeightInputProps) {
  return (
    <NumberField
      label="身長(cm)"
      size="small"
      fullWidth
      value={member?.height ?? null}
      disabled={member === null}
      step={HEIGHT_STEP}
      onValueCommitted={(value) => {
        if (member !== null && value !== null) {
          onSubmit(value);
        }
      }}
    />
  );
}
