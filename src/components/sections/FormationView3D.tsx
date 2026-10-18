import { CameraControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { CameraControls as CameraControlsImpl } from '@react-three/drei';
import { PersonModel } from '../parts/PersonModel';
import { StageDirectionLabels } from '../parts/StageDirectionLabels';
import { StageFloor3D } from '../parts/StageFloor3D';
import { useAppState } from '../../state/useAppState';
import { CAMERA_LOOK_AT, toCameraScenePosition } from '../../domain/cameraPresets';
import type { CameraPresetId } from '../../domain/cameraPresets';

const CAMERA_FOV = 50;

type PresetCameraProps = {
  presetId: CameraPresetId;
};

/**
 * 選択中のカメラプリセット（仕様: カメラ位置の切り替え）へカメラを移動させる。
 * ユーザーのドラッグ・ホイール・タッチ操作は `enabled={false}` で無効化する
 * （#30 で自由移動に使う想定のため、ライブラリ自体は Canvas に組み込んでおく）。
 */
function PresetCamera({ presetId }: PresetCameraProps) {
  const controlsRef = useRef<CameraControlsImpl>(null);
  const isFirstMoveRef = useRef(true);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }
    const [x, y, z] = toCameraScenePosition(presetId);
    const [lookAtX, lookAtY, lookAtZ] = CAMERA_LOOK_AT;
    const animate = !isFirstMoveRef.current;
    isFirstMoveRef.current = false;
    void controls.setLookAt(x, y, z, lookAtX, lookAtY, lookAtZ, animate);
  }, [presetId]);

  return <CameraControls ref={controlsRef} enabled={false} />;
}

/** 3D ビュー（1.4 画面構成、1.5 3D プレビュー）。フォーメーションの現在の状態を常に表示する。 */
export function FormationView3D() {
  const state = useAppState();

  return (
    <Canvas camera={{ fov: CAMERA_FOV }} shadows>
      <PresetCamera presetId={state.cameraPresetId} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <StageFloor3D />
      <StageDirectionLabels />
      {state.formation.members.map((member) => (
        <PersonModel key={member.id} member={member} />
      ))}
    </Canvas>
  );
}
