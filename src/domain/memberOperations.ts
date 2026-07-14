import { clampPosition, snapPosition } from './coordinates';
import { fromMeters } from './axisScale';
import { STAGE_DEPTH, X_AXIS_SCALE, Y_AXIS_SCALE } from './stageConstants';
import type { Formation } from './types';

/** ステージ中央の座標（2.2 メンバー追加時の初期位置）。 */
const STAGE_CENTER = {
  x: X_AXIS_SCALE.referenceValue,
  y: fromMeters(STAGE_DEPTH / 2, Y_AXIS_SCALE),
};

/** 新しいメンバーをステージ中央に追加する（1.5 メンバー追加）。id は呼び出し側で採番する。 */
export function addMember(formation: Formation, id: string): Formation {
  const name = `メンバー${formation.members.length + 1}`;
  return {
    members: [...formation.members, { id, name, ...STAGE_CENTER }],
  };
}

/** 指定した ID のメンバーを削除する（1.5 メンバー削除）。 */
export function removeMember(formation: Formation, id: string): Formation {
  return { members: formation.members.filter((member) => member.id !== id) };
}

/**
 * 指定した ID のメンバーの立ち位置を更新する（1.5 立ち位置変更）。
 * 0.05 単位に丸めたうえで、範囲外はステージ端に丸める。
 */
export function moveMember(formation: Formation, id: string, x: number, y: number): Formation {
  const snapped = snapPosition(x, y);
  const position = clampPosition(snapped.x, snapped.y);
  return {
    members: formation.members.map((member) =>
      member.id === id ? { ...member, ...position } : member,
    ),
  };
}

/** 指定した ID のメンバーの名前を更新する（1.5 メンバー名編集）。空文字の場合は変更しない。 */
export function renameMember(formation: Formation, id: string, name: string): Formation {
  if (name === '') {
    return formation;
  }
  return {
    members: formation.members.map((member) => (member.id === id ? { ...member, name } : member)),
  };
}
