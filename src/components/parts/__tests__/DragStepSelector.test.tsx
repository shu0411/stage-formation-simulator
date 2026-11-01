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
  it('4つの移動単位がすべて表示され、選択中の単位が押下状態になる（仕様: 移動単位トグル）', () => {
    renderSelector(0.25);

    for (const step of DRAG_STEPS) {
      const button = screen.getByRole('button', { name: String(step) });
      expect(button).toHaveAttribute('aria-pressed', step === 0.25 ? 'true' : 'false');
    }
  });

  it('別の単位を押すとonChangeが呼ばれる', async () => {
    const user = userEvent.setup();
    const onChange = renderSelector(0.25);

    await user.click(screen.getByRole('button', { name: '1' }));

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('選択中の単位を押してもonChangeは呼ばれない（選択の解除はできない）', async () => {
    const user = userEvent.setup();
    const onChange = renderSelector(0.25);

    await user.click(screen.getByRole('button', { name: '0.25' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
