import { useState } from 'react';
import TextField from '@mui/material/TextField';
import type { Member } from '../../domain/types';

type MemberNameInputProps = {
  member: Member | null;
  onSubmit: (name: string) => void;
};

/**
 * 選択中メンバーの名前編集欄（1.5 メンバー名編集）。member が null（未選択）の
 * ときは無効化して表示する。親側で `key={member?.id ?? 'none'}` を指定し、
 * 選択が変わるたびに再マウントして入力値を初期化する想定。
 */
export function MemberNameInput({ member, onSubmit }: MemberNameInputProps) {
  const [draftName, setDraftName] = useState(member?.name ?? '');

  const submit = () => {
    if (member === null) {
      return;
    }
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
      disabled={member === null}
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
