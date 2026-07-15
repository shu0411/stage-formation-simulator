/**
 * 前後方向の増減ボタンの aria-label を、Y 軸の増減の向き（1.6 座標系）に連動させる。
 * direction が -1（現在の設定）のときは値の増加が手前（前）へ向かい、
 * 1 のときは奥（後ろ）へ向かう。将来 Y_AXIS_SCALE.direction が変わっても、
 * ラベルが実際の向きと矛盾しないようにする。
 */
export function frontBackSpinnerLabels(direction: 1 | -1): {
  increment: string;
  decrement: string;
} {
  return direction === -1
    ? { increment: '前へ', decrement: '後ろへ' }
    : { increment: '後ろへ', decrement: '前へ' };
}
