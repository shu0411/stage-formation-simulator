import { clampMemberHeight } from './memberOperations';
import { snapPositionWithinStage } from './coordinates';
import { FORMATION_FORMAT_VERSION } from './types';
import type { Formation, Member, Position, Show } from './types';

/** 演目を永続化・交換用の JSON 文字列に変換する（2.2 永続化・交換フォーマット）。 */
export function serializeShow(show: Show): string {
  return JSON.stringify({
    version: FORMATION_FORMAT_VERSION,
    members: show.members,
    formations: show.formations,
  });
}

/** メンバーとして必須の形式を満たすかを検査する。 */
function isValidMember(value: unknown): value is Member {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const member = value as Record<string, unknown>;
  return (
    typeof member.id === 'string' &&
    typeof member.name === 'string' &&
    typeof member.color === 'string' &&
    typeof member.height === 'number'
  );
}

/** 立ち位置として必須の形式を満たすかを検査する。 */
function isValidPosition(value: unknown): value is Position {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const position = value as Record<string, unknown>;
  return typeof position.x === 'number' && typeof position.y === 'number';
}

type FormationShape = { id: string; name: string; positions: Record<string, unknown> };

/** フォーメーションとして必須の形式（立ち位置の内容を除く）を満たすかを検査する。 */
function isValidFormationShape(value: unknown): value is FormationShape {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const formation = value as Record<string, unknown>;
  return (
    typeof formation.id === 'string' &&
    typeof formation.name === 'string' &&
    typeof formation.positions === 'object' &&
    formation.positions !== null
  );
}

/**
 * JSON 文字列を演目に変換する（2.3 インポート・2.4 エラー処理）。
 * JSON として解釈できない場合、または演目データの形式でない場合は null を返す。
 * - version は 2 でなければならない（旧形式はインポートできない）
 * - members は配列で、各要素の id・name・color が文字列、height が数値であること
 * - formations は 1 つ以上の要素を持つ配列で、各要素の id・name が文字列、
 *   positions がオブジェクトであること
 * - 各フォーメーションの positions に、全メンバーの id について x・y が数値の
 *   立ち位置があること（どのメンバーにも対応しないキーは捨てる）
 * 座標は 0.05 単位に丸めたうえでステージ範囲内に収め、身長は 100〜200cm の範囲に
 * クランプする（1.6 立ち位置の範囲・2.2 身長）。
 */
export function parseShowJson(json: string): Show | null {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }

  if (typeof data !== 'object' || data === null) {
    return null;
  }
  const candidate = data as Record<string, unknown>;
  if (candidate.version !== FORMATION_FORMAT_VERSION) {
    return null;
  }
  if (!Array.isArray(candidate.members) || !candidate.members.every(isValidMember)) {
    return null;
  }
  const memberCandidates = candidate.members;

  if (!Array.isArray(candidate.formations) || candidate.formations.length === 0) {
    return null;
  }
  if (!candidate.formations.every(isValidFormationShape)) {
    return null;
  }
  const formationCandidates = candidate.formations as FormationShape[];

  const memberIds = memberCandidates.map((member) => member.id);
  for (const formation of formationCandidates) {
    for (const memberId of memberIds) {
      if (!isValidPosition(formation.positions[memberId])) {
        return null;
      }
    }
  }

  const members: Member[] = memberCandidates.map((member) => ({
    id: member.id,
    name: member.name,
    color: member.color,
    height: clampMemberHeight(member.height),
  }));

  const formations: Formation[] = formationCandidates.map((formation) => ({
    id: formation.id,
    name: formation.name,
    positions: Object.fromEntries(
      memberIds.map((memberId) => {
        const position = formation.positions[memberId] as Position;
        return [memberId, snapPositionWithinStage(position.x, position.y)];
      }),
    ),
  }));

  return { members, formations };
}
