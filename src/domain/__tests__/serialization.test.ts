import { describe, expect, it } from 'vitest';
import { parseFormationJson, serializeFormation } from '../serialization';
import { fromMeters } from '../axisScale';
import { STAGE_DEPTH, STAGE_HALF_WIDTH, X_AXIS_SCALE, Y_AXIS_SCALE } from '../stageConstants';
import {
  DEFAULT_MEMBER_COLOR,
  DEFAULT_MEMBER_HEIGHT_CM,
  MAX_MEMBER_HEIGHT_CM,
  MIN_MEMBER_HEIGHT_CM,
} from '../types';
import type { Formation } from '../types';

describe('serializeFormation', () => {
  it('フォーメーションをversion付きのJSON文字列に変換する', () => {
    const formation: Formation = {
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2, color: '#ff0000', height: 170 }],
    };

    const json = JSON.parse(serializeFormation(formation));

    expect(json).toEqual({
      version: 1,
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2, color: '#ff0000', height: 170 }],
    });
  });
});

describe('parseFormationJson', () => {
  it('正しい形式のJSONをフォーメーションに変換する', () => {
    const json = JSON.stringify({
      version: 1,
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2, color: '#ff0000', height: 170 }],
    });

    expect(parseFormationJson(json)).toEqual({
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2, color: '#ff0000', height: 170 }],
    });
  });

  it('エクスポート→インポートの往復で同じフォーメーションを再現する', () => {
    const formation: Formation = {
      members: [
        { id: 'id-1', name: 'メンバー1', x: 1, y: 2, color: '#ff0000', height: 170 },
        { id: 'id-2', name: 'メンバー2', x: -3, y: -1, color: '#00ff00', height: 150 },
      ],
    };

    const roundTripped = parseFormationJson(serializeFormation(formation));

    expect(roundTripped).toEqual(formation);
  });

  it('メンバーが0人のフォーメーションも往復できる', () => {
    const formation: Formation = { members: [] };

    expect(parseFormationJson(serializeFormation(formation))).toEqual(formation);
  });

  it('ステージ範囲外の座標を含むデータは、範囲内に収まる0.05単位の値に丸める（1.6 立ち位置の範囲）', () => {
    const xMax = fromMeters(STAGE_HALF_WIDTH, X_AXIS_SCALE);
    const yBack = fromMeters(STAGE_DEPTH, Y_AXIS_SCALE);
    const json = JSON.stringify({
      version: 1,
      members: [
        {
          id: 'id-1',
          name: 'メンバー1',
          x: xMax + 10,
          y: yBack - 10,
          color: '#ff0000',
          height: 170,
        },
      ],
    });

    const result = parseFormationJson(json);

    expect(result?.members[0].id).toBe('id-1');
    // xMax(6.2222...)・yBack(-4.6666...)は0.05単位でないため、範囲内に収まる値に丸められる
    expect(result?.members[0].x).toBeCloseTo(6.2);
    expect(result?.members[0].x).toBeLessThanOrEqual(xMax);
    expect(result?.members[0].y).toBeCloseTo(-4.65);
    expect(result?.members[0].y).toBeGreaterThanOrEqual(yBack);
  });

  it('0.05単位でない座標を含むデータは、最も近い0.05単位の値に丸める', () => {
    const json = JSON.stringify({
      version: 1,
      members: [
        { id: 'id-1', name: 'メンバー1', x: 1.234, y: -2.777, color: '#ff0000', height: 170 },
      ],
    });

    const result = parseFormationJson(json);

    expect(result?.members[0].x).toBeCloseTo(1.25);
    expect(result?.members[0].y).toBeCloseTo(-2.8);
  });

  it('JSONとして解釈できない文字列の場合はnullを返す', () => {
    expect(parseFormationJson('not json')).toBeNull();
  });

  it('フォーメーションデータの形式でないオブジェクトの場合はnullを返す', () => {
    expect(parseFormationJson(JSON.stringify({ foo: 'bar' }))).toBeNull();
  });

  it('membersの要素の型が不正な場合はnullを返す', () => {
    const json = JSON.stringify({
      version: 1,
      members: [{ id: 'id-1', name: 'メンバー1', x: '1', y: 2, color: '#ff0000', height: 170 }],
    });

    expect(parseFormationJson(json)).toBeNull();
  });

  it('membersが配列でない場合はnullを返す', () => {
    const json = JSON.stringify({ version: 1, members: 'not-array' });

    expect(parseFormationJson(json)).toBeNull();
  });

  describe('color・heightの後方互換性（1.6 保存データの後方互換性）', () => {
    it('color・heightを持たない旧形式のデータは、デフォルト値（青・160cm）で補う', () => {
      const json = JSON.stringify({
        version: 1,
        members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0 }],
      });

      const result = parseFormationJson(json);

      expect(result?.members[0].color).toBe(DEFAULT_MEMBER_COLOR);
      expect(result?.members[0].height).toBe(DEFAULT_MEMBER_HEIGHT_CM);
    });

    it('colorの型が不正な場合はnullを返す', () => {
      const json = JSON.stringify({
        version: 1,
        members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0, color: 123 }],
      });

      expect(parseFormationJson(json)).toBeNull();
    });

    it('heightの型が不正な場合はnullを返す', () => {
      const json = JSON.stringify({
        version: 1,
        members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0, height: '160' }],
      });

      expect(parseFormationJson(json)).toBeNull();
    });

    it(`${MIN_MEMBER_HEIGHT_CM}〜${MAX_MEMBER_HEIGHT_CM}cmの範囲外のheightは範囲内に丸める`, () => {
      const json = JSON.stringify({
        version: 1,
        members: [{ id: 'id-1', name: 'メンバー1', x: 0, y: 0, height: MAX_MEMBER_HEIGHT_CM + 50 }],
      });

      const result = parseFormationJson(json);

      expect(result?.members[0].height).toBe(MAX_MEMBER_HEIGHT_CM);
    });
  });
});
