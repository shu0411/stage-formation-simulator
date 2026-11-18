import { describe, expect, it } from 'vitest';
import {
  addMember,
  changeMemberColor,
  changeMemberHeight,
  moveMember,
  removeMember,
  renameMember,
} from '../memberOperations';
import { fromMeters } from '../axisScale';
import { STAGE_HALF_WIDTH, X_AXIS_SCALE, Y_AXIS_SCALE } from '../stageConstants';
import {
  DEFAULT_MEMBER_COLOR,
  DEFAULT_MEMBER_HEIGHT_CM,
  MAX_MEMBER_HEIGHT_CM,
  MIN_MEMBER_HEIGHT_CM,
} from '../types';
import type { Show } from '../types';

/** フォーメーションが2つある演目（2.2 技術設計 テスト計画）。 */
function showWithTwoFormations(): Show {
  return {
    members: [
      { id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 },
      { id: 'id-2', name: 'メンバー2', color: '#00ff00', height: 150 },
    ],
    formations: [
      {
        id: 'f-1',
        name: 'フォーメーション1',
        positions: { 'id-1': { x: 0, y: 0 }, 'id-2': { x: 1, y: 1 } },
      },
      {
        id: 'f-2',
        name: 'フォーメーション2',
        positions: { 'id-1': { x: -1, y: -1 }, 'id-2': { x: -2, y: -2 } },
      },
    ],
  };
}

describe('addMember', () => {
  it('メンバーが0人のとき、「メンバー1」を1人追加する', () => {
    const show: Show = {
      members: [],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: {} }],
    };

    const next = addMember(show, 'id-1');

    expect(next.members).toHaveLength(1);
    expect(next.members[0]).toEqual({
      id: 'id-1',
      name: 'メンバー1',
      color: DEFAULT_MEMBER_COLOR,
      height: DEFAULT_MEMBER_HEIGHT_CM,
    });
  });

  it('メンバーがN人のとき、N+1人になり新しいメンバーは連番の名前になる', () => {
    const show = showWithTwoFormations();

    const next = addMember(show, 'id-3');

    expect(next.members).toHaveLength(3);
    expect(next.members[2].id).toBe('id-3');
    expect(next.members[2].name).toBe('メンバー3');
  });

  it('全フォーメーションのpositionsに、新しいメンバーの原点の立ち位置を追加する', () => {
    const show = showWithTwoFormations();

    const next = addMember(show, 'id-3');

    expect(next.formations[0].positions['id-3']).toEqual({ x: 0, y: 0 });
    expect(next.formations[1].positions['id-3']).toEqual({ x: 0, y: 0 });
  });
});

describe('removeMember', () => {
  it('membersから指定したIDのメンバーを削除する', () => {
    const show = showWithTwoFormations();

    const next = removeMember(show, 'id-1');

    expect(next.members).toEqual([
      { id: 'id-2', name: 'メンバー2', color: '#00ff00', height: 150 },
    ]);
  });

  it('全フォーメーションのpositionsから指定したIDを削除する', () => {
    const show = showWithTwoFormations();

    const next = removeMember(show, 'id-1');

    expect(next.formations[0].positions).toEqual({ 'id-2': { x: 1, y: 1 } });
    expect(next.formations[1].positions).toEqual({ 'id-2': { x: -2, y: -2 } });
  });

  it('存在しないIDを指定した場合は変化しない', () => {
    const show = showWithTwoFormations();

    const next = removeMember(show, 'unknown');

    expect(next).toEqual(show);
  });
});

