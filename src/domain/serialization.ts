import { clampPosition } from './coordinates';
import { FORMATION_FORMAT_VERSION } from './types';
import type { Formation, Member } from './types';

/** フォーメーションを永続化・交換用の JSON 文字列に変換する（2.2 永続化・交換フォーマット）。 */
export function serializeFormation(formation: Formation): string {
  return JSON.stringify({ version: FORMATION_FORMAT_VERSION, members: formation.members });
}

function isValidMember(value: unknown): value is Member {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const member = value as Record<string, unknown>;
  return (
    typeof member.id === 'string' &&
    typeof member.name === 'string' &&
    typeof member.x === 'number' &&
    typeof member.y === 'number'
  );
}

/**
 * JSON 文字列をフォーメーションに変換する（2.3 インポート・2.4 エラー処理）。
 * JSON として解釈できない場合、またはフォーメーションデータの形式でない場合は null を返す。
 * ステージ範囲外の座標は端に丸める（1.6 立ち位置の範囲）。
 */
export function parseFormationJson(json: string): Formation | null {
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
  if (candidate.version !== FORMATION_FORMAT_VERSION || !Array.isArray(candidate.members)) {
    return null;
  }
  if (!candidate.members.every(isValidMember)) {
    return null;
  }

  const members = candidate.members.map((member) => ({
    ...member,
    ...clampPosition(member.x, member.y),
  }));
  return { members };
}
