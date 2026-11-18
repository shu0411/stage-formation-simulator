import { describe, expect, it } from 'vitest';
import { createInitialShow, getPlacedMembers } from '../show';
import type { Show } from '../types';

describe('createInitialShow', () => {
  it('メンバー0人・フォーメーション1つ（名前「フォーメーション1」）の演目を作る', () => {
    const show = createInitialShow('formation-1');

    expect(show.members).toEqual([]);
    expect(show.formations).toEqual([
      { id: 'formation-1', name: 'フォーメーション1', positions: {} },
    ]);
  });
});

describe('getPlacedMembers', () => {
  const show: Show = {
    members: [
      { id: 'm-1', name: 'メンバー1', color: '#ff0000', height: 170 },
      { id: 'm-2', name: 'メンバー2', color: '#00ff00', height: 150 },
    ],
    formations: [
      {
        id: 'f-1',
        name: 'フォーメーション1',
        positions: { 'm-1': { x: 1, y: 1 }, 'm-2': { x: 2, y: 2 } },
      },
      {
        id: 'f-2',
        name: 'フォーメーション2',
        positions: { 'm-1': { x: -1, y: -1 }, 'm-2': { x: -2, y: -2 } },
      },
    ],
  };

  it('membersの順に、指定したフォーメーションの立ち位置と結合して返す', () => {
    expect(getPlacedMembers(show, 'f-1')).toEqual([
      { id: 'm-1', name: 'メンバー1', color: '#ff0000', height: 170, x: 1, y: 1 },
      { id: 'm-2', name: 'メンバー2', color: '#00ff00', height: 150, x: 2, y: 2 },
    ]);
  });

  it('異なるフォーメーションを指定すると、そのフォーメーションの立ち位置が反映される', () => {
    expect(getPlacedMembers(show, 'f-2')).toEqual([
      { id: 'm-1', name: 'メンバー1', color: '#ff0000', height: 170, x: -1, y: -1 },
      { id: 'm-2', name: 'メンバー2', color: '#00ff00', height: 150, x: -2, y: -2 },
    ]);
  });
});
