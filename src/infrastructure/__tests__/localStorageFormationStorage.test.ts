import { beforeEach, describe, expect, it } from 'vitest';
import {
  localStorageFormationStorage,
  FORMATION_STORAGE_KEY,
} from '../localStorageFormationStorage';

describe('localStorageFormationStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('保存したJSON文字列をキー stage-formation-simulator:formation で読み出せる（2.2 LocalStorageのキー）', () => {
    localStorageFormationStorage.save('{"version":1,"members":[]}');

    expect(localStorage.getItem(FORMATION_STORAGE_KEY)).toBe('{"version":1,"members":[]}');
    expect(localStorageFormationStorage.load()).toBe('{"version":1,"members":[]}');
  });

  it('保存データがない場合はnullを返す', () => {
    expect(localStorageFormationStorage.load()).toBeNull();
  });
});
