import { parseShowJson } from '../domain/serialization';
import type { Show } from '../domain/types';
import type { FormationStorage } from './ports';

/**
 * 保存先から演目を復元する（1.5 保存・復元、2.3 復元）。
 * 保存データがない場合、または破損している場合は null を返す（2.4 破損データ）。
 */
export function restoreShow(storage: FormationStorage): Show | null {
  const json = storage.load();
  if (json === null) {
    return null;
  }
  return parseShowJson(json);
}
