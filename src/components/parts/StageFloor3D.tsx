import { STAGE_DEPTH, STAGE_WIDTH } from '../../domain/stageConstants';

/** ステージ床面（1.6 ステージ）。床面は Y=0（2.2 座標系）。 */
export function StageFloor3D() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[STAGE_WIDTH, STAGE_DEPTH]} />
      <meshStandardMaterial color="#5b4636" />
    </mesh>
  );
}
