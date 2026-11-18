import { describe, expect, it } from 'vitest';
import { parseShowJson, serializeShow } from '../serialization';
import { fromMeters } from '../axisScale';
import { STAGE_DEPTH, STAGE_HALF_WIDTH, X_AXIS_SCALE, Y_AXIS_SCALE } from '../stageConstants';
import { MAX_MEMBER_HEIGHT_CM, MIN_MEMBER_HEIGHT_CM } from '../types';
import type { Show } from '../types';

describe('serializeShow', () => {
  it('演目をversion 2のJSON文字列に変換する', () => {
    const show: Show = {
      members: [{ id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 }],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-1': { x: 1, y: 2 } } }],
    };

    const json = JSON.parse(serializeShow(show));

    expect(json).toEqual({
      version: 2,
      members: show.members,
      formations: show.formations,
    });
  });
});

describe('parseShowJson', () => {
  it('正しい形式のJSONを演目に変換する', () => {
    const json = JSON.stringify({
      version: 2,
      members: [{ id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 }],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-1': { x: 1, y: 2 } } }],
    });

    expect(parseShowJson(json)).toEqual({
      members: [{ id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 }],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-1': { x: 1, y: 2 } } }],
    });
  });

  it('エクスポート→インポートの往復で同じ演目を再現する', () => {
    const show: Show = {
      members: [
        { id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 },
        { id: 'id-2', name: 'メンバー2', color: '#00ff00', height: 150 },
      ],
      formations: [
        {
          id: 'f-1',
          name: 'フォーメーション1',
          positions: { 'id-1': { x: 1, y: 2 }, 'id-2': { x: -3, y: -1 } },
        },
        {
          id: 'f-2',
          name: 'フォーメーション2',
          positions: { 'id-1': { x: 0, y: 0 }, 'id-2': { x: 2, y: 2 } },
        },
      ],
    };

    const roundTripped = parseShowJson(serializeShow(show));

    expect(roundTripped).toEqual(show);
  });

  it('メンバーが0人の演目も往復できる', () => {
    const show: Show = {
      members: [],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: {} }],
    };

    expect(parseShowJson(serializeShow(show))).toEqual(show);
  });

  it('ステージ範囲外の座標を含むデータは、範囲内に収まる0.05単位の値に丸める（1.6 立ち位置の範囲）', () => {
    const xMax = fromMeters(STAGE_HALF_WIDTH, X_AXIS_SCALE);
    const yBack = fromMeters(STAGE_DEPTH, Y_AXIS_SCALE);
    const json = JSON.stringify({
      version: 2,
      members: [{ id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 }],
      formations: [
        {
          id: 'f-1',
          name: 'フォーメーション1',
          positions: { 'id-1': { x: xMax + 10, y: yBack - 10 } },
        },
      ],
    });

    const result = parseShowJson(json);

    const position = result?.formations[0].positions['id-1'];
    // xMax(6.2222...)・yBack(-4.6666...)は0.05単位でないため、範囲内に収まる値に丸められる
    expect(position?.x).toBeCloseTo(6.2);
    expect(position?.x).toBeLessThanOrEqual(xMax);
    expect(position?.y).toBeCloseTo(-4.65);
    expect(position?.y).toBeGreaterThanOrEqual(yBack);
  });

  it('0.05単位でない座標を含むデータは、最も近い0.05単位の値に丸める', () => {
    const json = JSON.stringify({
      version: 2,
      members: [{ id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 }],
      formations: [
        {
          id: 'f-1',
          name: 'フォーメーション1',
          positions: { 'id-1': { x: 1.234, y: -2.777 } },
        },
      ],
    });

    const result = parseShowJson(json);

    const position = result?.formations[0].positions['id-1'];
    expect(position?.x).toBeCloseTo(1.25);
    expect(position?.y).toBeCloseTo(-2.8);
  });

  it('JSONとして解釈できない文字列の場合はnullを返す', () => {
    expect(parseShowJson('not json')).toBeNull();
  });

  it('演目データの形式でないオブジェクトの場合はnullを返す', () => {
    expect(parseShowJson(JSON.stringify({ foo: 'bar' }))).toBeNull();
  });

  it('version 1のデータはnullを返す（旧形式はインポートできない）', () => {
    const json = JSON.stringify({
      version: 1,
      members: [{ id: 'id-1', name: 'メンバー1', x: 1, y: 2, color: '#ff0000', height: 170 }],
    });

    expect(parseShowJson(json)).toBeNull();
  });

  it('membersの要素の型が不正な場合はnullを返す', () => {
    const json = JSON.stringify({
      version: 2,
      members: [{ id: 'id-1', name: 'メンバー1', color: '#ff0000', height: '170' }],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-1': { x: 0, y: 0 } } }],
    });

    expect(parseShowJson(json)).toBeNull();
  });

  it('membersが配列でない場合はnullを返す', () => {
    const json = JSON.stringify({ version: 2, members: 'not-array', formations: [] });

    expect(parseShowJson(json)).toBeNull();
  });

  it('colorが欠けたメンバーを含む場合はnullを返す（後方互換の補完はしない）', () => {
    const json = JSON.stringify({
      version: 2,
      members: [{ id: 'id-1', name: 'メンバー1', height: 170 }],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-1': { x: 0, y: 0 } } }],
    });

    expect(parseShowJson(json)).toBeNull();
  });

  it('heightが欠けたメンバーを含む場合はnullを返す（後方互換の補完はしない）', () => {
    const json = JSON.stringify({
      version: 2,
      members: [{ id: 'id-1', name: 'メンバー1', color: '#ff0000' }],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-1': { x: 0, y: 0 } } }],
    });

    expect(parseShowJson(json)).toBeNull();
  });

  it(`${MIN_MEMBER_HEIGHT_CM}〜${MAX_MEMBER_HEIGHT_CM}cmの範囲外のheightは範囲内に丸める`, () => {
    const json = JSON.stringify({
      version: 2,
      members: [
        { id: 'id-1', name: 'メンバー1', color: '#ff0000', height: MAX_MEMBER_HEIGHT_CM + 50 },
      ],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-1': { x: 0, y: 0 } } }],
    });

    const result = parseShowJson(json);

    expect(result?.members[0].height).toBe(MAX_MEMBER_HEIGHT_CM);
  });

  it('formationsが空配列の場合はnullを返す（フォーメーションは1つ以上）', () => {
    const json = JSON.stringify({
      version: 2,
      members: [],
      formations: [],
    });

    expect(parseShowJson(json)).toBeNull();
  });

  it('フォーメーションの立ち位置が一部のメンバーに欠けている場合はnullを返す', () => {
    const json = JSON.stringify({
      version: 2,
      members: [
        { id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 },
        { id: 'id-2', name: 'メンバー2', color: '#00ff00', height: 150 },
      ],
      formations: [{ id: 'f-1', name: 'フォーメーション1', positions: { 'id-1': { x: 0, y: 0 } } }],
    });

    expect(parseShowJson(json)).toBeNull();
  });

  it('positionsに、どのメンバーにも対応しないキーが含まれる場合は捨てる', () => {
    const json = JSON.stringify({
      version: 2,
      members: [{ id: 'id-1', name: 'メンバー1', color: '#ff0000', height: 170 }],
      formations: [
        {
          id: 'f-1',
          name: 'フォーメーション1',
          positions: { 'id-1': { x: 0, y: 0 }, 'unknown-member': { x: 1, y: 1 } },
        },
      ],
    });

    const result = parseShowJson(json);

    expect(result?.formations[0].positions).toEqual({ 'id-1': { x: 0, y: 0 } });
  });
});
