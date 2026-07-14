import { describe, expect, it } from 'vitest';
import { parseFormationJson, serializeFormation } from '../serialization';
import { fromMeters } from '../axisScale';
import { STAGE_DEPTH, STAGE_HALF_WIDTH, X_AXIS_SCALE, Y_AXIS_SCALE } from '../stageConstants';
import type { Formation } from '../types';

describe('serializeFormation', () => {
  it('フォーメーションをversion付きのJSON文字列に変換する', () => {
    const formation: Formation = {
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2 }],
    };

    const json = JSON.parse(serializeFormation(formation));

    expect(json).toEqual({
      version: 1,
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2 }],
    });
  });
});

describe('parseFormationJson', () => {
  it('正しい形式のJSONをフォーメーションに変換する', () => {
    const json = JSON.stringify({
      version: 1,
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2 }],
    });

    expect(parseFormationJson(json)).toEqual({
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2 }],
    });
  });

  it('エクスポート→インポートの往復で同じフォーメーションを再現する', () => {
    const formation: Formation = {
      members: [
        { id: 'id-1', name: 'メンバー1', x: 1, y: 2 },
        { id: 'id-2', name: 'メンバー2', x: -3, y: -1 },
      ],
    };

    const roundTripped = parseFormationJson(serializeFormation(formation));

    expect(roundTripped).toEqual(formation);
  });

  it('メンバーが0人のフォーメーションも往復できる', () => {
    const formation: Formation = { members: [] };

    expect(parseFormationJson(serializeFormation(formation))).toEqual(formation);
  });

  it('ステージ範囲外の座標を含むデータはステージ端に丸める（1.6 立ち位置の範囲）', () => {
    const xMax = fromMeters(STAGE_HALF_WIDTH, X_AXIS_SCALE);
    const yBack = fromMeters(STAGE_DEPTH, Y_AXIS_SCALE);
    const json = JSON.stringify({
      version: 1,
      members: [{ id: 'id-1', name: 'メンバー1', x: xMax + 10, y: yBack - 10 }],
    });

    const result = parseFormationJson(json);

    expect(result?.members[0].id).toBe('id-1');
    expect(result?.members[0].x).toBeCloseTo(xMax);
    expect(result?.members[0].y).toBeCloseTo(yBack);
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
      members: [{ id: 'id-1', name: 'メンバー1', x: '1', y: 2 }],
    });

    expect(parseFormationJson(json)).toBeNull();
  });

  it('membersが配列でない場合はnullを返す', () => {
    const json = JSON.stringify({ version: 1, members: 'not-array' });

    expect(parseFormationJson(json)).toBeNull();
  });
});
