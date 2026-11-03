/** ドラッグ時の移動幅（仕様: 移動幅プルダウン）。ステージ座標（バミリ番号）の倍数として吸着に使う。 */
export const DRAG_STEPS = [0.1, 0.25, 0.5, 1] as const;

export type DragStep = (typeof DRAG_STEPS)[number];

/** プルダウンの初期選択値。 */
export const DEFAULT_DRAG_STEP: DragStep = 0.25;

/** ドラッグ中にShiftキーを押している間に使う移動幅。選択中の移動幅に関わらず適用する。 */
export const LARGE_DRAG_STEP: DragStep = 1;
