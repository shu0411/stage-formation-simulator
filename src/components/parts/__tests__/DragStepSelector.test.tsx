import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DragStepSelector } from '../DragStepSelector';
import { DRAG_STEPS } from '../../../domain/dragStep';
import type { DragStep } from '../../../domain/dragStep';

function renderSelector(value: DragStep, onChange = vi.fn()) {
  render(<DragStepSelector value={value} onChange={onChange} />);
  return onChange;
}

describe('DragStepSelector', () => {
  it('「移動幅」ラベルのプルダウンに、選択中の移動幅が表示される', () => {
    renderSelector(0.25);

    expect(screen.getByRole('combobox', { name: '移動幅' })).toHaveTextContent('0.25');
  });

  it('プルダウンを開くと4つの移動幅がすべて選択肢として表示される', async () => {
    const user = userEvent.setup();
    renderSelector(0.25);

    await user.click(screen.getByRole('combobox', { name: '移動幅' }));

    for (const step of DRAG_STEPS) {
      expect(screen.getByRole('option', { name: String(step) })).toBeInTheDocument();
    }
  });

  it('別の単位を選ぶとonChangeが呼ばれる', async () => {
    const user = userEvent.setup();
    const onChange = renderSelector(0.25);

    await user.click(screen.getByRole('combobox', { name: '移動幅' }));
    await user.click(screen.getByRole('option', { name: '1' }));

    expect(onChange).toHaveBeenCalledWith(1);
  });
});
