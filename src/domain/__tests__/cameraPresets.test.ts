import { describe, expect, it } from 'vitest';
import { CAMERA_PRESETS, DEFAULT_CAMERA_PRESET_ID, toCameraScenePosition } from '../cameraPresets';
import { STAGE_DEPTH } from '../stageConstants';

describe('cameraPresets', () => {
  it('プリセットが5つあり、IDが重複しない（技術設計 domain）', () => {
    expect(CAMERA_PRESETS).toHaveLength(5);
    const ids = CAMERA_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('初期値は「中央」である', () => {
    expect(DEFAULT_CAMERA_PRESET_ID).toBe('center');
  });

  it('「中央」は従来の固定視点と同じ位置になる（仕様: カメラ位置の切り替え）', () => {
    expect(toCameraScenePosition('center')).toEqual([0, 6, STAGE_DEPTH / 2 + 10]);
  });

  it('「左」「右」はX座標の符号が反転する', () => {
    const left = toCameraScenePosition('left');
    const right = toCameraScenePosition('right');

    expect(left[0]).toBe(-right[0]);
    expect(left[0]).toBeLessThan(0);
    expect(right[0]).toBeGreaterThan(0);
  });

  it('「前方」はステージ手前端から4m・目線の高さ1.6mになる', () => {
    expect(toCameraScenePosition('front')).toEqual([0, 1.6, STAGE_DEPTH / 2 + 4]);
  });

  it('「後方」はステージ手前端から20m・目線の高さ8mになる', () => {
    expect(toCameraScenePosition('back')).toEqual([0, 8, STAGE_DEPTH / 2 + 20]);
  });
});
