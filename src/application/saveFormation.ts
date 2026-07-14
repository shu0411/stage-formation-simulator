import { serializeFormation } from '../domain/serialization';
import type { Formation } from '../domain/types';
import type { FormationStorage } from './ports';

/** 現在のフォーメーションを保存先へ保存する（1.5 保存・復元、2.3 保存）。 */
export function saveFormation(formation: Formation, storage: FormationStorage): void {
  storage.save(serializeFormation(formation));
}
