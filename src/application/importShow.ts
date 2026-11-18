import { parseShowJson } from '../domain/serialization';
import type { Show } from '../domain/types';
import type { FormationFileIO } from './ports';

/**
 * ファイルを読み込んで演目に変換する（1.5 JSON インポート、2.3 インポート）。
 * 不正な形式の場合は null を返す（2.4 インポート失敗）。
 */
export async function importShow(file: File, fileIO: FormationFileIO): Promise<Show | null> {
  const text = await fileIO.read(file);
  return parseShowJson(text);
}
