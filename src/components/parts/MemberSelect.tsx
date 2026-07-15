import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import type { Member } from '../../domain/types';

type MemberSelectProps = {
  members: Member[];
  selectedMemberId: string | null;
  onSelect: (id: string) => void;
};

/** メンバー一覧から選び、選択状態にする（フォーカスする）プルダウン（1.6 メンバーの選択）。 */
export function MemberSelect({ members, selectedMemberId, onSelect }: MemberSelectProps) {
  return (
    <TextField
      select
      size="small"
      label="メンバーを選択"
      value={selectedMemberId ?? ''}
      disabled={members.length === 0}
      onChange={(event) => onSelect(event.target.value)}
    >
      {members.map((member) => (
        <MenuItem key={member.id} value={member.id}>
          {member.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
