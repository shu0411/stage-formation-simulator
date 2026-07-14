import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormationStageSvg } from '../FormationStageSvg';
import type { Formation } from '../../../domain/types';

describe('FormationStageSvg', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('グリッド線を表示する（1.6 グリッド表示）', () => {
    const { container } = render(<FormationStageSvg formation={{ members: [] }} />);

    expect(container.querySelectorAll('.grid-line').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('.grid-line--center').length).toBeGreaterThan(0);
  });

  it('メンバーが0人のときはステージのみ表示する（1.5 エラー・空状態）', () => {
    const { container } = render(<FormationStageSvg formation={{ members: [] }} />);

    expect(container.querySelectorAll('.member').length).toBe(0);
  });

  it('メンバーを描画し、選択中のメンバーを視覚的に区別する（1.6 メンバーの選択）', () => {
    const formation: Formation = {
      members: [
        { id: 'id-1', name: 'メンバー1', x: 0, y: 0 },
        { id: 'id-2', name: 'メンバー2', x: 1, y: 1 },
      ],
    };

    render(<FormationStageSvg formation={formation} selectedMemberId="id-1" />);

    expect(screen.getByTestId('member-id-1').getAttribute('class')).toContain('member--selected');
    expect(screen.getByTestId('member-id-2').getAttribute('class')).not.toContain(
      'member--selected',
    );
  });

  it('interactiveがfalseのときメンバーをクリックしても選択されない', () => {
    const onSelectMember = vi.fn();
    const formation: Formation = { members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }] };

    render(
      <FormationStageSvg
        formation={formation}
        interactive={false}
        onSelectMember={onSelectMember}
      />,
    );
    fireEvent.click(screen.getByTestId('member-id-1'));

    expect(onSelectMember).not.toHaveBeenCalled();
  });

  it('interactiveがtrueのときメンバーをクリックすると選択される', () => {
    const onSelectMember = vi.fn();
    const formation: Formation = { members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }] };

    render(<FormationStageSvg formation={formation} interactive onSelectMember={onSelectMember} />);
    fireEvent.click(screen.getByTestId('member-id-1'));

    expect(onSelectMember).toHaveBeenCalledWith('id-1');
  });

  it('interactiveがtrueのときドラッグするとonMoveMemberが呼ばれる（1.5 立ち位置変更）', () => {
    vi.spyOn(SVGSVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 1200,
      height: 800,
      right: 1200,
      bottom: 800,
      x: 0,
      y: 0,
      toJSON: () => '',
    });
    const onMoveMember = vi.fn();
    const formation: Formation = { members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }] };

    render(<FormationStageSvg formation={formation} interactive onMoveMember={onMoveMember} />);
    fireEvent.pointerDown(screen.getByTestId('member-id-1'));
    fireEvent(window, new PointerEvent('pointermove', { clientX: 900, clientY: 200 }));

    expect(onMoveMember).toHaveBeenCalledWith('id-1', 3, 2);
  });
});
