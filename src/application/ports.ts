/** フォーメーションの永続化先（2.1 application: ports）。infrastructure が実装する。 */
export interface FormationStorage {
  save(json: string): void;
  load(): string | null;
}

/** フォーメーションのファイル入出力（2.1 application: ports）。infrastructure が実装する。 */
export interface FormationFileIO {
  read(file: File): Promise<string>;
  download(json: string, filename: string): void;
}
