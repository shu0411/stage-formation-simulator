import { Html } from '@react-three/drei';
import { toScenePosition } from '../../domain/sceneMapping';
import type { Member } from '../../domain/types';
import './PersonModel.css';

type PersonModelProps = {
  member: Member;
};

const BODY_RADIUS = 0.25;
const HEAD_RADIUS = 0.2;

/**
 * メンバー1人分の簡易人物モデルと名前ラベル（1.5 3D プレビュー）。
 * 頭部・胴体の半径は身長によらず固定し、胴体の高さのみ身長（cm）に応じて
 * 伸縮する（頭部のバランスを保つため。1.5 メンバー身長編集）。
 */
export function PersonModel({ member }: PersonModelProps) {
  const [x, y, z] = toScenePosition(member);
  const bodyHeight = member.height / 100 - HEAD_RADIUS * 2;

  return (
    <group position={[x, y, z]}>
      <mesh position={[0, bodyHeight / 2, 0]}>
        <cylinderGeometry args={[BODY_RADIUS, BODY_RADIUS, bodyHeight, 16]} />
        <meshStandardMaterial color={member.color} />
      </mesh>
      <mesh position={[0, bodyHeight + HEAD_RADIUS, 0]}>
        <sphereGeometry args={[HEAD_RADIUS, 16, 16]} />
        <meshStandardMaterial color="#f4c99b" />
      </mesh>
      {/* zIndexRange: Drei の既定値(最大約1677万)は画面UIのz-indexを軽く上回ってしまうため、
          ポップアップ等のUIが名前ラベルより手前に出せるよう小さい範囲に制限する */}
      <Html position={[0, bodyHeight + HEAD_RADIUS * 2 + 0.2, 0]} center zIndexRange={[1, 0]}>
        <span className="person-model__label">{member.name}</span>
      </Html>
    </group>
  );
}
