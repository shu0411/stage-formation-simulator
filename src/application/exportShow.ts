import { serializeShow } from '../domain/serialization';
import type { Show } from '../domain/types';
import type { FormationFileIO } from './ports';

const EXPORT_FILE_NAME = 'formation.json';

/** 現在の演目を JSON ファイルとしてダウンロードさせる（1.5 JSON エクスポート、2.3 エクスポート）。 */
export function exportShow(show: Show, fileIO: FormationFileIO): void {
  fileIO.download(serializeShow(show), EXPORT_FILE_NAME);
}
