import { MuiColorInput } from 'mui-color-input';
import { DEFAULT_MEMBER_COLOR } from '../../domain/types';
import type { Member } from '../../domain/types';

type MemberColorInputProps = {
  member: Member | null;
  onSubmit: (color: string) => void;
};

/**
 * 選択中メンバーのカラー編集欄（1.5 メンバーカラー編集）。member が null（未選択）の
 * ときは無効化して表示する。`mui-color-input` の `onChange` は変更のたびに呼ばれる
 * ため、値が変わるたびに即座に確定する（2.1 カラー選択欄）。
 */
export function MemberColorInput({ member, onSubmit }: MemberColorInputProps) {
  return (
    <MuiColorInput
      size="small"
      fullWidth
      format="hex"
      label="カラー"
      value={member?.color ?? DEFAULT_MEMBER_COLOR}
      disabled={member === null}
      onChange={(color) => onSubmit(color)}
    />
  );
}
