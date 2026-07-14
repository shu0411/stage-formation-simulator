/** 2D の立ち位置を 3D 空間の座標へ写像する（2.2: x → X軸、y → −Z軸、床面 Y=0）。 */
export function toScenePosition(position: { x: number; y: number }): [number, number, number] {
  // `+ 0` は y=0 のとき -0 になるのを防ぐ（Object.is で 0 と -0 は区別されるため）
  return [position.x, 0, -position.y + 0];
}
