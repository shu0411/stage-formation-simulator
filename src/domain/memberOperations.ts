import { snapPositionWithinStage } from './coordinates';
import {
  DEFAULT_MEMBER_COLOR,
  DEFAULT_MEMBER_HEIGHT_CM,
  MAX_MEMBER_HEIGHT_CM,
  MIN_MEMBER_HEIGHT_CM,
} from './types';
import type { Formation } from './types';

/** 原点の座標（2.2 メンバー追加時の初期位置）。 */
const ORIGIN = { x: 0, y: 0 };

/** 新しいメンバーを原点に追加する（1.5 メンバー追加）。id は呼び出し側で採番する。 */
export function addMember(formation: Formation, id: string): Formation {
  const name = `メンバー${formation.members.length + 1}`;
  return {
    members: [
      ...formation.members,
      { id, name, ...ORIGIN, color: DEFAULT_MEMBER_COLOR, height: DEFAULT_MEMBER_HEIGHT_CM },
    ],
  };
}

/**
 * 身長（cm）を許容範囲内に収める（1.5 メンバー身長編集）。
 * 範囲外の値は範囲内に収まる端の値に丸める。
 */
export function clampMemberHeight(height: number): number {
  return Math.min(Math.max(height, MIN_MEMBER_HEIGHT_CM), MAX_MEMBER_HEIGHT_CM);
}

/** 指定した ID のメンバーを削除する（1.5 メンバー削除）。 */
export function removeMember(formation: Formation, id: string): Formation {
  return { members: formation.members.filter((member) => member.id !== id) };
}

/**
 * 指定した ID のメンバーの立ち位置を更新する（1.5 立ち位置変更）。
 * 0.05 単位に丸めたうえで、範囲外は範囲内に収まる 0.05 単位の値に丸める。
 */
export function moveMember(formation: Formation, id: string, x: number, y: number): Formation {
  const position = snapPositionWithinStage(x, y);
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

/** 指定した ID のメンバーのカラーを更新する（1.5 メンバーカラー編集）。 */
export function changeMemberColor(formation: Formation, id: string, color: string): Formation {
  return {
    members: formation.members.map((member) => (member.id === id ? { ...member, color } : member)),
  };
}

/**
 * 指定した ID のメンバーの身長を更新する（1.5 メンバー身長編集）。
 * 100〜200cm の範囲に丸めたうえで反映する。
 */
export function changeMemberHeight(formation: Formation, id: string, height: number): Formation {
  const clamped = clampMemberHeight(height);
  return {
    members: formation.members.map((member) =>
      member.id === id ? { ...member, height: clamped } : member,
    ),
  };
}
