import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormationStageSvg } from '../FormationStageSvg';
import { Y_AXIS_SCALE } from '../../../domain/stageConstants';
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

  it('グリッドの下辺・左辺・右辺にグリッド番号を表示する（1.6 グリッド表示）', () => {
    render(<FormationStageSvg formation={{ members: [] }} />);

    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.getAllByText(String(Y_AXIS_SCALE.referenceValue)).length).toBeGreaterThan(0);
  });

  it('前後（Y軸）の0のグリッド線を太線で表示する（左右軸の0番の線と同様）', () => {
    const { container } = render(<FormationStageSvg formation={{ members: [] }} />);

    // 縦線（左右軸）・横線（前後軸）それぞれ1本ずつ、0番の線がgrid-line--centerになる
    const centerLines = container.querySelectorAll('.grid-line--center');
    expect(centerLines.length).toBe(2);
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

  it('interactiveがfalseのときメンバーを押しても選択されない', () => {
    const onSelectMember = vi.fn();
    const formation: Formation = { members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }] };

    render(
      <FormationStageSvg
        formation={formation}
        interactive={false}
        onSelectMember={onSelectMember}
      />,
    );
    fireEvent.pointerDown(screen.getByTestId('member-id-1'));

    expect(onSelectMember).not.toHaveBeenCalled();
  });

  it('interactiveがtrueのときメンバーを押すと選択される（ドラッグ開始時点で選択し、移動完了を待たない）', () => {
    const onSelectMember = vi.fn();
    const formation: Formation = { members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }] };

    render(<FormationStageSvg formation={formation} interactive onSelectMember={onSelectMember} />);
    fireEvent.pointerDown(screen.getByTestId('member-id-1'));

    expect(onSelectMember).toHaveBeenCalledWith('id-1');
  });

  it('interactiveがtrueのときドラッグするとonMoveMemberが呼ばれる（1.5 立ち位置変更）', () => {
    vi.spyOn(SVGSVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
      // STAGE_VIEW_BOX（x: -6.6〜6.6, y: 0〜7）に対して 100px/m のスケールで対応させる
      left: 0,
      top: 0,
      width: 1320,
      height: 700,
      right: 1320,
      bottom: 700,
      x: 0,
      y: 0,
      toJSON: () => '',
    });
    const onMoveMember = vi.fn();
    const formation: Formation = { members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }] };

    render(<FormationStageSvg formation={formation} interactive onMoveMember={onMoveMember} />);
    fireEvent.pointerDown(screen.getByTestId('member-id-1'));
    // svg空間で (x=0, y=6=STAGE_DEPTH) はステージ中央・手前端
    fireEvent(window, new PointerEvent('pointermove', { clientX: 660, clientY: 600 }));

    expect(onMoveMember).toHaveBeenCalledWith('id-1', 0, Y_AXIS_SCALE.referenceValue);
  });
});
