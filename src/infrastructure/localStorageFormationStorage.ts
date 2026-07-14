import type { FormationStorage } from '../application/ports';

/** LocalStorage のキー（2.2 永続化・交換フォーマット）。 */
export const FORMATION_STORAGE_KEY = 'stage-formation-simulator:formation';

/** FormationStorage の LocalStorage 実装（2.1 infrastructure）。 */
export const localStorageFormationStorage: FormationStorage = {
  save(json: string): void {
    localStorage.setItem(FORMATION_STORAGE_KEY, json);
  },
  load(): string | null {
    return localStorage.getItem(FORMATION_STORAGE_KEY);
  },
};
