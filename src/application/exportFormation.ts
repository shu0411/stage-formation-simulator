import { serializeFormation } from '../domain/serialization';
import type { Formation } from '../domain/types';
import type { FormationFileIO } from './ports';

const EXPORT_FILE_NAME = 'formation.json';

/** 現在のフォーメーションを JSON ファイルとしてダウンロードさせる（1.5 JSON エクスポート、2.3 エクスポート）。 */
export function exportFormation(formation: Formation, fileIO: FormationFileIO): void {
  fileIO.download(serializeFormation(formation), EXPORT_FILE_NAME);
}
