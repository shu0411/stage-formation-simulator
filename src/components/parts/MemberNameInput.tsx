import { useState } from 'react';
import TextField from '@mui/material/TextField';
import type { Member } from '../../domain/types';

type MemberNameInputProps = {
  member: Member;
  onSubmit: (name: string) => void;
};

/**
 * 選択中メンバーの名前編集欄（1.5 メンバー名編集）。
 * 親側で `key={member.id}` を指定し、選択が変わるたびに再マウントして入力値を初期化する想定。
 */
export function MemberNameInput({ member, onSubmit }: MemberNameInputProps) {
  const [draftName, setDraftName] = useState(member.name);

  const submit = () => {
    if (draftName === '') {
      setDraftName(member.name);
      return;
    }
    onSubmit(draftName);
  };

  return (
    <TextField
      size="small"
      label="メンバー名"
      value={draftName}
      onChange={(event) => setDraftName(event.target.value)}
      onBlur={submit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          submit();
        }
      }}
    />
  );
}
