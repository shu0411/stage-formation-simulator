import { Html } from '@react-three/drei';
import { STAGE_DEPTH, STAGE_HALF_WIDTH, STAGE_HEIGHT } from '../../domain/stageConstants';
import './StageDirectionLabels.css';

/** ステージ端からラベルを外側に離す距離（m）。ステージ・人物モデルと重ならないよう目視調整。 */
const MARGIN = 1;

/**
 * 3D ビュー上に常時表示する方向ラベル（1.5 3D プレビュー）。
 * x 軸の +X 側が上手、-X 側が下手（`MemberPositionInput.tsx` のスピナーラベルと同じ前提）、
 * z 軸の +Z 側が客席側（`sceneMapping.ts` の座標系）に対応する。
 */
export function StageDirectionLabels() {
  return (
    <>
      <Html position={[STAGE_HALF_WIDTH + MARGIN, STAGE_HEIGHT, 0]} center zIndexRange={[1, 0]}>
        <span className="stage-direction-label">上手</span>
      </Html>
      <Html position={[-STAGE_HALF_WIDTH - MARGIN, STAGE_HEIGHT, 0]} center zIndexRange={[1, 0]}>
        <span className="stage-direction-label">下手</span>
      </Html>
      <Html position={[0, STAGE_HEIGHT, STAGE_DEPTH / 2 + MARGIN]} center zIndexRange={[1, 0]}>
        <span className="stage-direction-label">客席側</span>
      </Html>
    </>
  );
}
