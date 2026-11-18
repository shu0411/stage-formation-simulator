import { serializeShow } from '../domain/serialization';
import type { Show } from '../domain/types';
import type { FormationStorage } from './ports';

/** 現在の演目を保存先へ保存する（1.5 保存・復元、2.3 保存）。 */
export function saveShow(show: Show, storage: FormationStorage): void {
  storage.save(serializeShow(show));
}
