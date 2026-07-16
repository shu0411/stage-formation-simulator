export type Member = {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  height: number;
};

/** メンバー追加時のデフォルトカラー（1.5 メンバーカラー編集）。 */
export const DEFAULT_MEMBER_COLOR = '#4a7dff';
/** メンバー追加時のデフォルト身長（cm）（1.5 メンバー身長編集）。 */
export const DEFAULT_MEMBER_HEIGHT_CM = 160;
/** 身長（cm）の許容範囲（1.5 メンバー身長編集）。 */
export const MIN_MEMBER_HEIGHT_CM = 100;
export const MAX_MEMBER_HEIGHT_CM = 200;

export type Formation = {
  members: Member[];
};

export const FORMATION_FORMAT_VERSION = 1;

export type FormationFile = {
  version: typeof FORMATION_FORMAT_VERSION;
  members: Member[];
};
