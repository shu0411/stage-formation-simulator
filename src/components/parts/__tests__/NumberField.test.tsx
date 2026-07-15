import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NumberField } from '../NumberField';

describe('NumberField', () => {
  it('ラベルと初期値を表示する', () => {
    render(<NumberField label="X座標" value={1} onValueCommitted={vi.fn()} />);

    expect(screen.getByLabelText('X座標')).toHaveValue('1');
  });

  it('増加ボタンをクリックすると、値が増え、onValueCommittedが呼ばれる', async () => {
    const onValueCommitted = vi.fn();
    const user = userEvent.setup();
    render(<NumberField label="X座標" value={1} onValueCommitted={onValueCommitted} />);

    await user.click(screen.getByRole('button', { name: '増加' }));

    expect(onValueCommitted).toHaveBeenCalledWith(2, expect.anything());
  });

  it('減少ボタンをクリックすると、値が減り、onValueCommittedが呼ばれる', async () => {
    const onValueCommitted = vi.fn();
    const user = userEvent.setup();
    render(<NumberField label="X座標" value={1} onValueCommitted={onValueCommitted} />);

    await user.click(screen.getByRole('button', { name: '減少' }));

    expect(onValueCommitted).toHaveBeenCalledWith(0, expect.anything());
  });

  it('値を入力してフォーカスを外すと、onValueCommittedが呼ばれる', async () => {
    const onValueCommitted = vi.fn();
    const user = userEvent.setup();
    render(<NumberField label="X座標" value={1} onValueCommitted={onValueCommitted} />);

    const input = screen.getByLabelText('X座標');
    await user.clear(input);
    await user.type(input, '5');
    await user.tab();

    expect(onValueCommitted).toHaveBeenCalledWith(5, expect.anything());
  });

  it('disabledのとき、入力欄と増減ボタンが無効化される', () => {
    render(<NumberField label="X座標" value={null} disabled onValueCommitted={vi.fn()} />);

    expect(screen.getByLabelText('X座標')).toBeDisabled();
    expect(screen.getByRole('button', { name: '増加' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '減少' })).toBeDisabled();
  });
});
