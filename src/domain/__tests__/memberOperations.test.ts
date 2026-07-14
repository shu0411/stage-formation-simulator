import { describe, expect, it } from 'vitest';
import { addMember, moveMember, removeMember, renameMember } from '../memberOperations';
import { STAGE_HALF_DEPTH, STAGE_HALF_WIDTH } from '../stageConstants';
import type { Formation } from '../types';

describe('addMember', () => {
  it('メンバーが0人のとき、ステージ中央に「メンバー1」を1人追加する', () => {
    const formation: Formation = { members: [] };

    const next = addMember(formation, 'id-1');

    expect(next.members).toEqual([{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }]);
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
    expect(next.members[2]).toEqual({ id: 'id-3', name: 'メンバー3', x: 0, y: 0 });
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

  it('ステージ範囲外の座標を指定した場合はステージ端に丸める', () => {
    const next = moveMember(formation, 'id-1', STAGE_HALF_WIDTH + 5, STAGE_HALF_DEPTH + 5);

    expect(next.members[0]).toEqual({
      id: 'id-1',
      name: 'メンバー1',
      x: STAGE_HALF_WIDTH,
      y: STAGE_HALF_DEPTH,
    });
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
