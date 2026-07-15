import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemberPositionInput } from '../MemberPositionInput';
import type { Member } from '../../../domain/types';

describe('MemberPositionInput', () => {
  const member: Member = { id: 'id-1', name: 'メンバー1', x: 1, y: 2 };

  it('メンバーの現在のX・Y座標を表示する（1.5 立ち位置変更）', () => {
    render(<MemberPositionInput member={member} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('左右')).toHaveValue('1');
    expect(screen.getByLabelText('前後')).toHaveValue('2');
  });

  it('X座標を入力・確定すると、Y座標は現在値のままonSubmitへ渡す', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MemberPositionInput member={member} onSubmit={onSubmit} />);

    const input = screen.getByLabelText('左右');
    await user.clear(input);
    await user.type(input, '3.5');
    await user.tab();

    expect(onSubmit).toHaveBeenCalledWith(3.5, 2);
  });

  it('Y座標を入力・確定すると、X座標は現在値のままonSubmitへ渡す', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MemberPositionInput member={member} onSubmit={onSubmit} />);

    const input = screen.getByLabelText('前後');
    await user.clear(input);
    await user.type(input, '-4');
    await user.tab();

    expect(onSubmit).toHaveBeenCalledWith(1, -4);
  });

  it('Enterキーで確定する', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MemberPositionInput member={member} onSubmit={onSubmit} />);

    const input = screen.getByLabelText('左右');
    await user.clear(input);
    await user.type(input, '5{Enter}');

    expect(onSubmit).toHaveBeenCalledWith(5, 2);
  });

  it('空文字で確定すると、onSubmitを呼ばず表示を元の座標へ戻す', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MemberPositionInput member={member} onSubmit={onSubmit} />);

    const input = screen.getByLabelText('左右');
    await user.clear(input);
    await user.tab();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('左右')).toHaveValue('1');
  });

  it('確定後にmemberの座標が丸め等で変わった場合、表示がその値に更新される', () => {
    const { rerender } = render(<MemberPositionInput member={member} onSubmit={vi.fn()} />);

    const snapped: Member = { ...member, x: 3.25 };
    rerender(<MemberPositionInput member={snapped} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('左右')).toHaveValue('3.25');
  });

  it('メンバーが未選択のとき、X・Y座標欄は無効化される', () => {
    render(<MemberPositionInput member={null} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('左右')).toBeDisabled();
    expect(screen.getByLabelText('前後')).toBeDisabled();
  });

  it('X座標の増加ボタンをクリックすると、即座にonSubmitが呼ばれる', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MemberPositionInput member={member} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: '右へ' }));

    expect(onSubmit).toHaveBeenCalledWith(1.05, 2);
  });

  it('Y座標の減少ボタンをクリックすると、即座にonSubmitが呼ばれる', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MemberPositionInput member={member} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: '後ろへ' }));

    expect(onSubmit).toHaveBeenCalledWith(1, 1.95);
  });
});
