import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export type EditorLayout = 'desktop' | 'mobilePortrait' | 'mobileLandscape';

/** モバイル横表示の条件（高さ 600px 未満の横向き）。sm ブレークポイントの丸めに合わせて 599.95px とする。 */
const MOBILE_LANDSCAPE_QUERY = '(orientation: landscape) and (max-height: 599.95px)';

/**
 * 2D 編集ポップアップのレイアウトをビューポートに応じて判定する
 * （design.md 1.6 対応環境、2.1 UI コンポーネントライブラリ）。
 * `matchMedia` のない環境（jsdom）では両方のクエリが `false` を返すため、
 * 既存のコンポーネントテストは常に `'desktop'` として動く。
 */
export function useEditorLayout(): EditorLayout {
  const theme = useTheme();
  const isMobileLandscape = useMediaQuery(MOBILE_LANDSCAPE_QUERY);
  const isMobilePortrait = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobileLandscape) {
    return 'mobileLandscape';
  }
  if (isMobilePortrait) {
    return 'mobilePortrait';
  }
  return 'desktop';
}
