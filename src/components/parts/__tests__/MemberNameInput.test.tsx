import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemberNameInput } from '../MemberNameInput';
import type { Member } from '../../../domain/types';

describe('MemberNameInput', () => {
  const member: Member = { id: 'id-1', name: 'メンバー1', x: 0, y: 0 };

  it('入力・確定するとonSubmitへ新しい名前を渡す（1.5 メンバー名編集）', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MemberNameInput member={member} onSubmit={onSubmit} />);

    const input = screen.getByLabelText('メンバー名');
    await user.clear(input);
    await user.type(input, 'あいり');
    await user.tab();

    expect(onSubmit).toHaveBeenCalledWith('あいり');
  });

  it('空文字で確定するとonSubmitを呼ばず、表示を元の名前へ戻す', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MemberNameInput member={member} onSubmit={onSubmit} />);

    const input = screen.getByLabelText('メンバー名');
    await user.clear(input);
    await user.tab();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('メンバー名')).toHaveValue('メンバー1');
  });

  it('Enterキーで確定する', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MemberNameInput member={member} onSubmit={onSubmit} />);

    const input = screen.getByLabelText('メンバー名');
    await user.clear(input);
    await user.type(input, 'あいり{Enter}');

    expect(onSubmit).toHaveBeenCalledWith('あいり');
  });
});
