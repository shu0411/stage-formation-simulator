import { Canvas, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { PersonModel } from '../parts/PersonModel';
import { StageFloor3D } from '../parts/StageFloor3D';
import { useAppState } from '../../state/useAppState';
import { STAGE_DEPTH, STAGE_HEIGHT } from '../../domain/stageConstants';

/** 客席中央からステージ全体を見る固定位置・注視点（1.5 3D プレビュー、1.1 対象外: 視点切り替え）。 */
const CAMERA_POSITION: [number, number, number] = [0, 6, STAGE_DEPTH / 2 + 10];
// 注視点はステージ天面（1.6 ステージ）を基準に、その少し上（人物モデルの高さ程度）を見る
const CAMERA_LOOK_AT: [number, number, number] = [0, STAGE_HEIGHT + 1, 0];
const CAMERA_FOV = 50;

function FixedCamera() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...CAMERA_POSITION);
    camera.lookAt(...CAMERA_LOOK_AT);
  }, [camera]);

  return null;
}

/** 3D ビュー（1.4 画面構成、1.5 3D プレビュー）。フォーメーションの現在の状態を常に表示する。 */
export function FormationView3D() {
  const state = useAppState();

  return (
    <Canvas camera={{ fov: CAMERA_FOV }} shadows>
      <FixedCamera />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <StageFloor3D />
      {state.formation.members.map((member) => (
        <PersonModel key={member.id} member={member} />
      ))}
    </Canvas>
  );
}
