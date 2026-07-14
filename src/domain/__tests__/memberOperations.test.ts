import { describe, expect, it } from 'vitest';
import { addMember, moveMember, removeMember, renameMember } from '../memberOperations';
import { fromMeters } from '../axisScale';
import { STAGE_DEPTH, STAGE_HALF_WIDTH, X_AXIS_SCALE, Y_AXIS_SCALE } from '../stageConstants';
import type { Formation } from '../types';

const CENTER_Y = fromMeters(STAGE_DEPTH / 2, Y_AXIS_SCALE);

describe('addMember', () => {
  it('メンバーが0人のとき、ステージ中央に「メンバー1」を1人追加する（2.2 メンバー追加時の初期位置）', () => {
    const formation: Formation = { members: [] };

    const next = addMember(formation, 'id-1');

    expect(next.members).toHaveLength(1);
    expect(next.members[0].id).toBe('id-1');
    expect(next.members[0].name).toBe('メンバー1');
    expect(next.members[0].x).toBe(X_AXIS_SCALE.referenceValue);
    expect(next.members[0].y).toBeCloseTo(CENTER_Y);
  });

  it('メンバーがN人のとき、N+1人になり新しいメンバーは連番の名前になる', () => {
    const formation: Formation = {
      members: [
        { id: 'id-1', name: 'メンバー1', x: 1, y: 1 },
        { id: 'id-2', name: 'メンバー2', x: 2, y: 2 },
      ],
    };

    const next = addMember(formation, 'id-3');

    expect(next.members).toHaveLength(3);
    expect(next.members[2].id).toBe('id-3');
    expect(next.members[2].name).toBe('メンバー3');
  });
});

describe('removeMember', () => {
  const formation: Formation = {
    members: [
      { id: 'id-1', name: 'メンバー1', x: 0, y: 0 },
      { id: 'id-2', name: 'メンバー2', x: 1, y: 1 },
    ],
  };

  it('指定したIDのメンバーを削除する', () => {
    const next = removeMember(formation, 'id-1');

    expect(next.members).toEqual([{ id: 'id-2', name: 'メンバー2', x: 1, y: 1 }]);
  });

  it('存在しないIDを指定した場合は変化しない', () => {
    const next = removeMember(formation, 'unknown');

    expect(next).toEqual(formation);
  });
});

describe('moveMember', () => {
  const formation: Formation = {
    members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }],
  };

  it('指定したメンバーの座標を更新する', () => {
    const next = moveMember(formation, 'id-1', 3, -2);

    expect(next.members[0]).toEqual({ id: 'id-1', name: 'メンバー1', x: 3, y: -2 });
  });

  it('0.05単位に満たない座標を指定した場合は最も近い0.05単位に丸める', () => {
    const next = moveMember(formation, 'id-1', 1.234, -2.777);

    expect(next.members[0].x).toBeCloseTo(1.25);
    expect(next.members[0].y).toBeCloseTo(-2.8);
  });

  it('ステージ範囲外の座標を指定した場合はステージ端に丸める', () => {
    const xMax = fromMeters(STAGE_HALF_WIDTH, X_AXIS_SCALE);
    const yFront = fromMeters(0, Y_AXIS_SCALE);

    const next = moveMember(formation, 'id-1', xMax + 5, yFront + 5);

    expect(next.members[0].id).toBe('id-1');
    expect(next.members[0].x).toBeCloseTo(xMax);
    expect(next.members[0].y).toBeCloseTo(yFront);
  });

  it('存在しないIDを指定した場合は変化しない', () => {
    const next = moveMember(formation, 'unknown', 1, 1);

    expect(next).toEqual(formation);
  });
});

describe('renameMember', () => {
  const formation: Formation = {
    members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }],
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