describe('moveMember', () => {
  it('指定したフォーメーションの、指定したメンバーの座標だけを更新する', () => {
    const show = showWithTwoFormations();

    const next = moveMember(show, 'f-1', 'id-1', 3, -2);

    expect(next.formations[0].positions['id-1']).toEqual({ x: 3, y: -2 });
    expect(next.formations[0].positions['id-2']).toEqual({ x: 1, y: 1 });
    expect(next.formations[1].positions).toEqual(show.formations[1].positions);
  });

  it('0.05単位に満たない座標を指定した場合は最も近い0.05単位に丸める', () => {
    const show = showWithTwoFormations();

    const next = moveMember(show, 'f-1', 'id-1', 1.234, -2.777);

    expect(next.formations[0].positions['id-1'].x).toBeCloseTo(1.25);
    expect(next.formations[0].positions['id-1'].y).toBeCloseTo(-2.8);
  });

  it('ステージ範囲外の座標を指定した場合、範囲内に収まる0.05単位の値に丸める（端そのものが0.05単位でない場合は端にしない）', () => {
    const show = showWithTwoFormations();
    const xMax = fromMeters(STAGE_HALF_WIDTH, X_AXIS_SCALE);
    const yFront = fromMeters(0, Y_AXIS_SCALE);

    const next = moveMember(show, 'f-1', 'id-1', xMax + 5, yFront + 5);

    // xMax(6.2222...) は0.05単位でないため、範囲内に収まる6.2に丸められる
    expect(next.formations[0].positions['id-1'].x).toBeCloseTo(6.2);
    expect(next.formations[0].positions['id-1'].x).toBeLessThanOrEqual(xMax);
    // yFront(2) は既に0.05単位のため、端そのものになる
    expect(next.formations[0].positions['id-1'].y).toBeCloseTo(yFront);
  });

  it('存在しないフォーメーションIDを指定した場合は変化しない', () => {
    const show = showWithTwoFormations();

    const next = moveMember(show, 'unknown', 'id-1', 1, 1);

    expect(next).toEqual(show);
  });

  it('存在しないメンバーIDを指定した場合は変化しない', () => {
    const show = showWithTwoFormations();

    const next = moveMember(show, 'f-1', 'unknown', 1, 1);

    expect(next).toEqual(show);
  });
});

describe('renameMember', () => {
  it('指定したメンバーの名前を更新する', () => {
    const show = showWithTwoFormations();

    const next = renameMember(show, 'id-1', 'あいり');

    expect(next.members[0].name).toBe('あいり');
  });

  it('空文字を指定した場合は名前を変更しない', () => {
    const show = showWithTwoFormations();

    const next = renameMember(show, 'id-1', '');

    expect(next.members[0].name).toBe('メンバー1');
  });

  it('存在しないIDを指定した場合は変化しない', () => {
    const show = showWithTwoFormations();

    const next = renameMember(show, 'unknown', 'あいり');

    expect(next).toEqual(show);
  });
});

describe('changeMemberColor', () => {
  it('指定したメンバーのカラーを更新する（1.5 メンバーカラー編集）', () => {
    const show = showWithTwoFormations();

    const next = changeMemberColor(show, 'id-1', '#0000ff');

    expect(next.members[0].color).toBe('#0000ff');
  });

  it('存在しないIDを指定した場合は変化しない', () => {
    const show = showWithTwoFormations();

    const next = changeMemberColor(show, 'unknown', '#0000ff');

    expect(next).toEqual(show);
  });
});

describe('changeMemberHeight', () => {
  it('指定したメンバーの身長を更新する（1.5 メンバー身長編集）', () => {
    const show = showWithTwoFormations();

    const next = changeMemberHeight(show, 'id-1', 175);

    expect(next.members[0].height).toBe(175);
  });

  it(`${MIN_MEMBER_HEIGHT_CM}cm未満の値を指定した場合は${MIN_MEMBER_HEIGHT_CM}cmに丸める（1.5 メンバー身長編集）`, () => {
    const show = showWithTwoFormations();

    const next = changeMemberHeight(show, 'id-1', MIN_MEMBER_HEIGHT_CM - 10);

    expect(next.members[0].height).toBe(MIN_MEMBER_HEIGHT_CM);
  });

  it(`${MAX_MEMBER_HEIGHT_CM}cmを超える値を指定した場合は${MAX_MEMBER_HEIGHT_CM}cmに丸める（1.5 メンバー身長編集）`, () => {
    const show = showWithTwoFormations();

    const next = changeMemberHeight(show, 'id-1', MAX_MEMBER_HEIGHT_CM + 10);

    expect(next.members[0].height).toBe(MAX_MEMBER_HEIGHT_CM);
  });

  it('存在しないIDを指定した場合は変化しない', () => {
    const show = showWithTwoFormations();

    const next = changeMemberHeight(show, 'unknown', 175);

    expect(next).toEqual(show);
  });
});
