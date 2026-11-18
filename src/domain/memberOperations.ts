import { snapPositionWithinStage } from './coordinates';
import {
  DEFAULT_MEMBER_COLOR,
  DEFAULT_MEMBER_HEIGHT_CM,
  MAX_MEMBER_HEIGHT_CM,
  MIN_MEMBER_HEIGHT_CM,
} from './types';
import type { Show } from './types';

/** 原点の座標（2.2 メンバー追加時の初期位置）。 */
const ORIGIN = { x: 0, y: 0 };

/**
 * 新しいメンバーを追加する（1.5 メンバー追加）。id は呼び出し側で採番する。
 * 全フォーメーションの立ち位置に、新しいメンバーの原点の立ち位置を追加する。
 */
export function addMember(show: Show, id: string): Show {
  const name = `メンバー${show.members.length + 1}`;
  return {
    members: [
      ...show.members,
      { id, name, color: DEFAULT_MEMBER_COLOR, height: DEFAULT_MEMBER_HEIGHT_CM },
    ],
    formations: show.formations.map((formation) => ({
      ...formation,
      positions: { ...formation.positions, [id]: ORIGIN },
    })),
  };
}

/**
 * 身長（cm）を許容範囲内に収める（1.5 メンバー身長編集）。
 * 範囲外の値は範囲内に収まる端の値に丸める。
 */
export function clampMemberHeight(height: number): number {
  return Math.min(Math.max(height, MIN_MEMBER_HEIGHT_CM), MAX_MEMBER_HEIGHT_CM);
}

/**
 * 指定した ID のメンバーを削除する（1.5 メンバー削除）。
 * 全フォーメーションの立ち位置からも削除する。
 */
export function removeMember(show: Show, id: string): Show {
  return {
    members: show.members.filter((member) => member.id !== id),
    formations: show.formations.map((formation) => {
      const positions = { ...formation.positions };
      delete positions[id];
      return { ...formation, positions };
    }),
  };
}

/**
 * 指定したフォーメーションの、指定した ID のメンバーの立ち位置を更新する（1.5 立ち位置変更）。
 * 0.05 単位に丸めたうえで、範囲外は範囲内に収まる 0.05 単位の値に丸める。
 */
export function moveMember(
  show: Show,
  formationId: string,
  memberId: string,
  x: number,
  y: number,
): Show {
  const position = snapPositionWithinStage(x, y);
  return {
    ...show,
    formations: show.formations.map((formation) => {
      if (formation.id !== formationId || !(memberId in formation.positions)) {
        return formation;
      }
      return { ...formation, positions: { ...formation.positions, [memberId]: position } };
    }),
  };
}

/** 指定した ID のメンバーの名前を更新する（1.5 メンバー名編集）。空文字の場合は変更しない。 */
export function renameMember(show: Show, id: string, name: string): Show {
  if (name === '') {
    return show;
  }
  return {
    ...show,
    members: show.members.map((member) => (member.id === id ? { ...member, name } : member)),
  };
}

/** 指定した ID のメンバーのカラーを更新する（1.5 メンバーカラー編集）。 */
export function changeMemberColor(show: Show, id: string, color: string): Show {
  return {
    ...show,
    members: show.members.map((member) => (member.id === id ? { ...member, color } : member)),
  };
}

/**
 * 指定した ID のメンバーの身長を更新する（1.5 メンバー身長編集）。
 * 100〜200cm の範囲に丸めたうえで反映する。
 */
export function changeMemberHeight(show: Show, id: string, height: number): Show {
  const clamped = clampMemberHeight(height);
  return {
    ...show,
    members: show.members.map((member) =>
      member.id === id ? { ...member, height: clamped } : member,
    ),
  };
}
