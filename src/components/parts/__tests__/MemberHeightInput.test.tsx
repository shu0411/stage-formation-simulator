import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemberHeightInput } from '../MemberHeightInput';
import type { Member } from '../../../domain/types';

describe('MemberHeightInput', () => {
  const member: Member = {
    id: 'id-1',
    name: 'メンバー1',
    x: 0,
    y: 0,
    color: '#ff0000',
    height: 160,
  };

  it('メンバーの現在の身長を表示する（1.5 メンバー身長編集）', () => {
    render(<MemberHeightInput member={member} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('身長(cm)')).toHaveValue('160');
  });

  it('入力・確定すると、onSubmitへ新しい身長を渡す', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MemberHeightInput member={member} onSubmit={onSubmit} />);

    const input = screen.getByLabelText('身長(cm)');
    await user.clear(input);
    await user.type(input, '175');
    await user.tab();

    expect(onSubmit).toHaveBeenCalledWith(175);
  });

  it('Enterキーで確定する', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MemberHeightInput member={member} onSubmit={onSubmit} />);

    const input = screen.getByLabelText('身長(cm)');
    await user.clear(input);
    await user.type(input, '175{Enter}');

    expect(onSubmit).toHaveBeenCalledWith(175);
  });

  it('空文字で確定すると、onSubmitを呼ばず表示を元の身長へ戻す', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MemberHeightInput member={member} onSubmit={onSubmit} />);

    const input = screen.getByLabelText('身長(cm)');
    await user.clear(input);
    await user.tab();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('身長(cm)')).toHaveValue('160');
  });

  it('確定後にmemberの身長が丸め等で変わった場合、表示がその値に更新される', () => {
    const { rerender } = render(<MemberHeightInput member={member} onSubmit={vi.fn()} />);

    const clamped: Member = { ...member, height: 200 };
    rerender(<MemberHeightInput member={clamped} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('身長(cm)')).toHaveValue('200');
  });

  it('メンバーが未選択のとき、身長欄は無効化される', () => {
    render(<MemberHeightInput member={null} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('身長(cm)')).toBeDisabled();
  });

  it('増加ボタンをクリックすると、即座にonSubmitが呼ばれる', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MemberHeightInput member={member} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: '増加' }));

    expect(onSubmit).toHaveBeenCalledWith(161);
  });
});
