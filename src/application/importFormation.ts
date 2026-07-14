import { parseFormationJson } from '../domain/serialization';
import type { Formation } from '../domain/types';
import type { FormationFileIO } from './ports';

/**
 * ファイルを読み込んでフォーメーションに変換する（1.5 JSON インポート、2.3 インポート）。
 * 不正な形式の場合は null を返す（2.4 インポート失敗）。
 */
export async function importFormation(
  file: File,
  fileIO: FormationFileIO,
): Promise<Formation | null> {
  const text = await fileIO.read(file);
  return parseFormationJson(text);
}
