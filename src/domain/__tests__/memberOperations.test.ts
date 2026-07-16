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
import type { Formation } from '../types';

describe('addMember', () => {
  it('メンバーが0人のとき、原点に「メンバー1」を1人追加する（2.2 メンバー追加時の初期位置）', () => {
    const formation: Formation = { members: [] };

    const next = addMember(formation, 'id-1');

    expect(next.members).toHaveLength(1);
    expect(next.members[0].id).toBe('id-1');
    expect(next.members[0].name).toBe('メンバー1');
    expect(next.members[0].x).toBe(0);
    expect(next.members[0].y).toBe(0);
  });

  it('メンバーがN人のとき、N+1人になり新しいメンバーは連番の名前になる', () => {
    const formation: Formation = {
      members: [
        { id: 'id-1', name: 'メンバー1', x: 1, y: 1, color: '#ff0000', height: 170 },
        { id: 'id-2', name: 'メンバー2', x: 2, y: 2, color: '#00ff00', height: 150 },
      ],
    };

    const next = addMember(formation, 'id-3');

    expect(next.members).toHaveLength(3);
    expect(next.members[2].id).toBe('id-3');
    expect(next.members[2].name).toBe('メンバー3');
  });

  it('追加したメンバーのカラーは青、身長は160cmになる（1.5 メンバーカラー編集・メンバー身長編集）', () => {
    const formation: Formation = { members: [] };

    const next = addMember(formation, 'id-1');

    expect(next.members[0].color).toBe(DEFAULT_MEMBER_COLOR);
    expect(next.members[0].height).toBe(DEFAULT_MEMBER_HEIGHT_CM);
  });
});

describe('removeMember', () => {
  const formation: Formation = {
    members: [
      { id: 'id-1', name: 'メンバー1', x: 0, y: 0, color: '#ff0000', height: 170 },
      { id: 'id-2', name: 'メンバー2', x: 1, y: 1, color: '#00ff00', height: 150 },
    ],
  };

  it('指定したIDのメンバーを削除する', () => {
    const next = removeMember(formation, 'id-1');

    expect(next.members).toEqual([
      { id: 'id-2', name: 'メンバー2', x: 1, y: 1, color: '#00ff00', height: 150 },
    ]);
  });

  it('存在しないIDを指定した場合は変化しない', () => {
    const next = removeMember(formation, 'unknown');

    expect(next).toEqual(formation);
  });
});

describe('moveMember', () => {
  const formation: Formation = {
    members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0, color: '#ff0000', height: 170 }],
  };

  it('指定したメンバーの座標を更新する', () => {
    const next = moveMember(formation, 'id-1', 3, -2);

    expect(next.members[0]).toEqual({
      id: 'id-1',
      name: 'メンバー1',
      x: 3,
      y: -2,
      color: '#ff0000',
      height: 170,
    });
  });

  it('0.05単位に満たない座標を指定した場合は最も近い0.05単位に丸める', () => {
    const next = moveMember(formation, 'id-1', 1.234, -2.777);

    expect(next.members[0].x).toBeCloseTo(1.25);
    expect(next.members[0].y).toBeCloseTo(-2.8);
  });

  it('ステージ範囲外の座標を指定した場合、範囲内に収まる0.05単位の値に丸める（端そのものが0.05単位でない場合は端にしない）', () => {
    const xMax = fromMeters(STAGE_HALF_WIDTH, X_AXIS_SCALE);
    const yFront = fromMeters(0, Y_AXIS_SCALE);

    const next = moveMember(formation, 'id-1', xMax + 5, yFront + 5);

    expect(next.members[0].id).toBe('id-1');
    // xMax(6.2222...) は0.05単位でないため、範囲内に収まる6.2に丸められる
    expect(next.members[0].x).toBeCloseTo(6.2);
    expect(next.members[0].x).toBeLessThanOrEqual(xMax);
    // yFront(2) は既に0.05単位のため、端そのものになる
    expect(next.members[0].y).toBeCloseTo(yFront);
  });

  it('存在しないIDを指定した場合は変化しない', () => {
    const next = moveMember(formation, 'unknown', 1, 1);

    expect(next).toEqual(formation);
  });
});

describe('renameMember', () => {
  const formation: Formation = {
    members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0, color: '#ff0000', height: 170 }],
  };

  it('指定したメンバーの名前を更新する', () => {
    const next = renameMember(formation, 'id-1', 'あいり');

    expect(next.members[0].name).toBe('あいり');
  });

  it('空文字を指定した場合は名前を変更しない', () => {
    const next = renameMember(formation, 'id-1', '');

    expect(next.members[0].name).toBe('メンバー1');
  });

  it('存在しないIDを指定した場合は変化しない', () => {
    const next = renameMember(formation, 'unknown', 'あいり');

    expect(next).toEqual(formation);
  });
});

describe('changeMemberColor', () => {
  const formation: Formation = {
    members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0, color: '#4a7dff', height: 160 }],
  };

  it('指定したメンバーのカラーを更新する（1.5 メンバーカラー編集）', () => {
    const next = changeMemberColor(formation, 'id-1', '#ff0000');

    expect(next.members[0].color).toBe('#ff0000');
  });

  it('存在しないIDを指定した場合は変化しない', () => {
    const next = changeMemberColor(formation, 'unknown', '#ff0000');

    expect(next).toEqual(formation);
  });
});

describe('changeMemberHeight', () => {
  const formation: Formation = {
    members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0, color: '#4a7dff', height: 160 }],
  };

  it('指定したメンバーの身長を更新する（1.5 メンバー身長編集）', () => {
    const next = changeMemberHeight(formation, 'id-1', 175);

    expect(next.members[0].height).toBe(175);
  });

  it(`${MIN_MEMBER_HEIGHT_CM}cm未満の値を指定した場合は${MIN_MEMBER_HEIGHT_CM}cmに丸める（1.5 メンバー身長編集）`, () => {
    const next = changeMemberHeight(formation, 'id-1', MIN_MEMBER_HEIGHT_CM - 10);

    expect(next.members[0].height).toBe(MIN_MEMBER_HEIGHT_CM);
  });

  it(`${MAX_MEMBER_HEIGHT_CM}cmを超える値を指定した場合は${MAX_MEMBER_HEIGHT_CM}cmに丸める（1.5 メンバー身長編集）`, () => {
    const next = changeMemberHeight(formation, 'id-1', MAX_MEMBER_HEIGHT_CM + 10);

    expect(next.members[0].height).toBe(MAX_MEMBER_HEIGHT_CM);
  });

  it('存在しないIDを指定した場合は変化しない', () => {
    const next = changeMemberHeight(formation, 'unknown', 175);

    expect(next).toEqual(formation);
  });
});
