import { Html } from '@react-three/drei';
import { toScenePosition } from '../../domain/sceneMapping';
import type { Member } from '../../domain/types';
import './PersonModel.css';

type PersonModelProps = {
  member: Member;
};

const BODY_HEIGHT = 1.2;
const BODY_RADIUS = 0.25;
const HEAD_RADIUS = 0.2;

/** メンバー1人分の簡易人物モデルと名前ラベル（1.5 3D プレビュー）。 */
export function PersonModel({ member }: PersonModelProps) {
  const [x, , z] = toScenePosition(member);

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, BODY_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[BODY_RADIUS, BODY_RADIUS, BODY_HEIGHT, 16]} />
        <meshStandardMaterial color="#4a7dff" />
      </mesh>
      <mesh position={[0, BODY_HEIGHT + HEAD_RADIUS, 0]}>
        <sphereGeometry args={[HEAD_RADIUS, 16, 16]} />
        <meshStandardMaterial color="#f4c99b" />
      </mesh>
      <Html position={[0, BODY_HEIGHT + HEAD_RADIUS * 2 + 0.2, 0]} center>
        <span className="person-model__label">{member.name}</span>
      </Html>
    </group>
  );
}
