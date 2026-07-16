import { clampMemberHeight } from './memberOperations';
import { snapPositionWithinStage } from './coordinates';
import { DEFAULT_MEMBER_COLOR, DEFAULT_MEMBER_HEIGHT_CM, FORMATION_FORMAT_VERSION } from './types';
import type { Formation } from './types';

/** フォーメーションを永続化・交換用の JSON 文字列に変換する（2.2 永続化・交換フォーマット）。 */
export function serializeFormation(formation: Formation): string {
  return JSON.stringify({ version: FORMATION_FORMAT_VERSION, members: formation.members });
}

/**
 * メンバーとして必須の形式を満たすかを検査する（1.6 保存データの後方互換性）。
 * color・height は旧形式データに存在しないことを許容し、存在する場合のみ型を検査する。
 */
function isValidMember(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const member = value as Record<string, unknown>;
  return (
    typeof member.id === 'string' &&
    typeof member.name === 'string' &&
    typeof member.x === 'number' &&
    typeof member.y === 'number' &&
    (member.color === undefined || typeof member.color === 'string') &&
    (member.height === undefined || typeof member.height === 'number')
  );
}

/**
 * JSON 文字列をフォーメーションに変換する（2.3 インポート・2.4 エラー処理）。
 * JSON として解釈できない場合、またはフォーメーションデータの形式でない場合は null を返す。
 * 座標は 0.05 単位に丸めたうえでステージ範囲内に収める（1.6 立ち位置の範囲。
 * 立ち位置変更と同じ丸めルール）。
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
    id: member.id as string,
    name: member.name as string,
    color: typeof member.color === 'string' ? member.color : DEFAULT_MEMBER_COLOR,
    height: clampMemberHeight(
      typeof member.height === 'number' ? member.height : DEFAULT_MEMBER_HEIGHT_CM,
    ),
    ...snapPositionWithinStage(member.x as number, member.y as number),
  }));
  return { members };
}
