/** ドラッグ時の移動単位（仕様: 移動単位トグル）。ステージ座標（バミリ番号）の倍数として吸着に使う。 */
export const DRAG_STEPS = [0.1, 0.25, 0.5, 1] as const;

export type DragStep = (typeof DRAG_STEPS)[number];

/** トグルの初期選択値。 */
export const DEFAULT_DRAG_STEP: DragStep = 0.25;

/** ドラッグ中にShiftキーを押している間に使う移動単位。選択中の移動単位に関わらず適用する。 */
export const LARGE_DRAG_STEP: DragStep = 1;
