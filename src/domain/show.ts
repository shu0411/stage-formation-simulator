import { DEFAULT_FORMATION_NAME_PREFIX } from './types';
import type { PlacedMember, Show } from './types';

/** 保存データがない状態での初期演目（メンバー0人・フォーメーション1つ）を作る。 */
export function createInitialShow(formationId: string): Show {
  return {
    members: [],
    formations: [{ id: formationId, name: `${DEFAULT_FORMATION_NAME_PREFIX}1`, positions: {} }],
  };
}

/** `members` の順に、指定したフォーメーションの立ち位置と結合して返す。 */
export function getPlacedMembers(show: Show, formationId: string): PlacedMember[] {
  const formation = show.formations.find((candidate) => candidate.id === formationId);
  const positions = formation?.positions ?? {};
  return show.members.map((member) => ({ ...member, ...positions[member.id] }));
}
