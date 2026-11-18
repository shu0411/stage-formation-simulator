/** メンバー固有の属性（フォーメーションによらず不変）。 */
export type Member = {
  id: string;
  name: string;
  color: string;
  height: number;
};

/** 立ち位置（1.6 座標系の値）。 */
export type Position = {
  x: number;
  y: number;
};

/** 1 つのフォーメーション。positions はメンバー ID → 立ち位置。 */
export type Formation = {
  id: string;
  name: string;
  positions: Record<string, Position>;
};

/** 演目。全フォーメーションで共通のメンバーと、並び順どおりのフォーメーション。 */
export type Show = {
  members: Member[];
  formations: Formation[];
};

/** 描画・入力欄用に、メンバーと特定フォーメーションの立ち位置を結合したもの。 */
export type PlacedMember = Member & Position;

/** メンバー追加時のデフォルトカラー（1.5 メンバーカラー編集）。 */
export const DEFAULT_MEMBER_COLOR = '#4a7dff';
/** メンバー追加時のデフォルト身長（cm）（1.5 メンバー身長編集）。 */
export const DEFAULT_MEMBER_HEIGHT_CM = 160;
/** 身長（cm）の許容範囲（1.5 メンバー身長編集）。 */
export const MIN_MEMBER_HEIGHT_CM = 100;
export const MAX_MEMBER_HEIGHT_CM = 200;

/** フォーメーション名の初期値の接頭辞（2.2 演目）。初期フォーメーション名は `フォーメーション1`。 */
export const DEFAULT_FORMATION_NAME_PREFIX = 'フォーメーション';

export const FORMATION_FORMAT_VERSION = 2;
