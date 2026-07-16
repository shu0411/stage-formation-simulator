import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemberColorInput } from '../MemberColorInput';
import { DEFAULT_MEMBER_COLOR } from '../../../domain/types';
import type { Member } from '../../../domain/types';

describe('MemberColorInput', () => {
  const member: Member = {
    id: 'id-1',
    name: 'メンバー1',
    x: 0,
    y: 0,
    color: '#ff0000',
    height: 160,
  };

  it('メンバーの現在のカラーを表示する（1.5 メンバーカラー編集）', () => {
    render(<MemberColorInput member={member} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('カラー')).toHaveValue('#ff0000');
  });

  it('カラーを変更すると、即座にonSubmitへ新しいカラーを渡す', () => {
    const onSubmit = vi.fn();
    render(<MemberColorInput member={member} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('カラー'), { target: { value: '#00ff00' } });

    expect(onSubmit).toHaveBeenCalledWith('#00ff00');
  });

  it('メンバーが未選択のとき、カラー欄は無効化される', () => {
    render(<MemberColorInput member={null} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('カラー')).toBeDisabled();
    expect(screen.getByLabelText('カラー')).toHaveValue(DEFAULT_MEMBER_COLOR);
  });
});
