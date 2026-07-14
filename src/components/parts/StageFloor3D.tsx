import { STAGE_DEPTH, STAGE_HEIGHT, STAGE_WIDTH } from '../../domain/stageConstants';

/** ステージ（1.6 ステージ）。厚み STAGE_HEIGHT の直方体とし、天面が Y=STAGE_HEIGHT になるよう配置する。 */
export function StageFloor3D() {
  return (
    <mesh position={[0, STAGE_HEIGHT / 2, 0]} receiveShadow castShadow>
      <boxGeometry args={[STAGE_WIDTH, STAGE_HEIGHT, STAGE_DEPTH]} />
      <meshStandardMaterial color="#5b4636" />
    </mesh>
  );
}
