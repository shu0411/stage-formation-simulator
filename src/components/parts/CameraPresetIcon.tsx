import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import type { CameraPresetId } from '../../domain/cameraPresets';

/** プリセットごとの位置関係を表す`@mui/icons-material`のアイコン（仕様: アイコンの導入方法）。 */
const PRESET_ICONS: Record<CameraPresetId, typeof CameraAltIcon> = {
  left: ArrowBackIcon,
  center: CameraAltIcon,
  right: ArrowForwardIcon,
  front: ZoomInIcon,
  back: ZoomOutIcon,
};

type CameraPresetIconProps = {
  presetId: CameraPresetId;
};

/**
 * カメラ位置プリセットを表す装飾アイコン（仕様: アイコンの意味）。アクセシブルネームは
 * 呼び出し側のテキストラベルに委ねるため`aria-hidden`を付与する。
 */
export function CameraPresetIcon({ presetId }: CameraPresetIconProps) {
  const Icon = PRESET_ICONS[presetId];
  return <Icon aria-hidden="true" fontSize="small" />;
}
