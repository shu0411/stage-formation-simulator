import type { FormationFileIO } from '../application/ports';

/** FormationFileIO のブラウザファイル I/O 実装（2.1 infrastructure）。 */
export const fileFormationIO: FormationFileIO = {
  read(file: File): Promise<string> {
    return file.text();
  },
  download(json: string, filename: string): void {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  },
};
